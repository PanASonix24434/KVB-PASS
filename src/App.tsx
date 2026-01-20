import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import ProfileCompletion from './components/student/ProfileCompletion';
import StudentDashboard from './components/student/StudentDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import SecurityDashboard from './components/security/SecurityDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { useDarkMode } from './hooks/useDarkMode';
import { hasSupabaseConfig, missingSupabaseVars } from './lib/supabase';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  useDarkMode(); // Initialize dark mode
  const [showProfileCompletion, setShowProfileCompletion] = React.useState(false);

  // Show configuration error if Supabase is not configured
  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Konfigurasi Tidak Lengkap</h1>
            <p className="text-gray-700 mb-6">
              Aplikasi memerlukan konfigurasi Supabase untuk berfungsi. Sila pastikan fail <code className="bg-gray-100 px-2 py-1 rounded">.env</code> wujud dengan pembolehubah berikut:
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <ul className="list-disc list-inside space-y-2 text-gray-800">
                {missingSupabaseVars.map((varName) => (
                  <li key={varName} className="font-mono text-sm">{varName}</li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-blue-800 text-sm mb-2"><strong>Panduan:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                <li>Buat fail <code className="bg-white px-1 rounded">.env</code> di folder root projek</li>
                <li>Tambah pembolehubah yang diperlukan (lihat SUPABASE_SETUP.md)</li>
                <li>Mulakan semula pelayan pembangunan (npm run dev)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    if (user && user.role === 'student' && !user.profileCompleted) {
      setShowProfileCompletion(true);
    } else {
      setShowProfileCompletion(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Sedang memuatkan...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (showProfileCompletion) {
    return <ProfileCompletion onComplete={() => setShowProfileCompletion(false)} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'hep':
      case 'warden':
        return <StaffDashboard />;
      case 'security':
        return <SecurityDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Role tidak dikenali</div>;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <AppContent />
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;
