import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import { Shield, Search, CheckCircle, XCircle, Clock, LogOut, LogIn, AlertTriangle, User, QrCode, Camera, MessageCircle } from 'lucide-react';
import AnnouncementBanner from '../shared/AnnouncementBanner';
import LiveChatWidget from '../shared/LiveChatWidget';

const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { applications, securityLogs, logSecurityAction, stats } = useApplications();
  const [searchIc, setSearchIc] = useState('');
  const [searchApplicationId, setSearchApplicationId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchMode, setSearchMode] = useState<'ic' | 'applicationId'>('ic');
  const [isSearching, setIsSearching] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchIc.trim() && !searchApplicationId.trim()) return;

    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let approvedApplications;
    let searchKey;
    
    if (searchMode === 'ic') {
      // Find approved applications for this IC
      approvedApplications = applications.filter(app => 
        app.studentIc === searchIc && app.status === 'approved'
      );
      searchKey = searchIc;
    } else {
      // Find approved application by Application ID
      approvedApplications = applications.filter(app => 
        app.applicationId === searchApplicationId && app.status === 'approved'
      );
      searchKey = approvedApplications.length > 0 ? approvedApplications[0].studentIc : searchApplicationId;
    }

    // Check if student is currently out
    const studentLogs = securityLogs.filter(log => log.studentId === searchKey);
    const lastExitLog = studentLogs
      .filter(log => log.action === 'exit')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    const lastReturnLog = studentLogs
      .filter(log => log.action === 'return')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const isCurrentlyOut = lastExitLog && (!lastReturnLog || new Date(lastExitLog.timestamp) > new Date(lastReturnLog.timestamp));

    setSearchResult({
      ic: searchKey,
      applications: approvedApplications,
      isCurrentlyOut,
      lastExitLog,
      lastReturnLog,
      searchMode,
    });

    setIsSearching(false);
  };

  const handleLogAction = async (action: 'exit' | 'return', applicationId: string, studentName: string) => {
    const studentIc = searchResult?.ic || searchIc;
    logSecurityAction(studentIc, studentName, action, applicationId, user?.name || '');
    
    // Refresh search results
    handleSearch(new Event('submit') as any);
  };

  const recentLogs = securityLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

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
        <span className="font-medium">PEGAWAI KESELAMATAN</span>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Students Out Card */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {stats.studentsOut}
              </div>
              <div className="text-orange-100">
                Pelajar Di Luar
              </div>
            </div>
            <LogOut className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium mb-1">
                Click To View
              </div>
              <div className="text-purple-100">
                Pengesahan Pelajar
              </div>
            </div>
            <Search className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        {/* Security Logs Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium mb-1">
                Rekod
              </div>
              <div className="text-blue-100">
                Log Keselamatan
              </div>
            </div>
            <Shield className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pelajar Di Luar</p>
              <p className="text-2xl font-bold text-orange-600">{stats.studentsOut}</p>
            </div>
            <LogOut className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Permohonan Diluluskan</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedApplications}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Log Hari Ini</p>
              <p className="text-2xl font-bold text-blue-600">
                {securityLogs.filter(log => {
                  const today = new Date();
                  const logDate = new Date(log.timestamp);
                  return logDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menunggu Kelulusan</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Student Verification */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Pengesahan Pelajar</h2>
          <p className="text-sm text-gray-600">Masukkan nombor kad pengenalan untuk semak status kelulusan</p>
        </div>
        
        <div className="p-6">
          {/* Search Mode Toggle */}
          <div className="mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setSearchMode('ic')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchMode === 'ic'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cari dengan No K/P
              </button>
              <button
                onClick={() => setSearchMode('applicationId')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchMode === 'applicationId'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cari dengan ID Permohonan
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex space-x-4 mb-6">
            <div className="flex-1">
              {searchMode === 'ic' ? (
                <input
                  type="text"
                  value={searchIc}
                  onChange={(e) => setSearchIc(e.target.value)}
                  placeholder="Masukkan No Kad Pengenalan (12 digit)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={12}
                />
              ) : (
                <input
                  type="text"
                  value={searchApplicationId}
                  onChange={(e) => setSearchApplicationId(e.target.value)}
                  placeholder="Masukkan ID Permohonan (10 digit)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={10}
                />
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching || (!searchIc.trim() && !searchApplicationId.trim())}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'Mencari...' : 'Cari'}</span>
            </button>
          </form>

          {searchResult && (
            <div className="space-y-4">
              {searchResult.applications.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-900 mb-2">Tiada Kelulusan Sah</h3>
                  <p className="text-red-600">
                    {searchResult.searchMode === 'ic' 
                      ? `Pelajar dengan No K/P ${searchResult.ic} tidak mempunyai kelulusan yang sah untuk keluar`
                      : `ID Permohonan ${searchApplicationId} tidak dijumpai atau belum diluluskan`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className={`p-4 rounded-lg border-2 ${
                    searchResult.isCurrentlyOut 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {searchResult.isCurrentlyOut ? (
                        <LogOut className="w-6 h-6 text-orange-600" />
                      ) : (
                        <LogIn className="w-6 h-6 text-green-600" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          searchResult.isCurrentlyOut ? 'text-orange-800' : 'text-green-800'
                        }`}>
                          Status: {searchResult.isCurrentlyOut ? 'Pelajar Sedang Di Luar' : 'Pelajar Berada Di Dalam'}
                        </p>
                        {searchResult.lastExitLog && (
                          <p className={`text-sm ${
                            searchResult.isCurrentlyOut ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            Keluar terakhir: {new Date(searchResult.lastExitLog.timestamp).toLocaleString('ms-MY')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approved Applications */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Kelulusan Yang Sah:</h3>
                    {searchResult.applications.map((app: any) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                        {/* Student Verification Card */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
                          <div className="flex items-start space-x-6">
                            {/* Student Photo Placeholder */}
                            <div className="flex-shrink-0">
                              <div className="w-24 h-32 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                                {(() => {
                                  // Get student profile photo from stored users
                                  const storedUsers = localStorage.getItem('kvpass_all_users');
                                  if (storedUsers) {
                                    const users = JSON.parse(storedUsers);
                                    const student = users.find((u: any) => u.icNumber === app.studentIc);
                                    if (student?.profile?.profilePhoto) {
                                      return (
                                        <img 
                                          src={student.profile.profilePhoto} 
                                          alt="Gambar Pasport Pelajar" 
                                          className="w-full h-full object-cover"
                                        />
                                      );
                                    }
                                  }
                                  return (
                                    <div className="text-center">
                                      <User className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                      <p className="text-xs text-gray-500">Gambar</p>
                                      <p className="text-xs text-gray-500">Pasport</p>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            {/* Student Information */}
                            <div className="flex-1">
                              <div className="mb-4">
                                <h4 className="text-xl font-bold text-gray-900 mb-1">{app.studentName}</h4>
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>No K/P:</strong> {app.studentIc}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>No Pelajar:</strong> {app.studentId}
                                </p>
                                <p className="text-sm text-gray-600 mb-3">
                                  <strong>Kelas:</strong> {app.studentClass}
                                </p>
                              </div>
                              
                              {/* Application Details */}
                              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-600 mb-1">
                                      <strong>ID Permohonan (10 Digit):</strong>
                                    </p>
                                    <p className="font-mono text-lg font-bold text-blue-600 mb-2">
                                      {app.applicationId}
                                    </p>
                                    <p className="text-gray-600 mb-1">
                                      <strong>Sebab:</strong> {app.reason}
                                    </p>
                                    <p className="text-gray-600 mb-1">
                                      <strong>Destinasi:</strong> {app.destination}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 mb-1">
                                      <strong>Keluar:</strong> {new Date(app.exitDate).toLocaleDateString('ms-MY')} • {app.exitTime}
                                    </p>
                                    <p className="text-gray-600 mb-1">
                                      <strong>Balik:</strong> {new Date(app.returnDate).toLocaleDateString('ms-MY')} • {app.returnTime}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-sm text-green-600">
                                        Diluluskan oleh {app.approvedBy}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                                    ✅ KELULUSAN SAH
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    searchResult.isCurrentlyOut 
                                      ? 'bg-orange-100 text-orange-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {searchResult.isCurrentlyOut ? '🚪 DI LUAR' : '🏠 DI DALAM'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* QR Code Section */}
                            <div className="flex-shrink-0 text-center">
                              <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-2">
                                <QrCode className="w-16 h-16 text-gray-600" />
                              </div>
                              <p className="text-xs text-gray-600 font-medium">QR Code</p>
                              <p className="text-xs text-gray-500">Pengesahan</p>
                              <div className="mt-2 text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                {app.digitalPass?.split('-')[0]}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex justify-center space-x-4 mt-6 pt-4 border-t border-gray-200">
                            {!searchResult.isCurrentlyOut ? (
                              <button
                                onClick={() => handleLogAction('exit', app.id, app.studentName)}
                                className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                              >
                                <LogOut className="w-5 h-5" />
                                <span>🚪 LOG KELUAR</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleLogAction('return', app.id, app.studentName)}
                                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                              >
                                <LogIn className="w-5 h-5" />
                                <span>🏠 LOG MASUK</span>
                              </button>
                            )}
                            <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                              <Camera className="w-5 h-5" />
                              <span>📷 AMBIL GAMBAR</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
                      <LogOut className={`w-5 h-5 ${log.action === 'exit' ? 'text-orange-600' : 'text-green-600'}`} />
                    ) : (
                      <LogIn className={`w-5 h-5 ${log.action === 'exit' ? 'text-orange-600' : 'text-green-600'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {log.studentName} - {log.action === 'exit' ? 'Keluar' : 'Masuk'}
                    </p>
                    <p className="text-sm text-gray-600">
                      K/P: {log.studentId} • Pegawai: {log.securityOfficer}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('ms-MY')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
  );
};

export default SecurityDashboard;