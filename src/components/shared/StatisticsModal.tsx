import React, { useState, useMemo } from 'react';
import { useApplications } from '../../contexts/ApplicationContext';
import { X, BarChart3, Calendar, Filter, TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatisticsModalProps {
  onClose: () => void;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ onClose }) => {
  const { applications, securityLogs } = useApplications();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [chartType, setChartType] = useState<'applications' | 'status' | 'daily' | 'monthly'>('applications');

  // Filter data based on date range
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const appDate = new Date(app.createdAt).toISOString().split('T')[0];
      return appDate >= dateRange.startDate && appDate <= dateRange.endDate;
    });
  }, [applications, dateRange]);

  const filteredLogs = useMemo(() => {
    return securityLogs.filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      return logDate >= dateRange.startDate && logDate <= dateRange.endDate;
    });
  }, [securityLogs, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredApplications.length;
    const approved = filteredApplications.filter(app => app.status === 'approved').length;
    const rejected = filteredApplications.filter(app => app.status === 'rejected').length;
    const pending = filteredApplications.filter(app => app.status === 'pending').length;
    
    return {
      total,
      approved,
      rejected,
      pending,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
    };
  }, [filteredApplications]);

  // Daily applications data
  const dailyData = useMemo(() => {
    const dailyCount: { [key: string]: number } = {};
    
    filteredApplications.forEach(app => {
      const date = new Date(app.createdAt).toISOString().split('T')[0];
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    });

    return Object.entries(dailyCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('ms-MY'),
        count
      }));
  }, [filteredApplications]);

  // Monthly applications data
  const monthlyData = useMemo(() => {
    const monthlyCount: { [key: string]: number } = {};
    
    filteredApplications.forEach(app => {
      const date = new Date(app.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('ms-MY', { year: 'numeric', month: 'long' }),
        count
      }));
  }, [filteredApplications]);

  const renderChart = () => {
    switch (chartType) {
      case 'applications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ringkasan Permohonan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Jumlah</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Diluluskan</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Ditolak</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Menunggu</span>
                </div>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        );

      case 'status':
        const maxValue = Math.max(stats.approved, stats.rejected, stats.pending);
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Status Permohonan</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className="w-20 text-sm text-gray-600">Diluluskan</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${maxValue > 0 ? (stats.approved / maxValue) * 100 : 0}%` }}
                  >
                    <span className="text-white text-xs font-medium">{stats.approved}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="w-20 text-sm text-gray-600">Ditolak</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${maxValue > 0 ? (stats.rejected / maxValue) * 100 : 0}%` }}
                  >
                    <span className="text-white text-xs font-medium">{stats.rejected}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="w-20 text-sm text-gray-600">Menunggu</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${maxValue > 0 ? (stats.pending / maxValue) * 100 : 0}%` }}
                  >
                    <span className="text-white text-xs font-medium">{stats.pending}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'daily':
        const maxDaily = Math.max(...dailyData.map(d => d.count), 1);
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Permohonan Harian</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dailyData.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tiada data untuk tempoh yang dipilih</p>
              ) : (
                dailyData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="w-24 text-sm text-gray-600">{item.date}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / maxDaily) * 100}%` }}
                      >
                        <span className="text-white text-xs font-medium">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'monthly':
        const maxMonthly = Math.max(...monthlyData.map(d => d.count), 1);
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Permohonan Bulanan</h3>
            <div className="space-y-2">
              {monthlyData.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tiada data untuk tempoh yang dipilih</p>
              ) : (
                monthlyData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="w-32 text-sm text-gray-600">{item.month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6">
                      <div 
                        className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / maxMonthly) * 100}%` }}
                      >
                        <span className="text-white text-xs font-medium">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Statistik & Graf Data</h2>
                <p className="text-sm text-gray-600">Analisis data permohonan sistem KVB-PASS</p>
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

        {/* Controls */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Tarikh Mula
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Tarikh Akhir
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Jenis Graf
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="applications">Ringkasan Permohonan</option>
                <option value="status">Status Permohonan</option>
                <option value="daily">Graf Harian</option>
                <option value="monthly">Graf Bulanan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Jumlah Permohonan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approvalRate}%</div>
              <div className="text-sm text-gray-600">Kadar Kelulusan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{filteredLogs.length}</div>
              <div className="text-sm text-gray-600">Log Keselamatan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime() > 0 
                  ? Math.max(1, Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
                  : 1
                }
              </div>
              <div className="text-sm text-gray-600">Tempoh Analisis (hari)</div>
            </div>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          {renderChart()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Data dikemaskini: {new Date().toLocaleString('ms-MY')}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;