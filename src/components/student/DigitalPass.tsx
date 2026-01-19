import React, { useState } from 'react';
import { useApplications } from '../../contexts/ApplicationContext';
import { ArrowLeft, Shield, Calendar, Clock, MapPin, CheckCircle, QrCode, Download, Share2, User } from 'lucide-react';
import AlertModal from '../shared/AlertModal';

interface DigitalPassProps {
  applicationId: string;
  onBack: () => void;
}

const DigitalPass: React.FC<DigitalPassProps> = ({ applicationId, onBack }) => {
  const { getApplicationById } = useApplications();
  const application = getApplicationById(applicationId);
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

  if (!application || application.status !== 'approved') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pas Tidak Dijumpai</h2>
          <p className="text-gray-600 mb-6">Permohonan tidak dijumpai atau belum diluluskan</p>
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a downloadable version
    const element = document.createElement('a');
    const content = `
KVB-PASS - SURAT KEBENARAN DIGITAL
================================

NAMA: ${application.studentName}
NO. PELAJAR: ${application.studentId}
NO. K/P: ${application.studentIc}
KELAS: ${application.studentClass}
${application.dormitoryBlock && application.dormitoryRoom ? `ASRAMA: ${application.dormitoryBlock}${application.dormitoryRoom}` : ''}

BUTIRAN PERMOHONAN:
- Sebab: ${application.reason}
- Destinasi: ${application.destination}
- Keluar: ${new Date(application.exitDate).toLocaleDateString('ms-MY')} ${application.exitTime}
- Balik: ${new Date(application.returnDate).toLocaleDateString('ms-MY')} ${application.returnTime}

STATUS: DILULUSKAN
Diluluskan oleh: ${application.approvedBy} (${application.approverRole?.toUpperCase()})
Tarikh Kelulusan: ${application.approvedAt && new Date(application.approvedAt).toLocaleString('ms-MY')}

Kod Digital: ${application.digitalPass}

Surat ini sah dan dikeluarkan oleh Sistem KVB-PASS
Kolej Vokasional Besut
    `;
    
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `KVB-PASS-${application.studentName}-${application.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'KVB-PASS - Surat Kebenaran Digital',
      text: `Surat kebenaran untuk ${application.studentName} - ${application.reason}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      const textToCopy = `KVB-PASS Digital Pass\nNama: ${application.studentName}\nSebab: ${application.reason}\nKod: ${application.digitalPass}`;
      navigator.clipboard.writeText(textToCopy);
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Berjaya',
        message: 'Maklumat pas telah disalin ke clipboard'
      });
    }
  };
  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button - Hidden when printing */}
      <div className="mb-6 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      {/* Digital Pass */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:border-2 print:border-gray-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <img 
                  src="/logo_kv copy.png" 
                  alt="KVB-PASS Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">KVB-PASS</h1>
                <p className="text-green-100 text-sm">Surat Kebenaran Digital</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">DILULUSKAN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pass Content */}
        <div className="p-8 space-y-6">
          {/* Student Photo Section */}
          <div className="text-center border-b border-gray-100 pb-6">
            <div className="w-24 h-32 bg-gray-100 rounded-lg border-2 border-gray-300 mx-auto mb-4 overflow-hidden">
              {(() => {
                // Get current user's profile photo
                const storedUser = localStorage.getItem('kvpass_user');
                if (storedUser) {
                  const user = JSON.parse(storedUser);
                  if (user?.profile?.profilePhoto) {
                    return (
                      <img 
                        src={user.profile.profilePhoto} 
                        alt="Gambar Pasport Pelajar" 
                        className="w-full h-full object-cover"
                      />
                    );
                  }
                }
                return (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <User className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Gambar</p>
                      <p className="text-xs text-gray-500">Pasport</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            <p className="text-xs text-gray-500">Gambar Pasport untuk Pengesahan Identiti</p>
          </div>

          {/* Application ID */}
          <div className="text-center border-b border-gray-100 pb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-800 mb-1">ID Permohonan</p>
              <p className="text-2xl font-bold text-blue-900 font-mono">{application.applicationId}</p>
              <p className="text-xs text-blue-600 mt-1">Sila simpan ID ini untuk rujukan</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="text-center border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{application.studentName}</h2>
            <div className="space-y-1 text-gray-600">
              <p><span className="font-medium">No. Pelajar:</span> {application.studentId}</p>
              <p><span className="font-medium">No. K/P:</span> {application.studentIc}</p>
              <p><span className="font-medium">Kelas:</span> {application.studentClass}</p>
              {application.dormitoryBlock && application.dormitoryRoom && (
                <p><span className="font-medium">Asrama:</span> {application.dormitoryBlock}{application.dormitoryRoom}</p>
              )}
            </div>
          </div>

          {/* Pass Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Destinasi</p>
                  <p className="text-gray-600">{application.destination}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Tarikh Keluar</p>
                  <p className="text-gray-600">
                    {new Date(application.exitDate).toLocaleDateString('ms-MY', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Masa Keluar</p>
                  <p className="text-gray-600">{application.exitTime}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Tarikh Balik</p>
                  <p className="text-gray-600">
                    {new Date(application.returnDate).toLocaleDateString('ms-MY', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Masa Balik</p>
                  <p className="text-gray-600">{application.returnTime}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-1">Sebab</p>
                <p className="text-gray-600">{application.reason}</p>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center py-6 border-t border-gray-100">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-4 border-2 border-blue-300">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                <div className="text-xs font-mono text-blue-800 leading-tight">
                  {application.digitalPass?.split('-').map((part, index) => (
                    <div key={index}>{part}</div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Kod Digital untuk Pengesahan</p>
            <p className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded">{application.digitalPass}</p>
            <p className="text-xs text-gray-400 mt-2">Tunjukkan kod ini kepada pengawal keselamatan</p>
          </div>

          {/* Approval Info */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Diluluskan oleh</span>
            </div>
            <p className="text-green-700">
              {application.approvedBy} ({application.approverRole?.toUpperCase()})
            </p>
            <p className="text-sm text-green-600">
              {application.approvedAt && new Date(application.approvedAt).toLocaleString('ms-MY')}
            </p>
            {application.comments && (
              <p className="text-sm text-green-600 mt-2 italic">
                Komen: {application.comments}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
            <p>Surat kebenaran ini sah dan dikeluarkan secara digital oleh Sistem KVB-PASS</p>
            <p>Dikeluarkan pada: {new Date().toLocaleString('ms-MY')}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Hidden when printing */}
      <div className="mt-6 flex justify-center space-x-4 print:hidden">
        <button
          onClick={handleDownload}
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Muat Turun</span>
        </button>
        
        <button
          onClick={handleShare}
          className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Kongsi</span>
        </button>
        
        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Cetak Surat</span>
        </button>
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

export default DigitalPass;