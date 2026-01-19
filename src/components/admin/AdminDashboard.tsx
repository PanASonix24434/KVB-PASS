import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import { BarChart3, Users, FileText, Shield, Clock, CheckCircle, XCircle, TrendingUp, Megaphone, UserPlus, MessageCircle } from 'lucide-react';
import AnnouncementBanner from '../shared/AnnouncementBanner';
import AnnouncementManager from '../shared/AnnouncementManager';
import UserManagement from '../shared/UserManagement';
import LiveChatWidget from '../shared/LiveChatWidget';

interface AdminDashboardProps {
  handleNavigation?: (itemId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ handleNavigation }) => {
  const { user } = useAuth();
  const { applications, securityLogs, stats } = useApplications();
  const [showUserManagement, setShowUserManagement] = React.useState(false);

  // Calculate additional stats
  const todayLogs = securityLogs.filter(log => {
    const today = new Date();
    const logDate = new Date(log.timestamp);
    return logDate.toDateString() === today.toDateString();
  });

  const weeklyApplications = applications.filter(app => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(app.createdAt) >= weekAgo;
  });

  const approvalRate = stats.totalApplications > 0 
    ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
    : 0;

  const recentApplications = applications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentLogs = securityLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Diluluskan';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Announcements */}
      <AnnouncementBanner />

      {/* Welcome Section */}
      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 scroll-container">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 animate-scroll-text">
                Welcome to Kolej Vokasional Besut Permission System ( KVB-PASS )
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Program Badge */}
      <div className="bg-red-500 text-white text-center py-3 rounded-lg">
        <span className="font-medium">PENTADBIR SISTEM KVB-PASS</span>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Stats Card */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {stats.totalApplications}
              </div>
              <div className="text-orange-100">
                Jumlah Permohonan
              </div>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        {/* User Management Card */}
        <div 
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowUserManagement(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium mb-1">
                Click To View
              </div>
              <div className="text-purple-100">
                Pengurusan Pengguna
              </div>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        {/* System Reports Card */}
        <div 
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            if (user?.role === 'admin') {
              handleNavigation?.('statistics');
            }
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium mb-1">
                Rekod
              </div>
              <div className="text-blue-100">
                Laporan Sistem
              </div>
            </div>
            <FileText className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Main Stats */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowUserManagement(true)}
              className="inline-flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Urus Pengguna</span>
            </button>
          </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jumlah Permohonan</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
              <p className="text-xs text-gray-500 mt-1">Sepanjang masa</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kadar Kelulusan</p>
              <p className="text-2xl font-bold text-green-600">{approvalRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Daripada semua permohonan</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pelajar Di Luar</p>
              <p className="text-2xl font-bold text-orange-600">{stats.studentsOut}</p>
              <p className="text-xs text-gray-500 mt-1">Pada masa ini</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktiviti Hari Ini</p>
              <p className="text-2xl font-bold text-purple-600">{todayLogs.length}</p>
              <p className="text-xs text-gray-500 mt-1">Log keluar/masuk</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menunggu Kelulusan</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Diluluskan</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedApplications}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedApplications}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Minggu Ini</p>
              <p className="text-2xl font-bold text-blue-600">{weeklyApplications.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Announcement Management */}
      <AnnouncementManager />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Permohonan Terkini</h2>
          </div>
          
          {recentApplications.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tiada permohonan lagi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentApplications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {application.studentName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {application.studentId} • {application.studentClass}
                      </p>
                      {application.dormitoryBlock && application.dormitoryRoom && (
                        <p className="text-sm text-gray-600 mb-1">
                          Asrama: {application.dormitoryBlock}{application.dormitoryRoom}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Sebab:</strong> {application.reason}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.createdAt).toLocaleString('ms-MY')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Security Logs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Log Keselamatan Terkini</h2>
          </div>
          
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tiada log keselamatan lagi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      log.action === 'exit' ? 'bg-orange-100' : 'bg-green-100'
                    }`}>
                      {log.action === 'exit' ? (
                        <Users className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Users className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {log.studentName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {log.action === 'exit' ? 'Keluar' : 'Masuk'} • {log.securityOfficer}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString('ms-MY')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.action === 'exit' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {log.action === 'exit' ? 'Keluar' : 'Masuk'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Ringkasan Sistem</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Permohonan</h3>
              <p className="text-sm text-gray-600">
                Sistem telah memproses {stats.totalApplications} permohonan dengan kadar kelulusan {approvalRate}%
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Keselamatan</h3>
              <p className="text-sm text-gray-600">
                {securityLogs.length} log keselamatan direkodkan dengan {stats.studentsOut} pelajar sedang di luar
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Prestasi</h3>
              <p className="text-sm text-gray-600">
                {stats.todayApplications} permohonan hari ini dengan {todayLogs.length} aktiviti keselamatan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}

    </div>
  );
};

export default AdminDashboard;