import React, { useState } from 'react';
import { useApplications } from '../../contexts/ApplicationContext';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const AnnouncementBanner: React.FC = () => {
  const { getActiveAnnouncements } = useApplications();
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<string[]>([]);

  const activeAnnouncements = getActiveAnnouncements().filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  const dismissAnnouncement = (id: string) => {
    setDismissedAnnouncements(prev => [...prev, id]);
  };

  const toggleExpanded = (id: string) => {
    setExpandedAnnouncements(prev => 
      prev.includes(id) 
        ? prev.filter(announcementId => announcementId !== id)
        : [...prev, id]
    );
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'info':
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getAnnouncementColors = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
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

  if (activeAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {activeAnnouncements.map((announcement) => {
        const isExpanded = expandedAnnouncements.includes(announcement.id);
        const colors = getAnnouncementColors(announcement.type);
        
        return (
          <div key={announcement.id} className={`border rounded-lg ${colors}`}>
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getAnnouncementIcon(announcement.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">
                        {announcement.title}
                      </h3>
                      
                      <div className={`text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {announcement.content}
                      </div>
                      
                      {announcement.content.length > 100 && (
                        <button
                          onClick={() => toggleExpanded(announcement.id)}
                          className="inline-flex items-center space-x-1 text-xs mt-2 hover:underline"
                        >
                          {isExpanded ? (
                            <>
                              <span>Tutup</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Baca Selengkapnya</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs opacity-75">
                        <span>Oleh: {announcement.createdBy} ({getRoleDisplay(announcement.creatorRole)})</span>
                        <span>{new Date(announcement.createdAt).toLocaleDateString('ms-MY')}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => dismissAnnouncement(announcement.id)}
                      className="flex-shrink-0 ml-4 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                      title="Tutup pengumuman"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;