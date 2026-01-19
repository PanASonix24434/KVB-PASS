import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import { FileText, Clock, CheckCircle, XCircle, Eye, MessageSquare, Megaphone, Filter, Search, Building, Users, MessageCircle } from 'lucide-react';
import ApplicationReview from './ApplicationReview';
import AnnouncementBanner from '../shared/AnnouncementBanner';
import AnnouncementForm from '../shared/AnnouncementForm';
import LiveChatWidget from '../shared/LiveChatWidget';

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getPendingApplications, stats } = useApplications();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  // Warden-specific filters
  const [filters, setFilters] = useState({
    dormitoryBlock: 'all',
    dormitoryRoom: 'all',
    status: 'all',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const pendingApplications = getPendingApplications();
  
  // Filter applications based on routing rules
  const relevantApplications = pendingApplications.filter(app => {
    // Show applications routed to current user's role
    if (user?.role === 'hep') {
      return app.routedTo === 'hep' || !app.routedTo; // Include legacy applications without routing
    } else if (user?.role === 'warden') {
      return app.routedTo === 'warden' || !app.routedTo; // Include legacy applications without routing
    }
    return true;
  });

  // Apply additional filters for Warden
  const filteredApplications = relevantApplications.filter(app => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        app.studentName.toLowerCase().includes(searchLower) ||
        app.studentIc.includes(filters.searchTerm) ||
        app.applicationId.includes(filters.searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Dormitory block filter (for Warden)
    if (user?.role === 'warden' && filters.dormitoryBlock !== 'all') {
      if (app.dormitoryBlock !== filters.dormitoryBlock) return false;
    }

    // Dormitory room filter (for Warden)
    if (user?.role === 'warden' && filters.dormitoryRoom !== 'all') {
      if (app.dormitoryRoom !== filters.dormitoryRoom) return false;
    }

    return true;
  });

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'hep': return 'Ketua Hal Ehwal Pelajar';
      case 'warden': return 'Ketua Warden Asrama';
      default: return 'Pegawai';
    }
  };

  const getWorkingHoursText = (role: string) => {
    switch (role) {
      case 'hep': return 'Waktu Bertugas: 8:00 AM - 5:00 PM (Hari Bekerja)';
      case 'warden': return 'Waktu Bertugas: Selepas 5:00 PM, Hujung Minggu & Cuti Umum';
      default: return '';
    }
  };

  // Helper function for dormitory rooms
  function getDormitoryRooms(block: string) {
    switch (block) {
      case 'U': return ['U1', 'U2', 'U3', 'U4', 'U5', 'U7'];
      case 'T': return ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      case 'V': return ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'];
      case 'S': return ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
      case 'R': return ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'];
      default: return [];
    }
  }

  if (selectedApplication) {
    return (
      <ApplicationReview
        applicationId={selectedApplication}
        onBack={() => setSelectedApplication(null)}
      />
    );
  }

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
          <button
            onClick={() => setShowAnnouncementForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span>Buat Pengumuman</span>
          </button>
        </div>
      </div>

      {/* Program Badge */}
      <div className="bg-red-500 text-white text-center py-3 rounded-lg">
        <span className="font-medium">{getRoleTitle(user?.role || '').toUpperCase()}</span>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Applications Card */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {filteredApplications.length}
              </div>
              <div className="text-orange-100">
                Permohonan Menunggu
              </div>
            </div>
            <Clock className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        {/* Announcements Card */}
        <div 
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowAnnouncementForm(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium mb-1">
                Click To View
              </div>
              <div className="text-purple-100">
                Buat Pengumuman
              </div>
            </div>
            <Megaphone className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        {/* Reports Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium mb-1">
                Rekod
              </div>
              <div className="text-blue-100">
                Laporan Kelulusan
              </div>
            </div>
            <FileText className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Permohonan Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600">{filteredApplications.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jumlah Permohonan</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
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
      </div>

      {/* Working Hours Status */}
      <div className={`rounded-xl p-4 ${isWorkingHours ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isWorkingHours ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <div>
            <p className={`font-medium ${isWorkingHours ? 'text-green-800' : 'text-orange-800'}`}>
              {isWorkingHours ? 'Waktu Pejabat Aktif' : 'Di Luar Waktu Pejabat'}
            </p>
            <p className={`text-sm ${isWorkingHours ? 'text-green-600' : 'text-orange-600'}`}>
              {isWorkingHours 
                ? 'Permohonan akan diarahkan kepada Ketua HEP'
                : 'Permohonan akan diarahkan kepada Ketua Warden'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Pending Applications */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Permohonan Menunggu Kelulusan ({filteredApplications.length})
            </h2>
            {user?.role === 'warden' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Warden Filter Controls */}
        {(user?.role === 'warden' || user?.role === 'hep' || user?.role === 'admin') && showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  placeholder="Cari nama pelajar, No K/P, atau ID permohonan..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blok Asrama
                  </label>
                  <select
                    value={filters.dormitoryBlock}
                    onChange={(e) => setFilters(prev => ({ ...prev, dormitoryBlock: e.target.value, dormitoryRoom: 'all' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Blok</option>
                    <option value="U">Blok U</option>
                    <option value="T">Blok T</option>
                    <option value="V">Blok V</option>
                    <option value="S">Blok S</option>
                    <option value="R">Blok R</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dorm
                  </label>
                  <select
                    value={filters.dormitoryRoom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dormitoryRoom: e.target.value }))}
                    disabled={filters.dormitoryBlock === 'all'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">Semua Dorm</option>
                    {filters.dormitoryBlock !== 'all' && getDormitoryRooms(filters.dormitoryBlock).map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ dormitoryBlock: 'all', dormitoryRoom: 'all', status: 'all', searchTerm: '' })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {relevantApplications.length === 0 
                ? 'Tiada permohonan menunggu kelulusan'
                : 'Tiada permohonan mengikut kriteria filter'
              }
            </p>
            <p className="text-sm text-gray-400">
              {user?.role === 'hep' && !isWorkingHours 
                ? 'Permohonan di luar waktu pejabat akan diuruskan oleh Ketua Warden'
                : user?.role === 'warden' && isWorkingHours
                ? 'Permohonan semasa waktu pejabat akan diuruskan oleh Ketua HEP'
                : 'Semua permohonan telah diproses'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredApplications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Menunggu Kelulusan
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(application.createdAt).toLocaleString('ms-MY')}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-1">
                      {application.studentName} ({application.studentId})
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Kelas: {application.studentClass}
                    </p>
                    {application.dormitoryBlock && application.dormitoryRoom && (
                      <p className="text-sm text-gray-600 mb-1">
                        Asrama: {application.dormitoryBlock}{application.dormitoryRoom}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Sebab:</strong> {application.reason}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Destinasi:</strong> {application.destination}
                    </p>
                    <p className="text-sm text-gray-500">
                      Keluar: {new Date(application.exitDate).toLocaleDateString('ms-MY')} • {application.exitTime}
                    </p>
                    <p className="text-sm text-gray-500">
                      Balik: {new Date(application.returnDate).toLocaleDateString('ms-MY')} • {application.returnTime}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedApplication(application.id)}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Semak</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcement Form Modal */}
      {showAnnouncementForm && (
        <AnnouncementForm onClose={() => setShowAnnouncementForm(false)} />
      )}

      {/* Chat Admin Button */}
      {user?.role !== 'admin' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowLiveChat(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Live Chat Admin"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Live Chat Widget */}
      {showLiveChat && (
        <LiveChatWidget onClose={() => setShowLiveChat(false)} />
      )}
    </div>
  );
};

export default StaffDashboard;