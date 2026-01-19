import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Shield, Phone, Home, GraduationCap, Users, Save, AlertCircle } from 'lucide-react';
import { StudentProfile } from '../../types';

interface ProfileCompletionProps {
  onComplete: () => void;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ onComplete }) => {
  const { user, updateUserProfile } = useAuth();
  
  const [formData, setFormData] = useState<StudentProfile>({
    email: user?.email || '',
    fullName: user?.name || '',
    icNumber: user?.icNumber || '',
    gender: 'Lelaki',
    phoneNumber: '',
    homeAddress: '',
    residenceStatus: 'Pelajar Asrama',
    program: 'Teknologi Maklumat',
    studyYear: 'Tahun 1 SVM',
    dormitoryBlock: '',
    dormitoryRoom: '',
    parentName: '',
    parentPhone: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    phoneNumber: '',
    parentPhone: ''
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

  const handlePhoneNumberChange = (field: 'phoneNumber' | 'parentPhone') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericOnly = value.replace(/\D/g, '');
    const limitedValue = numericOnly.slice(0, 12);
    
    setFormData(prev => ({ ...prev, [field]: limitedValue }));
    
    const validation = validatePhoneNumber(limitedValue);
    setValidationErrors(prev => ({
      ...prev,
      [field]: validation.error
    }));
  };
  const programs = [
    'Teknologi Maklumat',
    'Teknologi Automotif', 
    'Teknologi Elektrik',
    'Teknologi Pemesinan Industri',
    'Teknologi Penyejukan dan Penyamanan Udara',
    'Teknologi Pembinaan',
    'Teknologi Kimpalan',
    'Seni Kulinari',
    'Pengurusan Pelancongan'
  ];

  const studyYears = [
    'Tahun 1 SVM',
    'Tahun 2 SVM', 
    'Tahun 1 DVM',
    'Tahun 2 DVM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    await updateUserProfile(formData);
    setIsSubmitting(false);
    onComplete();
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getDormitoryRooms = (block: string) => {
    switch (block) {
      case 'U': return ['U1', 'U2', 'U3', 'U4', 'U5', 'U7'];
      case 'T': return ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      case 'V': return ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'];
      case 'S': return ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
      case 'R': return ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'];
      default: return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Maklumat Akaun</h2>
              <p className="text-gray-600">Tetapkan alamat e-mel dan kata laluan anda</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat E-mel *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contoh@gmail.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Maklumat Log Masuk</p>
                    <p>Untuk log masuk selepas ini, gunakan:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Nombor K/P:</strong> {user?.icNumber}</li>
                      <li><strong>Kata Laluan:</strong> Kata laluan semasa anda</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Maklumat Peribadi</h2>
              <p className="text-gray-600">Lengkapkan maklumat peribadi anda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Penuh *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Pengguna *
                </label>
                <input
                  type="text"
                  value={formData.icNumber}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jantina *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'Lelaki' | 'Perempuan' }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Lelaki">Lelaki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombor Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handlePhoneNumberChange('phoneNumber')}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0144003429"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {validationErrors.phoneNumber && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.phoneNumber}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Format: 10-12 digit nombor sahaja (contoh: 0144003429)
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Rumah *
                </label>
                <textarea
                  value={formData.homeAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, homeAddress: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan alamat rumah lengkap"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Pasport *
                </label>
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-32 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                    {formData.profilePhoto ? (
                      <img 
                        src={formData.profilePhoto} 
                        alt="Gambar Pasport" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <User className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Gambar</p>
                        <p className="text-xs text-gray-500">Pasport</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">Klik untuk muat naik gambar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Create preview URL
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  profilePhoto: event.target?.result as string 
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Format: JPG, PNG (Maksimum 2MB)<br/>
                        Saiz: Gambar bersaiz pasport
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Gambar ini digunakan untuk pengesahan identiti dan surat kebenaran digital
                    </p>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Kepentingan Gambar Pasport:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Digunakan untuk pengesahan identiti oleh pengawal keselamatan</li>
                        <li>Dipaparkan bersama surat kebenaran digital</li>
                        <li>Boleh dikemas kini melalui profil pelajar jika perlu</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Kediaman *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, residenceStatus: 'Pelajar Asrama' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.residenceStatus === 'Pelajar Asrama'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Home className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Pelajar Asrama</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, residenceStatus: 'Pelajar Harian' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.residenceStatus === 'Pelajar Harian'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Pelajar Harian</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Maklumat Akademik</h2>
              <p className="text-gray-600">Maklumat program dan tahun pengajian</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kos/Program Pengajian *
                </label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value as any }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Pengajian *
                </label>
                <select
                  value={formData.studyYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, studyYear: e.target.value as any }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {studyYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {formData.residenceStatus === 'Pelajar Asrama' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Maklumat Asrama</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Blok Asrama *
                      </label>
                      <select
                        value={formData.dormitoryBlock || ''}
                        onChange={(e) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            dormitoryBlock: e.target.value,
                            dormitoryRoom: ''
                          }));
                        }}
                        required
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Blok Asrama</option>
                        <option value="U">Blok U</option>
                        <option value="T">Blok T</option>
                        <option value="V">Blok V</option>
                        <option value="S">Blok S</option>
                        <option value="R">Blok R</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Dorm *
                      </label>
                      <select
                        value={formData.dormitoryRoom || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, dormitoryRoom: e.target.value }))}
                        required
                        disabled={!formData.dormitoryBlock}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Pilih Dorm</option>
                        {formData.dormitoryBlock && getDormitoryRooms(formData.dormitoryBlock).map(room => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Maklumat Ibu Bapa/Penjaga</h2>
              <p className="text-gray-600">Maklumat untuk tujuan kecemasan</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Ibu Bapa/Penjaga *
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama penuh ibu bapa atau penjaga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombor Telefon Ibu Bapa/Penjaga *
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={handlePhoneNumberChange('parentPhone')}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0144003429"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {validationErrors.parentPhone && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.parentPhone}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Format: 10-12 digit nombor sahaja (contoh: 0144003429)
                </p>
              </div>

              {/* Profile Summary */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Profil</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nama:</strong> {formData.fullName}</p>
                    <p><strong>K/P:</strong> {formData.icNumber}</p>
                    <p><strong>Jantina:</strong> {formData.gender}</p>
                    <p><strong>Telefon:</strong> {formData.phoneNumber}</p>
                  </div>
                  <div>
                    <p><strong>Program:</strong> {formData.program}</p>
                    <p><strong>Tahun:</strong> {formData.studyYear}</p>
                    <p><strong>Status:</strong> {formData.residenceStatus}</p>
                    {formData.residenceStatus === 'Pelajar Asrama' && formData.dormitoryBlock && formData.dormitoryRoom && (
                      <p><strong>Asrama:</strong> {formData.dormitoryBlock}{formData.dormitoryRoom}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/logo_kv copy.png" 
            alt="Kolej Vokasional Besut" 
            className="w-32 h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lengkapkan Profil Pelajar</h1>
          <p className="text-gray-600">Sila lengkapkan maklumat profil anda sebelum menggunakan sistem KVB-PASS</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-8 text-sm text-gray-600">
            <span className={currentStep === 1 ? 'font-medium text-blue-600' : ''}>Akaun</span>
            <span className={currentStep === 2 ? 'font-medium text-blue-600' : ''}>Peribadi</span>
            <span className={currentStep === 3 ? 'font-medium text-blue-600' : ''}>Akademik</span>
            <span className={currentStep === 4 ? 'font-medium text-blue-600' : ''}>Ibu Bapa</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kembali
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Seterusnya
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sedang Menyimpan...' : 'Lengkapkan Profil'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;