import React, { useState } from 'react';
import { User, Shield, Phone, Home, GraduationCap, Users, Save, AlertCircle, ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { StudentProfile } from '../../types';
import { supabase } from '../../lib/supabase';
import AlertModal from '../shared/AlertModal';

interface StudentApplicationFormProps {
  onBack: () => void;
}

const StudentApplicationForm: React.FC<StudentApplicationFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<StudentProfile & { password: string; confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    icNumber: '',
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
    icNumber: '',
    phoneNumber: '',
    parentPhone: '',
    password: '',
    confirmPassword: '',
    email: ''
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

  // IC Number validation (12 digits)
  const validateICNumber = (value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    if (numericOnly.length !== 12) {
      return { isValid: false, error: 'No. Kad Pengenalan mesti 12 digit nombor.' };
    }
    return { isValid: true, error: '' };
  };

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

  // Password validation
  const validatePassword = (value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    if (numericOnly.length !== 6) {
      return { isValid: false, error: 'Kata laluan mesti 6 digit nombor sahaja.' };
    }
    return { isValid: true, error: '' };
  };

  const handleICNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setFormData(prev => ({ ...prev, icNumber: value }));
      const validation = validateICNumber(value);
      setValidationErrors(prev => ({ ...prev, icNumber: validation.error }));
    }
  };

  const handlePhoneNumberChange = (field: 'phoneNumber' | 'parentPhone') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericOnly = value.replace(/\D/g, '');
    const limitedValue = numericOnly.slice(0, 12);
    setFormData(prev => ({ ...prev, [field]: limitedValue }));
    const validation = validatePhoneNumber(limitedValue);
    setValidationErrors(prev => ({ ...prev, [field]: validation.error }));
  };

  const handlePasswordChange = (field: 'password' | 'confirmPassword') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setFormData(prev => ({ ...prev, [field]: value }));
      const validation = validatePassword(value);
      setValidationErrors(prev => ({ ...prev, [field]: validation.error }));
      
      // Check password match
      if (field === 'confirmPassword' && formData.password !== value) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: 'Kata laluan tidak sepadan.' }));
      } else if (field === 'confirmPassword' && formData.password === value) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final validation
    const icError = validateICNumber(formData.icNumber);
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    const parentPhoneError = validatePhoneNumber(formData.parentPhone);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = formData.password !== formData.confirmPassword 
      ? { isValid: false, error: 'Kata laluan tidak sepadan.' }
      : { isValid: true, error: '' };

    if (!icError.isValid || !phoneError.isValid || !parentPhoneError.isValid || 
        !passwordError.isValid || !confirmPasswordError.isValid) {
      setValidationErrors({
        icNumber: icError.error,
        phoneNumber: phoneError.error,
        parentPhone: parentPhoneError.error,
        password: passwordError.error,
        confirmPassword: confirmPasswordError.error,
        email: ''
      });
      setIsSubmitting(false);
      return;
    }

    // Check if IC number already exists
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('ic_number')
        .eq('ic_number', formData.icNumber.trim())
        .maybeSingle();

      if (existingUser) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'No. Kad Pengenalan Sudah Wujud',
          message: 'No. Kad Pengenalan ini sudah didaftarkan dalam sistem. Sila log masuk atau hubungi admin jika terdapat masalah.'
        });
        setIsSubmitting(false);
        return;
      }

      // Create student account with pending status
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name: formData.fullName.trim(),
          ic_number: formData.icNumber.trim(),
          email: formData.email.trim(),
          role: 'student',
          password_hash: formData.password, // TODO: Hash password properly
          profile_completed: false,
          profile: {
            ...formData,
            password: undefined, // Don't store password in profile
            confirmPassword: undefined
          },
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Ralat',
          message: 'Ralat semasa mencipta akaun. Sila cuba lagi atau hubungi admin.'
        });
        setIsSubmitting(false);
        return;
      }

      // Success
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Permohonan Berjaya Dihantar!',
        message: `Permohonan anda telah berjaya dihantar untuk semakan.\n\nNo. Kad Pengenalan: ${formData.icNumber}\n\nAkaun anda akan diaktifkan selepas disahkan oleh pihak berautoriti. Sila tunggu notifikasi atau hubungi admin untuk maklumat lanjut.\n\nAnda boleh log masuk selepas akaun diaktifkan.`
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Ralat',
        message: 'Ralat semasa menghantar permohonan. Sila cuba lagi.'
      });
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    let canProceed = true;
    
    if (currentStep === 1) {
      // Validate account info
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        canProceed = false;
      }
      if (formData.password !== formData.confirmPassword) {
        canProceed = false;
      }
    } else if (currentStep === 2) {
      // Validate personal info
      if (!formData.fullName || !formData.icNumber || !formData.phoneNumber || !formData.homeAddress) {
        canProceed = false;
      }
      const icError = validateICNumber(formData.icNumber);
      if (!icError.isValid) {
        canProceed = false;
      }
    } else if (currentStep === 3) {
      // Validate academic info
      if (!formData.program || !formData.studyYear) {
        canProceed = false;
      }
      if (formData.residenceStatus === 'Pelajar Asrama' && (!formData.dormitoryBlock || !formData.dormitoryRoom)) {
        canProceed = false;
      }
    } else if (currentStep === 4) {
      // Validate parent info
      if (!formData.parentName || !formData.parentPhone) {
        canProceed = false;
      }
    }

    if (canProceed && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Laluan *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={handlePasswordChange('password')}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="6 digit nombor sahaja"
                  inputMode="numeric"
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">6 digit nombor sahaja</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sahkan Kata Laluan *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handlePasswordChange('confirmPassword')}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan semula kata laluan"
                  inputMode="numeric"
                />
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Maklumat Log Masuk</p>
                    <p>Selepas permohonan anda disahkan, gunakan:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>No. Kad Pengenalan:</strong> (akan diisi di langkah seterusnya)</li>
                      <li><strong>Kata Laluan:</strong> Kata laluan yang anda tetapkan di atas</li>
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
                  No. Kad Pengenalan *
                </label>
                <input
                  type="text"
                  value={formData.icNumber}
                  onChange={handleICNumberChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12 digit nombor"
                  inputMode="numeric"
                />
                {validationErrors.icNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.icNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">12 digit nombor sahaja</p>
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
                />
                {validationErrors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">10-12 digit nombor sahaja</p>
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
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-blue-600 hover:text-blue-700 font-medium">Klik untuk muat naik gambar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
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
                />
                {validationErrors.parentPhone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.parentPhone}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">10-12 digit nombor sahaja</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Profil</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nama:</strong> {formData.fullName || '-'}</p>
                    <p><strong>K/P:</strong> {formData.icNumber || '-'}</p>
                    <p><strong>Jantina:</strong> {formData.gender}</p>
                    <p><strong>Telefon:</strong> {formData.phoneNumber || '-'}</p>
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

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Semakan Akhir</h2>
              <p className="text-gray-600">Sila semak semua maklumat sebelum menghantar</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Maklumat Akaun</h3>
                <p className="text-sm text-gray-700">E-mel: {formData.email}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Maklumat Peribadi</h3>
                <p className="text-sm text-gray-700">Nama: {formData.fullName}</p>
                <p className="text-sm text-gray-700">No. K/P: {formData.icNumber}</p>
                <p className="text-sm text-gray-700">Jantina: {formData.gender}</p>
                <p className="text-sm text-gray-700">Telefon: {formData.phoneNumber}</p>
                <p className="text-sm text-gray-700">Alamat: {formData.homeAddress}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Maklumat Akademik</h3>
                <p className="text-sm text-gray-700">Program: {formData.program}</p>
                <p className="text-sm text-gray-700">Tahun: {formData.studyYear}</p>
                <p className="text-sm text-gray-700">Status: {formData.residenceStatus}</p>
                {formData.residenceStatus === 'Pelajar Asrama' && formData.dormitoryBlock && formData.dormitoryRoom && (
                  <p className="text-sm text-gray-700">Asrama: {formData.dormitoryBlock}{formData.dormitoryRoom}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Maklumat Ibu Bapa/Penjaga</h3>
                <p className="text-sm text-gray-700">Nama: {formData.parentName}</p>
                <p className="text-sm text-gray-700">Telefon: {formData.parentPhone}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Penting:</p>
                  <p>Permohonan anda akan dihantar untuk semakan oleh pihak berautoriti. Akaun anda akan diaktifkan selepas disahkan. Sila tunggu notifikasi atau hubungi admin untuk maklumat lanjut.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/logo_kv copy.png" 
            alt="Kolej Vokasional Besut" 
            className="w-32 h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Permohonan</h1>
          <p className="text-gray-600">Daftar sebagai pelajar baru - Isi maklumat lengkap untuk permohonan</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-6 text-sm text-gray-600">
            <span className={currentStep === 1 ? 'font-medium text-blue-600' : ''}>Akaun</span>
            <span className={currentStep === 2 ? 'font-medium text-blue-600' : ''}>Peribadi</span>
            <span className={currentStep === 3 ? 'font-medium text-blue-600' : ''}>Akademik</span>
            <span className={currentStep === 4 ? 'font-medium text-blue-600' : ''}>Ibu Bapa</span>
            <span className={currentStep === 5 ? 'font-medium text-blue-600' : ''}>Semakan</span>
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
                onClick={currentStep === 1 ? onBack : prevStep}
                className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentStep === 1 ? 'Kembali ke Halaman Utama' : 'Kembali'}</span>
              </button>
              
              {currentStep < 5 ? (
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
                  <span>{isSubmitting ? 'Sedang Menghantar...' : 'Hantar Permohonan'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
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

export default StudentApplicationForm;
