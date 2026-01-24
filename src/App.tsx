import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import ProfileCompletion from './components/student/ProfileCompletion';
import StudentDashboard from './components/student/StudentDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import SecurityDashboard from './components/security/SecurityDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { useDarkMode } from './hooks/useDarkMode';
import { hasSupabaseConfig, missingSupabaseVars } from './lib/supabase';
import ErrorBoundary from './components/ErrorBoundary';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sedang memuatkan...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Safety check: ensure user has required properties
  if (!user.id || !user.role) {
    console.error('Invalid user object:', user);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ralat Data Pengguna</h1>
          <p className="text-gray-700 mb-6">Data pengguna tidak lengkap. Sila log masuk semula.</p>
          <button
            onClick={() => {
              localStorage.removeItem('kvpass_user');
              window.location.reload();
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log Masuk Semula
          </button>
        </div>
      </div>
    );
  }

  if (showProfileCompletion) {
    return <ProfileCompletion onComplete={() => setShowProfileCompletion(false)} />;
  }

  const renderDashboard = () => {
    try {
      console.log('Rendering dashboard for role:', user.role, 'User:', user);
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
          console.warn('Unknown user role:', user.role);
          return (
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">Role tidak dikenali: {user.role}</p>
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering dashboard:', error);
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Ralat semasa memuatkan dashboard. Sila muat semula halaman.</p>
            <p className="text-red-600 text-sm mt-2">Error: {error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      );
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
    <ErrorBoundary>
      <AuthProvider>
        <ApplicationProvider>
          <AppContent />
        </ApplicationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
