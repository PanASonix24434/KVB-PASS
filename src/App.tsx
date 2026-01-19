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

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  useDarkMode(); // Initialize dark mode
  const [showProfileCompletion, setShowProfileCompletion] = React.useState(false);

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
