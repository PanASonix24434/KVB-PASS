import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApplications } from '../contexts/ApplicationContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { LogOut, User, Shield, Users, FileText, BarChart3, Settings, CreditCard as Edit, Menu, X, Home, Plus, Clock, CheckCircle, Search, Megaphone, MessageCircle, Bell, PanelLeftClose } from 'lucide-react';
import ProfileEditor from './shared/ProfileEditor';
import SystemMaintenance from './shared/SystemMaintenance';
import UserManagement from './shared/UserManagement';
import DarkModeToggle from './shared/DarkModeToggle';
import StatisticsModal from './shared/StatisticsModal';
import AdminLiveChatManager from './admin/AdminLiveChatManager';
import AlertModal from './shared/AlertModal';
import BackToTop from './shared/BackToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const BASE_PATH = '/app';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { getActiveAnnouncements } = useApplications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileEditor, setShowProfileEditor] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const activeAnnouncements = getActiveAnnouncements();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [showSystemMaintenance, setShowSystemMaintenance] = React.useState(false);
  const [showUserManagement, setShowUserManagement] = React.useState(false);
  const [showStatistics, setShowStatistics] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem('kvpass_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('kvpass_sidebar_collapsed', String(sidebarCollapsed));
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);
  const [showAdminLiveChat, setShowAdminLiveChat] = React.useState(false);
  const [liveChatNotifications, setLiveChatNotifications] = React.useState(0);
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

  // Path mapping for sidebar navigation
  const pathMap: Record<string, string> = {
    dashboard: `${BASE_PATH}/dashboard`,
    apply: `${BASE_PATH}/apply`,
    'my-applications': `${BASE_PATH}/applications`,
    'digital-pass': `${BASE_PATH}/digital-pass`,
    pending: `${BASE_PATH}/pending`,
    'all-applications': `${BASE_PATH}/all-applications`,
    announcements: `${BASE_PATH}/announcements`,
    verification: `${BASE_PATH}/verification`,
    'security-logs': `${BASE_PATH}/logs`,
    statistics: `${BASE_PATH}/statistics`,
    'user-management': `${BASE_PATH}/users`,
    maintenance: `${BASE_PATH}/maintenance`
  };

  // Redirect /app to /app/dashboard
  useEffect(() => {
    if (location.pathname === '/app') {
      navigate(`${BASE_PATH}/dashboard`, { replace: true });
    }
  }, [location.pathname, navigate]);

  // Sync URL with modals - open when navigating to modal routes
  useEffect(() => {
    const path = location.pathname;
    if (path === `${BASE_PATH}/statistics`) setShowStatistics(true);
    else if (path === `${BASE_PATH}/users`) setShowUserManagement(true);
    else if (path === `${BASE_PATH}/maintenance`) setShowSystemMaintenance(true);
  }, [location.pathname]);

  // Derive navigationAction from URL for dashboards
  const currentSection = location.pathname.replace(BASE_PATH, '').replace(/^\//, '') || 'dashboard';
  const effectiveNavigationAction = 
    currentSection === 'applications' ? 'my-applications' :
    currentSection === 'logs' ? 'security-logs' :
    currentSection === 'users' ? 'user-management' : currentSection;

  // Handle navigation - for programmatic calls (e.g. from dashboard cards)
  const handleNavigation = (itemId: string) => {
    const path = pathMap[itemId];
    if (path) navigate(path);

    if (itemId === 'apply' && user?.role === 'student') {
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
      const existingNotifications = JSON.parse(localStorage.getItem('kvpass_notifications') || '[]');
      localStorage.setItem('kvpass_notifications', JSON.stringify([...existingNotifications, notification]));
    }

    setSidebarOpen(false);
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
      { icon: Home, label: 'Dashboard', id: 'dashboard', path: `${BASE_PATH}/dashboard` }
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...baseItems,
          { icon: Plus, label: 'Mohon Kebenaran', id: 'apply', path: `${BASE_PATH}/apply` },
          { icon: FileText, label: 'Permohonan Saya', id: 'my-applications', path: `${BASE_PATH}/applications` },
          { icon: CheckCircle, label: 'Pas Digital', id: 'digital-pass', path: `${BASE_PATH}/digital-pass` }
        ];
      case 'hep':
      case 'warden':
        return [
          ...baseItems,
          { icon: Clock, label: 'Permohonan Menunggu', id: 'pending', path: `${BASE_PATH}/pending` },
          { icon: FileText, label: 'Semua Permohonan', id: 'all-applications', path: `${BASE_PATH}/all-applications` },
          { icon: Megaphone, label: 'Pengumuman', id: 'announcements', path: `${BASE_PATH}/announcements` }
        ];
      case 'security':
        return [
          ...baseItems,
          { icon: Search, label: 'Pengesahan Pelajar', id: 'verification', path: `${BASE_PATH}/verification` },
          { icon: Shield, label: 'Log Keselamatan', id: 'security-logs', path: `${BASE_PATH}/logs` }
        ];
      case 'admin':
        return [
          ...baseItems,
          { icon: BarChart3, label: 'Statistik Sistem', id: 'statistics', path: `${BASE_PATH}/statistics` },
          { icon: Users, label: 'Pengurusan Pengguna', id: 'user-management', path: `${BASE_PATH}/users` },
          { icon: Megaphone, label: 'Pengumuman', id: 'announcements', path: `${BASE_PATH}/announcements` },
          { icon: Settings, label: 'Penyelenggaraan', id: 'maintenance', path: `${BASE_PATH}/maintenance` }
        ];
      default:
        return baseItems;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Mobile: overlay, Desktop: collapsible */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-gray-800 flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64`}
      >
        {/* Header */}
        <div className={`flex items-center bg-gray-900 border-b border-gray-700 flex-shrink-0 ${sidebarCollapsed ? 'lg:justify-center lg:px-2 h-16' : 'justify-between px-4 h-20'}`}>
          <div className={`flex items-center min-w-0 ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : 'space-x-3 flex-1'}`}>
            <button
              type="button"
              onClick={() => sidebarCollapsed && setSidebarCollapsed(false)}
              className={`flex-shrink-0 flex items-center justify-center bg-white rounded-lg overflow-hidden p-1 outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
                ${sidebarCollapsed ? 'w-10 h-10 lg:cursor-pointer lg:hover:ring-2 lg:hover:ring-blue-400' : 'w-12 h-10 cursor-default'}
                `}
              title={sidebarCollapsed ? 'Klik untuk buka menu' : undefined}
            >
              <img
                src="/logo_kv.png"
                alt="Logo KV"
                className="h-full w-auto object-contain"
              />
            </button>
            {!sidebarCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">KVB-PASS</div>
                  <div className="text-xs text-gray-400 truncate" title={user?.studentId ? `No. Matrik: ${user.studentId}` : user?.icNumber || '—'}>
                    {user?.studentId || user?.icNumber || '—'}
                  </div>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden lg:flex flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                  title="Tutup menu"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex-shrink-0 p-1 text-gray-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Nav */}
        <div className={`py-4 flex-1 overflow-y-auto sidebar-nav ${sidebarCollapsed ? 'lg:px-2' : 'px-4'}`} role="navigation">
          {!sidebarCollapsed && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              MAIN CATEGORY
            </div>
          )}
          <nav className="space-y-1">
            {getNavigationItems().map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center rounded-md transition-colors
                    ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                    ${sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3 px-3 py-2' : 'px-3 py-2'}
                    `}
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Appearance / Settings */}
        <div className={`py-4 border-t border-gray-700 flex-shrink-0 ${sidebarCollapsed ? 'lg:px-2' : 'px-4'}`}>
          {!sidebarCollapsed && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              APPEARANCE
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => setShowProfileEditor(true)}
              className={`w-full flex items-center text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors
                ${sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3 px-3 py-2' : 'px-3 py-2'}
                `}
              title={sidebarCollapsed ? 'Edit Profil' : undefined}
            >
              <Edit className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Edit Profil</span>}
            </button>
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setShowUserManagement(true)}
                  className={`w-full flex items-center text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors
                    ${sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3 px-3 py-2' : 'px-3 py-2'}
                    `}
                  title={sidebarCollapsed ? 'Urus Pengguna' : undefined}
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Urus Pengguna</span>}
                </button>
                <button
                  onClick={() => setShowSystemMaintenance(true)}
                  className={`w-full flex items-center text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors
                    ${sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3 px-3 py-2' : 'px-3 py-2'}
                    `}
                  title={sidebarCollapsed ? 'Penyelenggaraan' : undefined}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Penyelenggaraan</span>}
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
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
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary transition-colors relative"
                    title="Notifikasi / Pengumuman"
                  >
                    <Bell className="w-5 h-5" />
                    {activeAnnouncements.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                        {activeAnnouncements.length > 3 ? '3+' : activeAnnouncements.length}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                        <h3 className="font-semibold text-gray-900">Pengumuman</h3>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {activeAnnouncements.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 text-sm">
                            Tiada pengumuman
                          </div>
                        ) : (
                          activeAnnouncements.map((ann) => (
                            <div
                              key={ann.id}
                              className="p-4 border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
                            >
                              <p className="font-medium text-gray-900 text-sm mb-1">{ann.title}</p>
                              <p className="text-gray-600 text-xs line-clamp-2">{ann.content}</p>
                              <p className="text-gray-400 text-xs mt-2">
                                {ann.createdBy} • {new Date(ann.createdAt).toLocaleDateString('ms-MY')}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
        <main className="p-4 md:p-6 bg-theme-secondary min-h-screen">
          <NavigationProvider handleNavigation={handleNavigation} navigationAction={effectiveNavigationAction}>
            {children}
          </NavigationProvider>
        </main>
      </div>

      {/* Back to top button */}
      <BackToTop />

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
        <SystemMaintenance onClose={() => { setShowSystemMaintenance(false); navigate(`${BASE_PATH}/dashboard`); }} />
      )}
      
      {showUserManagement && (
        <UserManagement onClose={() => { setShowUserManagement(false); navigate(`${BASE_PATH}/dashboard`); }} />
      )}
      
      {showStatistics && (
        <StatisticsModal onClose={() => { setShowStatistics(false); navigate(`${BASE_PATH}/dashboard`); }} />
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