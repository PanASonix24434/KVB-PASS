import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import { ArrowLeft, CheckCircle, XCircle, FileText, Calendar, Clock, MapPin, Phone, User, MessageSquare } from 'lucide-react';

interface ApplicationReviewProps {
  applicationId: string;
  onBack: () => void;
}

const ApplicationReview: React.FC<ApplicationReviewProps> = ({ applicationId, onBack }) => {
  const { user } = useAuth();
  const { getApplicationById, approveApplication, rejectApplication } = useApplications();
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const application = getApplicationById(applicationId);

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Permohonan Tidak Dijumpai</h2>
          <p className="text-gray-600 mb-6">Permohonan yang diminta tidak dapat dijumpai</p>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) return;

    setIsSubmitting(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (decision === 'approve') {
      approveApplication(applicationId, user?.role as 'hep' | 'warden', user?.name || '', comments);
    } else {
      rejectApplication(applicationId, user?.role as 'hep' | 'warden', user?.name || '', comments);
    }

    setIsSubmitting(false);
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Semakan Permohonan</h1>
              <p className="text-sm text-gray-600">Sila semak maklumat dengan teliti sebelum membuat keputusan</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Student Information */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Maklumat Pelajar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Nama Penuh</label>
                <p className="text-blue-900 font-medium">{application.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">No. Kad Pengenalan</label>
                <p className="text-blue-900 font-mono">{application.studentIc}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">No. Pelajar</label>
                <p className="text-blue-900 font-mono">{application.studentId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Kelas</label>
                <p className="text-blue-900">{application.studentClass}</p>
              </div>
              {application.dormitoryBlock && application.dormitoryRoom && (
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Asrama</label>
                  <p className="text-blue-900">{application.dormitoryBlock}{application.dormitoryRoom}</p>
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Butiran Permohonan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Sebab Keluar</p>
                    <p className="text-gray-600">{application.reason}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Destinasi</p>
                    <p className="text-gray-600">{application.destination}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Tarikh & Masa Keluar</p>
                    <p className="text-gray-600">
                      {new Date(application.exitDate).toLocaleDateString('ms-MY', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600">{application.exitTime}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Tarikh & Masa Balik</p>
                    <p className="text-gray-600">
                      {new Date(application.returnDate).toLocaleDateString('ms-MY', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600">{application.returnTime}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Kenalan Kecemasan</p>
                    <p className="text-gray-600">{application.emergencyContact}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">No. Telefon Kecemasan</p>
                    <p className="text-gray-600 font-mono">{application.emergencyPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          {application.supportingDocuments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Dokumen Sokongan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {application.supportingDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Timeline */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Maklumat Permohonan</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Tarikh Permohonan:</span> {new Date(application.createdAt).toLocaleString('ms-MY')}</p>
              <p><span className="font-medium">Status:</span> <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Menunggu Kelulusan</span></p>
              {application.routedTo && application.routingReason && (
                <>
                  <p><span className="font-medium">Dihantar kepada:</span> {application.routedTo === 'hep' ? 'Ketua HEP' : 'Warden Asrama'}</p>
                  <p><span className="font-medium">Sebab routing:</span> {application.routingReason}</p>
                </>
              )}
            </div>
          </div>

          {/* Decision Form */}
          <form onSubmit={handleSubmit} className="space-y-6 border-t border-gray-100 pt-8">
            <h2 className="text-lg font-medium text-gray-900">Keputusan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDecision('approve')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  decision === 'approve'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-medium">Luluskan Permohonan</p>
                    <p className="text-sm opacity-75">Pelajar dibenarkan keluar mengikut jadual</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('reject')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  decision === 'reject'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <XCircle className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-medium">Tolak Permohonan</p>
                    <p className="text-sm opacity-75">Permohonan tidak dapat diluluskan</p>
                  </div>
                </div>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Komen {decision === 'reject' ? '(Wajib)' : '(Pilihan)'}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required={decision === 'reject'}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  decision === 'approve'
                    ? 'Komen tambahan (pilihan)...'
                    : 'Sila nyatakan sebab penolakan...'
                }
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!decision || isSubmitting || (decision === 'reject' && !comments.trim())}
                className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  decision === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : decision === 'reject'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {isSubmitting
                  ? 'Sedang Memproses...'
                  : decision === 'approve'
                  ? 'Luluskan Permohonan'
                  : decision === 'reject'
                  ? 'Tolak Permohonan'
                  : 'Pilih Keputusan'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReview;