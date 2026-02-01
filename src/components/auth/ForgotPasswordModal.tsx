import React, { useState } from 'react';
import { X, Mail, Key, CheckCircle, AlertCircle, User, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { hashPassword } from '../../lib/authUtils';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    userId: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation functions
  const validateUserId = (value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    
    if (numericOnly.length === 0) {
      return { isValid: false, error: '' };
    }
    
    if (numericOnly.length !== 12) {
      return { isValid: false, error: 'ID Pengguna mesti 12 digit nombor.' };
    }
    
    return { isValid: true, error: '' };
  };

  const validatePassword = (value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    
    if (numericOnly.length === 0) {
      return { isValid: false, error: '' };
    }
    
    if (numericOnly.length !== 6) {
      return { isValid: false, error: 'Kata laluan mesti 6 digit nombor sahaja.' };
    }
    
    return { isValid: true, error: '' };
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericOnly = value.replace(/\D/g, '');
    const limitedValue = numericOnly.slice(0, 12);
    
    setFormData(prev => ({ ...prev, userId: limitedValue }));
    
    const validation = validateUserId(limitedValue);
    setValidationErrors(prev => ({
      ...prev,
      userId: validation.error
    }));
  };

  const handlePasswordChange = (field: 'newPassword' | 'confirmPassword') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericOnly = value.replace(/\D/g, '');
    const limitedValue = numericOnly.slice(0, 6);
    
    setFormData(prev => ({ ...prev, [field]: limitedValue }));
    
    const validation = validatePassword(limitedValue);
    setValidationErrors(prev => ({
      ...prev,
      [field]: validation.error
    }));
  };
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, ic_number, email')
        .eq('ic_number', formData.userId.trim())
        .maybeSingle();

      if (error || !data) {
        setError('User ID tidak dijumpai dalam sistem');
        setIsLoading(false);
        return;
      }

      if (data.email.toLowerCase() !== formData.email.trim().toLowerCase()) {
        setError('Alamat e-mel tidak sepadan dengan akaun ini');
        setIsLoading(false);
        return;
      }

      setVerifiedUserId(data.id);
      localStorage.setItem('reset_user_id', data.id);

      setIsLoading(false);
      setStep('reset');
    } catch {
      setError('Ralat menyambung ke pelayan. Sila cuba lagi.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Kata laluan tidak sepadan');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Kata laluan mestilah sekurang-kurangnya 6 digit');
      return;
    }

    const userId = verifiedUserId || localStorage.getItem('reset_user_id');
    if (!userId) {
      setError('Sesi tamat. Sila mulakan semula.');
      return;
    }

    setIsLoading(true);

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('ic_number')
        .eq('id', userId)
        .single();

      const icNumber = (userData as { ic_number?: string })?.ic_number || '';
      const passwordHash = await hashPassword(formData.newPassword, icNumber);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      localStorage.removeItem('reset_otp');
      localStorage.removeItem('reset_user_id');
      setStep('success');
    } catch {
      setError('Gagal menetapkan kata laluan baru. Sila cuba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'request':
        return (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Lupa Kata Laluan</h2>
              <p className="text-gray-600">Masukkan User ID dan alamat e-mel berdaftar anda</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                User ID *
              </label>
              <input
                type="text"
                value={formData.userId}
                onChange={handleUserIdChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan User ID anda"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {validationErrors.userId && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.userId}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Format: 12 digit nombor sahaja (contoh: 000000000000)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Alamat E-mel *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contoh@kv.edu.my"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mengesahkan...' : 'Sahkan & Tetapkan Semula Kata Laluan'}
            </button>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tetapkan Kata Laluan Baharu</h2>
              <p className="text-gray-600">Masukkan kata laluan baharu untuk akaun anda</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kata Laluan Baharu *
              </label>
              <input
                type="text"
                value={formData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {validationErrors.newPassword && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.newPassword}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Format: 6 digit nombor sahaja (contoh: 123456)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sahkan Kata Laluan *
              </label>
              <input
                type="text"
                value={formData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Keperluan Kata Laluan:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tepat 6 digit nombor sahaja</li>
                    <li>Tiada huruf atau simbol dibenarkan</li>
                    <li>Contoh yang sah: 123456, 884021</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Menetapkan...' : 'Tetapkan Kata Laluan'}
              </button>
            </div>
          </form>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Berjaya!</h2>
              <p className="text-gray-600 mb-4">
                Kata laluan anda telah berjaya ditetapkan semula.
              </p>
              <p className="text-sm text-gray-500">
                Anda kini boleh log masuk menggunakan kata laluan baharu.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Log Masuk
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo_kv copy.png" 
                alt="KVB Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">KVB-PASS</h1>
                <p className="text-sm text-gray-600">Pemulihan Kata Laluan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;