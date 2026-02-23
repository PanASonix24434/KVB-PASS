import React, { useState } from 'react';
import { FileText, LogIn, ArrowRight } from 'lucide-react';
import LoginForm from './LoginForm';
import StudentApplicationForm from './student/StudentApplicationForm';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showApplication, setShowApplication] = useState(false);

  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />;
  }

  if (showApplication) {
    return <StudentApplicationForm onBack={() => setShowApplication(false)} />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative mobile-bg-scroll"
      style={{
        backgroundImage: 'url(/Background.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40" aria-hidden="true" />
      
      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <img 
            src="/logo_kv copy.png" 
            alt="Kolej Vokasional Besut" 
            className="w-48 h-32 sm:w-64 sm:h-40 mx-auto mb-4 sm:mb-6 object-contain"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">KVB-PASS</h1>
          <p className="text-lg sm:text-xl text-white drop-shadow-md">Sistem Permohonan Pulang Awal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <button
            onClick={() => setShowApplication(true)}
            className="group bg-white rounded-2xl shadow-2xl p-6 sm:p-8 hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] transform"
          >
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Buat Permohonan</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Untuk pelajar kali pertama sahaja. Isi maklumat lengkap untuk pendaftaran dan permohonan.
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                <span>Mula Permohonan</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Log Masuk Button */}
          <button
            onClick={() => setShowLogin(true)}
            className="group bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 hover:scale-105 transform"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <LogIn className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Log Masuk</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Untuk semua pengguna: Pelajar, Admin, KHP, Warden Asrama, dan Pengawal Keselamatan.
              </p>
              <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                <span>Log Masuk Sekarang</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 sm:mt-8 bg-white bg-opacity-90 rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Maklumat Penting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="text-left">
                <p className="font-medium mb-2">📝 Buat Permohonan:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Untuk pelajar kali pertama sahaja</li>
                  <li>Isi maklumat lengkap</li>
                  <li>Menunggu pengesahan admin</li>
                </ul>
              </div>
              <div className="text-left">
                <p className="font-medium mb-2">🔐 Log Masuk:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Gunakan No. Kad Pengenalan</li>
                  <li>Gunakan kata laluan anda</li>
                  <li>Sistem akan mengesan peranan anda</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
