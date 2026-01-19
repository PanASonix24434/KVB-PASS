import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import { Plus, FileText, Clock, CheckCircle, XCircle, Eye, Building, CreditCard as Edit, BarChart3, AlertCircle, Calendar, History, Phone, User, Send, Filter, Search, MessageCircle } from 'lucide-react';
import ApplicationForm from './ApplicationForm';
import DigitalPass from './DigitalPass';
import AnnouncementBanner from '../shared/AnnouncementBanner';
import LiveChatWidget from '../shared/LiveChatWidget';
import AlertModal from '../shared/AlertModal';

interface StudentDashboardProps {
  handleNavigation?: (itemId: string) => void;
  navigationAction?: string | null;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ navigationAction }) => {
  const { user } = useAuth();
  const { getApplicationsByStudent } = useApplications();
  const [showForm, setShowForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [modalState, setModalState] = useState<{
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
  
  // Get applications for current student - must be defined before useEffect
  const applications = getApplicationsByStudent(user?.studentId || '');
  
  // Handle navigation actions from Layout
  React.useEffect(() => {
    if (!navigationAction) return;
    
    if (navigationAction === 'apply') {
      setShowForm(true);
      setSelectedApplication(null);
    } else if (navigationAction === 'my-applications') {
      setShowForm(false);
      setSelectedApplication(null);
      // Scroll to applications section
      setTimeout(() => {
        const section = document.querySelector('[data-section="my-applications"]');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (navigationAction === 'digital-pass') {
      setShowForm(false);
      // Show latest approved application's digital pass for current student
      const studentApps = applications.filter(app => app.studentId === user?.studentId);
      const approvedApps = studentApps.filter(app => app.status === 'approved');
      
      if (approvedApps.length > 0) {
        // Get the most recent approved application
        const latestApproved = approvedApps.sort((a, b) => {
          const dateA = new Date(a.approvedAt || a.createdAt);
          const dateB = new Date(b.approvedAt || b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })[0];
        
        setSelectedApplication(latestApproved.id);
      } else {
        // Check if student has any applications at all
        if (studentApps.length === 0) {
          setModalState({
            isOpen: true,
            type: 'warning',
            title: 'Tiada Permohonan',
            message: 'Anda belum menghantar sebarang permohonan. Sila hantar permohonan terlebih dahulu.'
          });
        } else {
          // Student has applications but none are approved yet
          setModalState({
            isOpen: true,
            type: 'info',
            title: 'Tiada Pas Digital',
            message: 'Tiada Pas Digital yang tersedia. Permohonan anda masih menunggu kelulusan.'
          });
        }
      }
    } else if (navigationAction === 'dashboard') {
      setShowForm(false);
      setSelectedApplication(null);
    }
  }, [navigationAction, applications, user?.studentId]);

  const [filters, setFilters] = useState({
    residenceStatus: 'all',
    studyYear: 'all', 
    program: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  
  // Filter applications based on selected filters
  const filteredApplications = applications.filter(app => {
    if (filters.status !== 'all' && app.status !== filters.status) {
      return false;
    }
    return true;
  });
  
  const recentApplications = filteredApplications.slice(0, 5);
  const latestApplication = applications.length > 0 ? applications[applications.length - 1] : null;

  // Time-based logic for HEP/Warden
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinutes;
  
  // Determine current routing based on rules
  const getCurrentRouting = () => {
    if (dayOfWeek >= 0 && dayOfWeek <= 3) {
      // Sunday to Wednesday
      if (currentTime >= 17 * 60) {
        return user?.profile?.residenceStatus === 'Pelajar Asrama' ? 'warden' : 'hep';
      } else {
        return 'hep';
      }
    } else if (dayOfWeek === 4) {
      // Thursday
      if (currentTime < 13 * 60) {
        return user?.profile?.residenceStatus === 'Pelajar Asrama' ? 'warden' : 'hep';
      } else {
        return 'warden';
      }
    } else if (dayOfWeek === 5 || dayOfWeek === 6) {
      // Friday & Saturday
      return 'warden';
    }
    return 'hep';
  };
  
  const currentRouting = getCurrentRouting();
  const isWorkingHours = currentRouting === 'hep';

  // Mock staff data
  const hepInfo = {
    name: 'Tuan Rahimi bin Ahmad',
    phone: '013-456-7890',
    title: 'Ketua Hal Ehwal Pelajar'
  };

  const wardens = [
    { id: 'warden1', name: 'Puan Fatimah binti Ali', phone: '012-345-6789', block: 'Warden A' },
    { id: 'warden2', name: 'Encik Hassan bin Omar', phone: '019-876-5432', block: 'Warden B' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Dalam Proses';
      case 'approved': return 'Diluluskan';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedApplication) {
    return <DigitalPass applicationId={selectedApplication} onBack={() => setSelectedApplication(null)} />;
  }

  if (showForm) {
    return <ApplicationForm onBack={() => setShowForm(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Announcements */}
      <AnnouncementBanner />

      {/* Welcome Header */}
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
        <span className="font-medium">
          {user?.profile?.program || user?.class || 'DIPLOMA TEKNOLOGI MAKLUMAT'}
        </span>
      </div>

      {/* Main Dashboard Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOTAK 1: Permohonan Pulang Awal */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Permohonan Pulang Awal</h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="mb-4" style={{ display: 'none' }}>
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Buat Permohonan Baru</span>
              </button>
            </div>

            {/* Status Permohonan Terkini */}
            {latestApplication ? (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Status Permohonan Terkini:</h3>
                
                {/* Status Badge */}
                <div className={`p-3 rounded-lg border ${getStatusColor(latestApplication.status)}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(latestApplication.status)}
                    <span className="font-medium">{getStatusText(latestApplication.status)}</span>
                  </div>
                  
                  {/* Tarikh Hantar */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Tarikh Hantar: {new Date(latestApplication.createdAt).toLocaleDateString('ms-MY')}</span>
                  </div>
                  
                  {/* Sebab */}
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Sebab:</strong> {latestApplication.reason}
                  </p>
                </div>

                {/* Notis Kelulusan */}
                {latestApplication.status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-green-800 font-medium mb-2">
                          Surat kelulusan tersedia untuk tontonan.
                        </p>
                        <button
                          onClick={() => setSelectedApplication(latestApplication.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Lihat Surat Digital
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Komen jika ditolak */}
                {latestApplication.status === 'rejected' && latestApplication.comments && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium mb-1">Sebab Penolakan:</p>
                        <p className="text-red-700 text-sm">{latestApplication.comments}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Tiada permohonan lagi</p>
                <p className="text-gray-400 text-xs mt-1">Klik butang di atas untuk membuat permohonan</p>
              </div>
            )}
          </div>
        </div>

        {/* KOTAK 2: Sejarah Permohonan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" data-section="my-applications">
          {/* Header */}
          <div className="bg-purple-600 text-white p-4">
            <div className="flex items-center space-x-3">
              <History className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Sejarah Permohonan</h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Filter Controls for Students */}
            <div className="mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  showFilters ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter Permohonan</span>
              </button>

              {showFilters && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200" style={{ display: 'none' }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Jenis Pelajar
                      </label>
                      <select
                        value={filters.residenceStatus}
                        onChange={(e) => setFilters(prev => ({ ...prev, residenceStatus: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">Semua Jenis</option>
                        <option value="Pelajar Asrama">Pelajar Asrama</option>
                        <option value="Pelajar Harian">Pelajar Harian (Luar)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tahun Pengajian
                      </label>
                      <select
                        value={filters.studyYear}
                        onChange={(e) => setFilters(prev => ({ ...prev, studyYear: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">Semua Tahun</option>
                        <option value="Tahun 1 SVM">Tahun 1 SVM</option>
                        <option value="Tahun 2 SVM">Tahun 2 SVM</option>
                        <option value="Tahun 1 DVM">Tahun 1 DVM</option>
                        <option value="Tahun 2 DVM">Tahun 2 DVM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Kursus/Program
                      </label>
                      <select
                        value={filters.program}
                        onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">Semua Program</option>
                        <option value="Teknologi Maklumat">Teknologi Maklumat</option>
                        <option value="Teknologi Automotif">Teknologi Automotif</option>
                        <option value="Teknologi Elektrik">Teknologi Elektrik</option>
                        <option value="Teknologi Pemesinan Industri">Teknologi Pemesinan Industri</option>
                        <option value="Teknologi Penyejukan dan Penyamanan Udara">Teknologi Penyejukan dan Penyamanan Udara</option>
                        <option value="Teknologi Pembinaan">Teknologi Pembinaan</option>
                        <option value="Teknologi Kimpalan">Teknologi Kimpalan</option>
                        <option value="Seni Kulinari">Seni Kulinari</option>
                        <option value="Pengurusan Pelancongan">Pengurusan Pelancongan</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status Permohonan
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">Semua Status</option>
                        <option value="pending">Dalam Proses</option>
                        <option value="approved">Diluluskan</option>
                        <option value="rejected">Ditolak</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setFilters({ residenceStatus: 'all', studyYear: 'all', program: 'all', status: 'all' })}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  {applications.length === 0 ? 'Tiada sejarah permohonan' : 'Tiada permohonan mengikut kriteria filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Senarai 3-5 permohonan terbaru */}
                {recentApplications.slice(0, 5).map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString('ms-MY')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 truncate">{application.reason}</p>
                    <p className="text-xs text-blue-600 mb-1 font-mono">ID: {application.applicationId}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(application.exitDate).toLocaleDateString('ms-MY')} • {application.exitTime}
                    </p>
                    {application.status === 'approved' && (
                      <button
                        onClick={() => setSelectedApplication(application.id)}
                        className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                      >
                        Lihat Surat
                      </button>
                    )}
                  </div>
                ))}

                {/* Butang Lihat Semua Sejarah */}
                {filteredApplications.length > 5 && (
                  <button
                    onClick={() => setShowAllHistory(true)}
                    className="w-full mt-4 bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    Lihat Semua Sejarah ({filteredApplications.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* KOTAK 3: Maklumat Warden / HEP */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-orange-600 text-white p-4">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6" />
              <h2 className="text-lg font-semibold">
                {isWorkingHours ? 'Maklumat HEP' : 'Maklumat Warden'}
              </h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {isWorkingHours ? (
              /* Sebelum 5:00 PM - Papar HEP */
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{hepInfo.title}</h3>
                  <p className="text-lg font-semibold text-gray-800">{hepInfo.name}</p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">{hepInfo.phone}</span>
                  </div>
                </div>

                {/* Nota Mesej */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-blue-800 text-sm">
                      Semua permohonan sebelum 5:00 PM akan dihantar kepada Ketua Hal Ehwal Pelajar.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Selepas 5:00 PM - Papar Pilihan Warden */
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-center mb-4">Pilih Warden</h3>
                
                {wardens.map((warden) => (
                  <div key={warden.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{warden.block}</h4>
                        <p className="text-sm text-gray-700">{warden.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{warden.phone}</span>
                        </div>
                      </div>
                      <button className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors flex items-center space-x-1">
                        <Send className="w-3 h-3" />
                        <span>Hantar</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Nota Mesej */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <p className="text-orange-800 text-sm">
                      Semua permohonan selepas 5:00 PM akan dihantar kepada Warden yang dipilih.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifikasi Sistem */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Notifikasi Sistem</h3>
        <p className="text-sm text-gray-600">
          Anda akan menerima notifikasi bagi setiap kemas kini status permohonan.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jumlah Permohonan</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dalam Proses</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Diluluskan</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

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

export default StudentDashboard;