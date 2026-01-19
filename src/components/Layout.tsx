import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield, Users, FileText, BarChart3, Settings, CreditCard as Edit, Menu, X, Home, Plus, Clock, CheckCircle, Search, Megaphone, MessageCircle } from 'lucide-react';
import ProfileEditor from './shared/ProfileEditor';
import SystemMaintenance from './shared/SystemMaintenance';
import UserManagement from './shared/UserManagement';
import DarkModeToggle from './shared/DarkModeToggle';
import StatisticsModal from './shared/StatisticsModal';
import AdminLiveChatManager from './admin/AdminLiveChatManager';
import AlertModal from './shared/AlertModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [showProfileEditor, setShowProfileEditor] = React.useState(false);
  const [showSystemMaintenance, setShowSystemMaintenance] = React.useState(false);
  const [showUserManagement, setShowUserManagement] = React.useState(false);
  const [showStatistics, setShowStatistics] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showAdminLiveChat, setShowAdminLiveChat] = React.useState(false);
  const [liveChatNotifications, setLiveChatNotifications] = React.useState(0);
  const [navigationAction, setNavigationAction] = React.useState<string | null>(null);
  const [modalState, setModalState] = React.useState<{
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

  // Get active users count from localStorage
  const getActiveUsersCount = () => {
    const storedUsers = localStorage.getItem('kvpass_all_users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      return users.length;
    }
    return 6; // Default count
  };

  // Get unread live chat count for admin
  const getUnreadLiveChatCount = React.useCallback(() => {
    if (user?.role !== 'admin') return 0;
    
    const adminNotifications = JSON.parse(localStorage.getItem('kvpass_admin_chat_notifications') || '{}');
    let unreadCount = 0;
    
    Object.values(adminNotifications).forEach((count) => {
      if (typeof count === 'number') {
        unreadCount += count;
      }
    });
    
    return unreadCount;
  }, [user?.role]);

  // Handle navigation clicks
  const handleNavigation = (itemId: string) => {
    // Handle navigation based on itemId
    switch (itemId) {
      case 'dashboard':
        // Already on dashboard - scroll to top or refresh
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
        
      case 'statistics':
        setShowStatistics(true);
        break;
        
      case 'user-management':
        setShowUserManagement(true);
        break;
        
      case 'announcements': {
        // Scroll to announcement section
        const announcementSection = document.querySelector('[data-section="announcements"]');
        if (announcementSection) {
          announcementSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      }
        
      case 'maintenance':
        setShowSystemMaintenance(true);
        break;
        
      case 'pending': {
        // Scroll to pending applications section
        const pendingSection = document.querySelector('[data-section="pending"]');
        if (pendingSection) {
          pendingSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      }
        
      case 'all-applications':
        // Show all applications view
        setModalState({
          isOpen: true,
          type: 'info',
          title: 'Maklumat',
          message: 'Fungsi "Semua Permohonan" akan dibuka'
        });
        break;
        
      case 'verification': {
        // Scroll to verification section
        const verificationSection = document.querySelector('[data-section="verification"]');
        if (verificationSection) {
          verificationSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      }
        
      case 'security-logs': {
        // Scroll to security logs section
        const logsSection = document.querySelector('[data-section="security-logs"]');
        if (logsSection) {
          logsSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      }
        
      case 'apply':
        // Student apply for permission
        if (user?.role === 'student') {
          setNavigationAction('apply');
          // Trigger notification to appropriate staff
          const currentHour = new Date().getHours();
          const isWorkingHours = currentHour >= 8 && currentHour < 17;
          
          const notification = {
            id: Date.now().toString(),
            type: 'new_application',
            message: `Permohonan baru daripada ${user.name}`,
            targetRole: isWorkingHours ? 'hep' : 'warden',
            timestamp: new Date(),
            read: false
          };
          
          // Store notification
          const existingNotifications = JSON.parse(localStorage.getItem('kvpass_notifications') || '[]');
          localStorage.setItem('kvpass_notifications', JSON.stringify([...existingNotifications, notification]));
        }
        break;
        
      case 'my-applications':
        // Show student's applications
        setNavigationAction('my-applications');
        break;
        
      case 'digital-pass':
        // Show digital pass
        setNavigationAction('digital-pass');
        break;
        
      default:
        console.log(`Navigation to: ${itemId}`);
    }
    
    // Close mobile sidebar after navigation
    setSidebarOpen(false);
    
    // Clear navigation action after a short delay to allow re-triggering
    setTimeout(() => setNavigationAction(null), 100);
  };

  // Check for new live chat notifications (admin only)
  React.useEffect(() => {
    const checkLiveChatNotifications = () => {
      if (user?.role === 'admin') {
        const unreadCount = getUnreadLiveChatCount();
        setLiveChatNotifications(unreadCount);
      }
    };

    checkLiveChatNotifications();
    const interval = setInterval(checkLiveChatNotifications, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, [user, getUnreadLiveChatCount]);

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'student': return 'Pelajar';
      case 'hep': return 'Ketua HEP';
      case 'warden': return 'Ketua Warden';
      case 'security': return 'Pegawai Keselamatan';
      case 'admin': return 'Pentadbir Sistem';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'hep': return 'bg-green-100 text-green-800';
      case 'warden': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', id: 'dashboard' }
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...baseItems,
          { icon: Plus, label: 'Mohon Kebenaran', id: 'apply' },
          { icon: FileText, label: 'Permohonan Saya', id: 'my-applications' },
          { icon: CheckCircle, label: 'Pas Digital', id: 'digital-pass' }
        ];
      case 'hep':
      case 'warden':
        return [
          ...baseItems,
          { icon: Clock, label: 'Permohonan Menunggu', id: 'pending' },
          { icon: FileText, label: 'Semua Permohonan', id: 'all-applications' },
          { icon: Megaphone, label: 'Pengumuman', id: 'announcements' }
        ];
      case 'security':
        return [
          ...baseItems,
          { icon: Search, label: 'Pengesahan Pelajar', id: 'verification' },
          { icon: Shield, label: 'Log Keselamatan', id: 'security-logs' }
        ];
      case 'admin':
        return [
          ...baseItems,
          { icon: BarChart3, label: 'Statistik Sistem', id: 'statistics' },
          { icon: Users, label: 'Pengurusan Pengguna', id: 'user-management' },
          { icon: Megaphone, label: 'Pengumuman', id: 'announcements' },
          { icon: Settings, label: 'Penyelenggaraan', id: 'maintenance' }
        ];
      default:
        return baseItems;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo_kv copy.png" 
              alt="KVB Logo" 
              className="w-12 h-12 object-contain filter brightness-0 invert"
            />
            <div className="text-white">
              <div className="text-sm font-bold">KVB-PASS</div>
              <div className="text-xs text-gray-300">{user?.icNumber}</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            MAIN CATEGORY
          </div>
          <nav className="space-y-1">
            {getNavigationItems().map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={() => handleNavigation(item.id)}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-gray-700">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            APPEARANCE
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setShowProfileEditor(true)}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
            >
              <Edit className="w-5 h-5 mr-3" />
              Edit Profil
            </button>
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Users className="w-5 h-5 mr-3" />
                  Urus Pengguna
                </button>
                <button
                  onClick={() => setShowSystemMaintenance(true)}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Penyelenggaraan
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Header */}
        <header className="bg-theme-primary shadow-sm border-b border-theme-primary h-16">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="p-2 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary transition-colors"
                  title="Edit Profil Pengguna"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              
              {/* Chat Notification Bell (Admin Only) */}
              {user?.role === 'admin' && (
                <div className="relative">
                  <button 
                    onClick={() => setShowAdminLiveChat(true)}
                    className="p-2 text-theme-secondary hover:text-theme-primary relative"
                    title="Live Chat dari Pengguna"
                  >
                    <MessageCircle className="w-6 h-6" />
                    {liveChatNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {liveChatNotifications}
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Active Users: {getActiveUsersCount()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <img src="/logo_kv copy.png" alt="Kolej Vokasional Besut" className="h-8 w-auto object-contain" />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-theme-primary">{user?.name}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                    <span>{getRoleDisplay(user?.role || '')}</span>
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 bg-theme-secondary min-h-screen">
          {React.cloneElement(children as React.ReactElement, { 
            handleNavigation: handleNavigation,
            navigationAction: navigationAction
          })}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Modals */}
      {showProfileEditor && (
        <ProfileEditor onClose={() => setShowProfileEditor(false)} />
      )}
      
      {showSystemMaintenance && (
        <SystemMaintenance onClose={() => setShowSystemMaintenance(false)} />
      )}
      
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
      
      {showStatistics && (
        <StatisticsModal onClose={() => setShowStatistics(false)} />
      )}
      
      {showAdminLiveChat && (
        <AdminLiveChatManager onClose={() => setShowAdminLiveChat(false)} />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </div>
  );
};

export default Layout;