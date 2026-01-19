import React, { useState } from 'react';
import { useApplications } from '../../contexts/ApplicationContext';
import { Megaphone, Plus, Eye, EyeOff, Trash2, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import AnnouncementForm from './AnnouncementForm';

const AnnouncementManager: React.FC = () => {
  const { announcements, toggleAnnouncementStatus, deleteAnnouncement } = useApplications();
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sortedAnnouncements = announcements.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'urgent': return 'Penting';
      case 'warning': return 'Amaran';
      case 'success': return 'Kejayaan';
      case 'info':
      default: return 'Maklumat';
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'hep': return 'Ketua HEP';
      case 'warden': return 'Ketua Warden';
      case 'admin': return 'Pentadbir Sistem';
      default: return role;
    }
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pengurusan Pengumuman</h2>
              <p className="text-sm text-gray-600">Urus pengumuman untuk semua pengguna sistem</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman</span>
          </button>
        </div>
      </div>

      {sortedAnnouncements.length === 0 ? (
        <div className="p-8 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Tiada pengumuman lagi</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman Pertama</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sortedAnnouncements.map((announcement) => (
            <div key={announcement.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getAnnouncementIcon(announcement.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {announcement.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTypeLabel(announcement.type)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Oleh: {announcement.createdBy} ({getRoleDisplay(announcement.creatorRole)})</span>
                        <span>{new Date(announcement.createdAt).toLocaleString('ms-MY')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleAnnouncementStatus(announcement.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          announcement.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={announcement.isActive ? 'Nyahaktifkan' : 'Aktifkan'}
                      >
                        {announcement.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => setDeleteConfirm(announcement.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Padam pengumuman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {deleteConfirm === announcement.id && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-3">
                    Adakah anda pasti ingin memadam pengumuman ini? Tindakan ini tidak boleh dibatalkan.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Ya, Padam
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AnnouncementForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default AnnouncementManager;