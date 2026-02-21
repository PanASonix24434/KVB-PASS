import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { hashPassword } from '../../lib/authUtils';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'validating' | 'form' | 'success' | 'invalid'>('validating');
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    const validateToken = async () => {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('user_id')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error || !data) {
        setStatus('invalid');
        return;
      }

      setUserId((data as { user_id: string }).user_id);
      setStatus('form');
    };

    validateToken();
  }, [token]);

  const validatePassword = (value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    if (numericOnly.length === 0) return '';
    if (numericOnly.length !== 6) return 'Kata laluan mesti 6 digit nombor sahaja.';
    return '';
  };

  const handlePasswordChange = (field: 'newPassword' | 'confirmPassword') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, [field]: value }));
    const err = validatePassword(value);
    setValidationErrors(prev => ({ ...prev, [field]: err }));
    if (field === 'confirmPassword' && formData.newPassword !== value) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: 'Kata laluan tidak sepadan.' }));
    } else if (field === 'confirmPassword' && formData.newPassword === value && err === '') {
      setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Kata laluan tidak sepadan');
      return;
    }

    const pwErr = validatePassword(formData.newPassword);
    if (pwErr) {
      setError(pwErr);
      return;
    }

    if (!userId || !token) return;

    setIsLoading(true);

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('ic_number')
        .eq('id', userId)
        .single();

      const icNumber = (userData as { ic_number?: string })?.ic_number || '';
      const passwordHash = await hashPassword(formData.newPassword, icNumber);

      await supabase
        .from('users')
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq('id', userId);

      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('token', token);

      setStatus('success');
    } catch {
      setError('Gagal menetapkan kata laluan. Sila cuba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengesahkan pautan...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        backgroundImage: 'url(/Background.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative z-10 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pautan Tidak Sah</h2>
          <p className="text-gray-600 mb-6">
            Pautan reset kata laluan telah tamat tempoh atau tidak sah. Sila minta pautan baharu melalui Lupa Kata Laluan.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Log Masuk
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        backgroundImage: 'url(/Background.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative z-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Berjaya!</h2>
          <p className="text-gray-600 mb-6">
            Kata laluan anda telah berjaya ditetapkan semula. Anda kini boleh log masuk menggunakan kata laluan baharu.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Log Masuk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      backgroundImage: 'url(/Background.jpeg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative z-10">
        <button
          onClick={() => navigate('/')}
          className="mb-4 inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tetapkan Kata Laluan Baharu</h2>
            <p className="text-gray-600">Masukkan kata laluan baharu untuk akaun anda</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kata Laluan Baharu *</label>
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
            <p className="text-gray-500 text-xs mt-1">6 digit nombor sahaja</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sahkan Kata Laluan *</label>
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Menetapkan...' : 'Tetapkan Kata Laluan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
