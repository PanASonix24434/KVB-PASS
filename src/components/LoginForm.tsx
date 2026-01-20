import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ForgotPasswordModal from './auth/ForgotPasswordModal';
import LoginSupportChat from './auth/LoginSupportChat';

export default function LoginForm() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});
  const { login } = useAuth();

  const validateUserId = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length !== 12) {
      return 'ID Pengguna mesti 12 digit nombor.';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length !== 6) {
      return 'Kata laluan mesti 6 digit nombor sahaja.';
    }
    return '';
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setUserId(value);
      const error = validateUserId(value);
      setErrors(prev => ({ ...prev, userId: error }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setPassword(value);
      const error = validatePassword(value);
      setErrors(prev => ({ ...prev, password: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userIdError = validateUserId(userId);
    const passwordError = validatePassword(password);
    
    if (userIdError || passwordError) {
      setErrors({ userId: userIdError, password: passwordError });
      return;
    }

    login(userId, password);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/Backgound.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/logo_kv copy.png" 
            alt="Kolej Vokasional Besut" 
            className="w-64 h-40 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">KVB-PASS</h1>
          <p className="text-gray-600">Sistem Permohonan Pulang Awal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Pengguna
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={userId}
                onChange={handleUserIdChange}
                placeholder="Masukkan No Kad Pengenalan"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.userId ? 'border-red-500' : 'border-gray-300'
                }`}
                inputMode="numeric"
                autoComplete="username"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">12 digit nombor sahaja</p>
            {errors.userId && (
              <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kata Laluan
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Masukkan Kata Laluan"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                inputMode="numeric"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">6 digit nombor sahaja</p>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
          >
            SIGN IN
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition duration-200"
            >
              Lupa Kata Laluan?
            </button>
          </div>
        </form>
      </div>

      {/* Chat Admin Button for Login Support */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowChat(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Chat dengan Admin - Bantuan Log Masuk"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Login Support Chat Modal */}
      {showChat && (
        <LoginSupportChat onClose={() => setShowChat(false)} />
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}