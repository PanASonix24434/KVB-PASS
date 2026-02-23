import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import { ArrowLeft, Upload, Calendar, Clock, MapPin, Phone, FileText } from 'lucide-react';
import AlertModal from '../shared/AlertModal';

// Helper to check if profile has minimum required data for application
const isProfileComplete = (user: { profile?: { fullName?: string; parentName?: string; parentPhone?: string; profilePhoto?: string; program?: string; studyYear?: string } | null } | null): boolean => {
  if (!user?.profile) return false;
  const p = user.profile;
  if (!p.fullName || !p.parentName || !p.parentPhone) return false;
  const phoneValid = p.parentPhone && p.parentPhone.replace(/\D/g, '').length >= 10;
  if (!phoneValid) return false;
  return true;
};

interface ApplicationFormProps {
  onBack: () => void;
  /** When set, application is routed to this role instead of time-based logic (e.g. when student chose warden from dashboard). */
  forceRouteTo?: 'hep' | 'warden';
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onBack, forceRouteTo }) => {
  const { user, updateStudentId } = useAuth();
  const { submitApplication, uploadSupportingDocuments } = useApplications();
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  
  useEffect(() => {
    if (user && user.role === 'student' && !isProfileComplete(user)) {
      setShowIncompleteProfileModal(true);
    }
  }, [user]);

  const hasSyncedMatrik = useRef(false);
  useEffect(() => {
    if (user?.studentId && !hasSyncedMatrik.current) {
      setFormData(prev => ({ ...prev, noMatrik: user.studentId || '' }));
      hasSyncedMatrik.current = true;
    }
  }, [user?.studentId]);
  
  const [formData, setFormData] = useState({
    reason: '',
    customReason: '',
    exitDate: '',
    exitTime: '',
    returnDate: '',
    returnTime: '',
    destination: '',
    emergencyContact: '',
    emergencyPhone: '',
    supportingDocuments: [] as string[],
    dormitoryBlock: user?.dormitoryBlock || '',
    dormitoryRoom: user?.dormitoryRoom || '',
  });

  const [supportingDocumentFiles, setSupportingDocumentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    noMatrik: '',
    emergencyPhone: ''
  });
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Phone number validation
  const validatePhoneNumber = (value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    
    if (numericOnly.length === 0) {
      return { isValid: false, error: '' };
    }
    
    if (numericOnly.length < 10 || numericOnly.length > 12) {
      return { isValid: false, error: 'Nombor telefon mesti 10–12 digit nombor.' };
    }
    
    return { isValid: true, error: '' };
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericOnly = value.replace(/\D/g, '');
    const limitedValue = numericOnly.slice(0, 12);
    
    setFormData(prev => ({ ...prev, emergencyPhone: limitedValue }));
    
    const validation = validatePhoneNumber(limitedValue);
    setValidationErrors(prev => ({
      ...prev,
      emergencyPhone: validation.error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileIncomplete) {
      setShowIncompleteProfileModal(true);
      return;
    }
    
    setIsSubmitting(true);

    // Determine routing based on day and time
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes; // Convert to minutes for easier comparison
    
    // Use forced routing when opened from dashboard "Hantar" warden choice; otherwise use time-based routing
    let routeTo: 'hep' | 'warden' = 'hep';
    let routingReason = '';
    
    if (forceRouteTo) {
      routeTo = forceRouteTo;
      routingReason = forceRouteTo === 'warden'
        ? 'Permohonan dihantar kepada Warden melalui pilihan di dashboard'
        : 'Permohonan dihantar kepada KHP melalui pilihan di dashboard';
    } else {
      // Time-based routing
      if (dayOfWeek >= 0 && dayOfWeek <= 3) {
        if (currentTime >= 17 * 60) {
          routeTo = user?.profile?.residenceStatus === 'Pelajar Asrama' ? 'warden' : 'hep';
          routingReason = user?.profile?.residenceStatus === 'Pelajar Asrama' 
            ? 'Pelajar asrama selepas 5:00 petang → Warden'
            : 'Pelajar harian selepas 5:00 petang → KHP';
        } else {
          routeTo = 'hep';
          routingReason = 'Ahad-Rabu sebelum 5:00 petang → KHP';
        }
      } else if (dayOfWeek === 4) {
        if (currentTime < 13 * 60) {
          routeTo = user?.profile?.residenceStatus === 'Pelajar Asrama' ? 'warden' : 'hep';
          routingReason = user?.profile?.residenceStatus === 'Pelajar Asrama'
            ? 'Khamis sebelum 1:00 petang - Pelajar asrama → Warden'
            : 'Khamis sebelum 1:00 petang - Pelajar harian → KHP';
        } else {
          routeTo = 'warden';
          routingReason = 'Khamis selepas 1:00 petang → Warden sahaja';
        }
      } else if (dayOfWeek === 5 || dayOfWeek === 6) {
        routeTo = 'warden';
        routingReason = 'Jumaat & Sabtu → Warden sahaja';
      }
    }

    const applicationData = {
      studentId: user?.studentId || user?.id || '',
      studentName: user?.name || '',
      studentIc: user?.icNumber || '',
      studentClass: user?.class || '',
      status: 'pending' as const,
      applicationId: '',
      routedTo: routeTo,
      routingReason: routingReason,
      ...formData,
      supportingDocuments: [] as string[],
    };

    try {
      const createdApplication = await submitApplication(applicationData);

      let documentUploadFailed = false;
      if (supportingDocumentFiles.length > 0) {
        try {
          await uploadSupportingDocuments(createdApplication.id, supportingDocumentFiles);
        } catch (uploadErr) {
          documentUploadFailed = true;
        }
      }

      if (user?.role === 'student' && user?.studentId) {
        try {
          await updateStudentId(user.studentId);
        } catch {
          /* ignore update student_id failure */
        }
      }

      setIsSubmitting(false);

      const successMessage = documentUploadFailed
        ? `ID Permohonan: ${createdApplication.applicationId}\n\nPermohonan dihantar kepada: ${routeTo === 'hep' ? 'Ketua HEP' : 'Warden Asrama'}\n\nSebab: ${routingReason}\n\nSila simpan ID ini untuk rujukan.\n\nNota: Muat naik dokumen sokongan tidak berjaya. Permohonan anda telah disimpan. Sila hubungi pentadbir jika anda perlu memuat naik dokumen.`
        : `ID Permohonan: ${createdApplication.applicationId}\n\nPermohonan dihantar kepada: ${routeTo === 'hep' ? 'Ketua HEP' : 'Warden Asrama'}\n\nSebab: ${routingReason}\n\nSila simpan ID ini untuk rujukan.`;

      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Permohonan Berjaya!',
        message: successMessage
      });
    } catch (error) {
      setIsSubmitting(false);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Ralat',
        message: 'Ralat semasa menghantar permohonan. Sila cuba lagi.'
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileNames = files.map(file => file.name);
    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...prev.supportingDocuments, ...fileNames],
    }));
    setSupportingDocumentFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index),
    }));
    setSupportingDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const reasonOptions = [
    'Temu janji doktor/hospital',
    'Urusan keluarga penting',
    'Pulang ke rumah',
    'Urusan bank/kewangan',
    'Temu janji rasmi',
    'Kecemasan keluarga',
    'Lain-lain'
  ];

  const isHostelStudent = user?.profile?.residenceStatus === 'Pelajar Asrama';
  const profileIncomplete = user && user.role === 'student' && !isProfileComplete(user);

  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-2">
      {profileIncomplete && (
        <AlertModal
          isOpen={showIncompleteProfileModal}
          onClose={() => {
            setShowIncompleteProfileModal(false);
            onBack();
          }}
          type="warning"
          title="Profil Tidak Lengkap"
          message="Sila lengkapkan profil anda (nama ibu bapa/penjaga, nombor telefon kecemasan) melalui Edit Profil sebelum membuat permohonan keluar."
          buttonText="Kembali ke Dashboard"
        />
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Borang Permohonan Kebenaran Keluar</h1>
              <p className="text-sm text-gray-600">Sila isi maklumat dengan lengkap dan tepat</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Student Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Pelajar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. Matrik *</label>
                  <input
                    type="text"
                    value={user?.studentId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, studentId: val }));
                    }}
                    placeholder="Contoh: 24DTK001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">No. Matrik akan disimpan sebagai No. Pelajar</p>
                  {validationErrors.noMatrik && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.noMatrik}</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Penuh</label>
                <input
                  type="text"
                  value={user?.profile?.fullName || user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Pengguna</label>
                <input
                  type="text"
                  value={user?.icNumber || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">ID Pengguna tidak boleh diubah</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Pengajian</label>
                <input
                  type="text"
                  value={user?.profile?.program || user?.class || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Pengajian</label>
                <input
                  type="text"
                  value={user?.profile?.studyYear || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Kediaman</label>
                <input
                  type="text"
                  value={user?.profile?.residenceStatus || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              {isHostelStudent && user?.profile?.dormitoryBlock && user?.profile?.dormitoryRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asrama</label>
                  <input
                    type="text"
                    value={`${user.profile.dormitoryBlock}${user.profile.dormitoryRoom}`}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Butiran Permohonan</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Sebab Keluar *
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih sebab keluar</option>
                {reasonOptions.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {formData.reason === 'Lain-lain' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nyatakan Sebab Lain *
                </label>
                <textarea
                  value={formData.customReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, customReason: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sila nyatakan sebab keluar yang lebih terperinci..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Destinasi *
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Hospital Kuala Lumpur, Rumah di Selangor"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Tarikh Keluar *
                </label>
                <input
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, exitDate: e.target.value }))}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Masa Keluar *
                </label>
                <input
                  type="time"
                  value={formData.exitTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, exitTime: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Tarikh Balik *
                </label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                  required
                  min={formData.exitDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Masa Balik *
                </label>
                <input
                  type="time"
                  value={formData.returnTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnTime: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Maklumat Kecemasan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kenalan Kecemasan *
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={user?.profile?.parentName || "Nama ibu bapa/penjaga"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  No. Telefon Kecemasan *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={handlePhoneNumberChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={user?.profile?.parentPhone || "0144003429"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {validationErrors.emergencyPhone && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.emergencyPhone}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Format: 10-12 digit nombor sahaja (contoh: 0144003429)
                </p>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Dokumen Sokongan</h2>
            <p className="text-sm text-gray-600">
              Muat naik dokumen sokongan seperti surat temu janji, tiket bas, atau surat rasmi keluarga
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">Klik untuk muat naik fail</span>
                <span className="text-gray-500"> atau seret fail ke sini</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Format yang diterima: PDF, JPG, PNG, DOC, DOCX (Maksimum 5MB setiap fail)
              </p>
            </div>

            {formData.supportingDocuments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Fail yang dimuat naik:</h3>
                {formData.supportingDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-700">{doc}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Buang
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sedang Menghantar...' : 'Hantar Permohonan'}
            </button>
          </div>
        </form>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={modalState.isOpen}
        onClose={() => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          if (modalState.type === 'success') {
            onBack();
          }
        }}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        buttonText={modalState.type === 'success' ? 'Baik' : 'Tutup'}
      />
    </div>
  );
};

export default ApplicationForm;