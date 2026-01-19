import React, { useState } from 'react';
import { X, Settings, AlertTriangle, Power, PowerOff, Clock } from 'lucide-react';
import AlertModal from './AlertModal';

interface SystemMaintenanceProps {
  onClose: () => void;
}

const SystemMaintenance: React.FC<SystemMaintenanceProps> = ({ onClose }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Sistem sedang dalam penyelenggaraan. Sila cuba lagi kemudian.');
  const [scheduledMaintenance, setScheduledMaintenance] = useState({
    date: '',
    time: '',
    duration: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleToggleMaintenance = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMaintenanceMode(!maintenanceMode);
    
    // Store maintenance status
    localStorage.setItem('kvpass_maintenance', JSON.stringify({
      enabled: !maintenanceMode,
      message: maintenanceMessage,
      timestamp: new Date().toISOString(),
    }));
    
    setIsSubmitting(false);
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store scheduled maintenance
    localStorage.setItem('kvpass_scheduled_maintenance', JSON.stringify({
      ...scheduledMaintenance,
      scheduledBy: 'Encik Muhammad Ihsan',
      scheduledAt: new Date().toISOString(),
    }));
    
    setIsSubmitting(false);
    setModalState({
      isOpen: true,
      type: 'success',
      title: 'Berjaya',
      message: 'Penyelenggaraan berjadual telah ditetapkan'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Penyelenggaraan Sistem</h2>
                <p className="text-sm text-gray-600">Urus mod penyelenggaraan dan jadual sistem</p>
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

        <div className="p-6 space-y-8">
          {/* Current Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Status Sistem Semasa</h3>
            
            <div className={`p-4 rounded-lg border-2 ${
              maintenanceMode 
                ? 'border-red-200 bg-red-50' 
                : 'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center space-x-3">
                {maintenanceMode ? (
                  <PowerOff className="w-6 h-6 text-red-600" />
                ) : (
                  <Power className="w-6 h-6 text-green-600" />
                )}
                <div>
                  <p className={`font-medium ${
                    maintenanceMode ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {maintenanceMode ? 'Mod Penyelenggaraan AKTIF' : 'Sistem AKTIF'}
                  </p>
                  <p className={`text-sm ${
                    maintenanceMode ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {maintenanceMode 
                      ? 'Pengguna tidak dapat mengakses sistem'
                      : 'Sistem beroperasi dengan normal'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Toggle */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Kawalan Penyelenggaraan</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesej Penyelenggaraan
              </label>
              <textarea
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan mesej yang akan dipaparkan kepada pengguna"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {maintenanceMode ? 'Nyahaktifkan' : 'Aktifkan'} Mod Penyelenggaraan
                </p>
                <p className="text-sm text-gray-600">
                  {maintenanceMode 
                    ? 'Benarkan pengguna mengakses sistem semula'
                    : 'Halang pengguna daripada mengakses sistem'
                  }
                </p>
              </div>
              <button
                onClick={handleToggleMaintenance}
                disabled={isSubmitting}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  maintenanceMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {maintenanceMode ? (
                  <Power className="w-4 h-4" />
                ) : (
                  <PowerOff className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting 
                    ? 'Memproses...' 
                    : maintenanceMode 
                    ? 'Aktifkan Sistem' 
                    : 'Mod Penyelenggaraan'
                  }
                </span>
              </button>
            </div>
          </div>

          {/* Scheduled Maintenance */}
          <div className="space-y-4 border-t border-gray-100 pt-8">
            <h3 className="text-lg font-medium text-gray-900">
              <Clock className="w-5 h-5 inline mr-2" />
              Jadual Penyelenggaraan
            </h3>
            
            <form onSubmit={handleScheduleMaintenance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh Penyelenggaraan
                  </label>
                  <input
                    type="date"
                    value={scheduledMaintenance.date}
                    onChange={(e) => setScheduledMaintenance(prev => ({ ...prev, date: e.target.value }))}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Masa Mula
                  </label>
                  <input
                    type="time"
                    value={scheduledMaintenance.time}
                    onChange={(e) => setScheduledMaintenance(prev => ({ ...prev, time: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempoh (jam)
                </label>
                <select
                  value={scheduledMaintenance.duration}
                  onChange={(e) => setScheduledMaintenance(prev => ({ ...prev, duration: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih tempoh</option>
                  <option value="1">1 jam</option>
                  <option value="2">2 jam</option>
                  <option value="3">3 jam</option>
                  <option value="4">4 jam</option>
                  <option value="6">6 jam</option>
                  <option value="8">8 jam</option>
                  <option value="12">12 jam</option>
                  <option value="24">24 jam</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sebab Penyelenggaraan
                </label>
                <textarea
                  value={scheduledMaintenance.reason}
                  onChange={(e) => setScheduledMaintenance(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Kemaskini sistem, penambahbaikan keselamatan, dll."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Menjadualkan...' : 'Jadualkan Penyelenggaraan'}
              </button>
            </form>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Amaran Penting</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mod penyelenggaraan akan menghalang semua pengguna daripada mengakses sistem</li>
                  <li>Pastikan semua pengguna telah dimaklumkan sebelum mengaktifkan mod penyelenggaraan</li>
                  <li>Jadual penyelenggaraan akan menghantar notifikasi automatik kepada semua pengguna</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default SystemMaintenance;