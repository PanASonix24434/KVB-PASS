import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import { X, Megaphone, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface AnnouncementFormProps {
  onClose: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { createAnnouncement } = useApplications();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'urgent' | 'success',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    createAnnouncement({
      ...formData,
      createdBy: user?.name || '',
      creatorRole: user?.role as 'hep' | 'warden' | 'admin',
      isActive: true,
    });

    setIsSubmitting(false);
    onClose();
  };

  const announcementTypes = [
    { value: 'info', label: 'Maklumat', icon: Info, color: 'text-blue-600' },
    { value: 'success', label: 'Kejayaan', icon: CheckCircle, color: 'text-green-600' },
    { value: 'warning', label: 'Amaran', icon: AlertCircle, color: 'text-yellow-600' },
    { value: 'urgent', label: 'Penting', icon: AlertTriangle, color: 'text-red-600' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Buat Pengumuman Baru</h2>
                <p className="text-sm text-gray-600">Pengumuman akan dilihat oleh semua pengguna sistem</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Announcement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis Pengumuman
            </label>
            <div className="grid grid-cols-2 gap-3">
              {announcementTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`w-5 h-5 ${type.color}`} />
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tajuk Pengumuman *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Penutupan Sementara Sistem KV-PASS"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 aksara
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kandungan Pengumuman *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tulis kandungan pengumuman di sini..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/500 aksara
            </p>
          </div>

          {/* Preview */}
          {formData.title && formData.content && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Pratonton:</h3>
              <div className={`border rounded-lg p-4 ${
                formData.type === 'urgent' ? 'bg-red-50 border-red-200' :
                formData.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                formData.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {announcementTypes.find(t => t.value === formData.type)?.icon && 
                      React.createElement(
                        announcementTypes.find(t => t.value === formData.type)!.icon,
                        { className: `w-5 h-5 ${announcementTypes.find(t => t.value === formData.type)?.color}` }
                      )
                    }
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{formData.title}</h4>
                    <p className="text-sm">{formData.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs opacity-75">
                      <span>Oleh: {user?.name}</span>
                      <span>{new Date().toLocaleDateString('ms-MY')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sedang Menerbitkan...' : 'Terbitkan Pengumuman'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;