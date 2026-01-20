import React, { createContext, useContext, useState, useEffect } from 'react';
import { Application, SecurityLog, SystemStats, Announcement } from '../types';
import { supabase } from '../lib/supabase';

interface ApplicationContextType {
  applications: Application[];
  securityLogs: SecurityLog[];
  announcements: Announcement[];
  stats: SystemStats;
  submitApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Application>;
  approveApplication: (id: string, approverRole: 'hep' | 'warden', approverName: string, comments?: string) => Promise<void>;
  rejectApplication: (id: string, approverRole: 'hep' | 'warden', approverName: string, comments: string) => Promise<void>;
  logSecurityAction: (studentId: string, studentName: string, action: 'exit' | 'return', applicationId: string, officer: string) => Promise<void>;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  toggleAnnouncementStatus: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  getApplicationsByStudent: (studentId: string) => Application[];
  getPendingApplications: () => Application[];
  getApplicationById: (id: string) => Application | undefined;
  getActiveAnnouncements: () => Announcement[];
}

// Type for database application (snake_case from Supabase)
interface DatabaseApplication {
  id: string;
  application_id: string;
  student_id: string;
  student_name: string;
  student_ic: string;
  student_class: string;
  reason: string;
  exit_date: string;
  exit_time: string;
  return_date: string;
  return_time: string;
  destination: string;
  emergency_contact: string;
  emergency_phone: string;
  supporting_documents: string[] | null;
  dormitory_block?: string | null;
  dormitory_room?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approver_role?: 'hep' | 'warden' | null;
  approved_at?: string | null;
  comments?: string | null;
  digital_pass?: string | null;
  routed_to?: 'hep' | 'warden' | null;
  routing_reason?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper function to convert database application to app Application type
const mapDbApplicationToApplication = (dbApp: DatabaseApplication): Application => {
  return {
    id: dbApp.id,
    applicationId: dbApp.application_id,
    studentId: dbApp.student_id,
    studentName: dbApp.student_name,
    studentIc: dbApp.student_ic,
    studentClass: dbApp.student_class,
    reason: dbApp.reason,
    exitDate: dbApp.exit_date,
    exitTime: dbApp.exit_time,
    returnDate: dbApp.return_date,
    returnTime: dbApp.return_time,
    destination: dbApp.destination,
    emergencyContact: dbApp.emergency_contact,
    emergencyPhone: dbApp.emergency_phone,
    supportingDocuments: dbApp.supporting_documents || [],
    dormitoryBlock: dbApp.dormitory_block || undefined,
    dormitoryRoom: dbApp.dormitory_room || undefined,
    status: dbApp.status,
    approvedBy: dbApp.approved_by || undefined,
    approverRole: dbApp.approver_role || undefined,
    approvedAt: dbApp.approved_at ? new Date(dbApp.approved_at) : undefined,
    comments: dbApp.comments || undefined,
    digitalPass: dbApp.digital_pass || undefined,
    routedTo: dbApp.routed_to || undefined,
    routingReason: dbApp.routing_reason || undefined,
    createdAt: new Date(dbApp.created_at),
    updatedAt: new Date(dbApp.updated_at),
  };
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load applications
        try {
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (appsError) {
            console.error('Error loading applications:', appsError);
          } else if (appsData) {
            try {
              setApplications(appsData.map(mapDbApplicationToApplication));
            } catch (mapError) {
              console.error('Error mapping applications:', mapError);
            }
          }
        } catch (appsErr) {
          console.error('Error fetching applications:', appsErr);
        }
        
        // Load security logs
        try {
          const { data: logsData, error: logsError } = await supabase
            .from('security_logs')
            .select('*')
            .order('timestamp', { ascending: false });
          
          if (logsError) {
            console.error('Error loading security logs:', logsError);
          } else if (logsData) {
            try {
              setSecurityLogs(logsData.map(log => ({
                id: log.id,
                studentId: log.student_id,
                studentName: log.student_name,
                action: log.action,
                timestamp: new Date(log.timestamp),
                securityOfficer: log.security_officer,
                applicationId: log.application_id,
              })));
            } catch (mapError) {
              console.error('Error mapping security logs:', mapError);
            }
          }
        } catch (logsErr) {
          console.error('Error fetching security logs:', logsErr);
        }
        
        // Load announcements
        try {
          const { data: annData, error: annError } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (annError) {
            console.error('Error loading announcements:', annError);
          } else if (annData) {
            try {
              setAnnouncements(annData.map(ann => ({
                id: ann.id,
                title: ann.title,
                content: ann.content,
                type: ann.type,
                createdBy: ann.created_by,
                creatorRole: ann.creator_role,
                createdAt: new Date(ann.created_at),
                isActive: ann.is_active,
              })));
            } catch (mapError) {
              console.error('Error mapping announcements:', mapError);
            }
          }
        } catch (annErr) {
          console.error('Error fetching announcements:', annErr);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Don't throw - allow app to continue with empty data
      }
    };
    
    loadData();
  }, []);

  const submitApplication = async (applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<Application> => {
    // Generate 10-digit application ID
    const generateApplicationId = () => {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4 random digits
      return timestamp + random;
    };
    
    const applicationId = generateApplicationId();
    const now = new Date().toISOString();
    
    // Prepare data for Supabase (snake_case)
    const dbData = {
      application_id: applicationId,
      student_id: applicationData.studentId,
      student_name: applicationData.studentName,
      student_ic: applicationData.studentIc,
      student_class: applicationData.studentClass,
      reason: applicationData.reason,
      exit_date: applicationData.exitDate,
      exit_time: applicationData.exitTime,
      return_date: applicationData.returnDate,
      return_time: applicationData.returnTime,
      destination: applicationData.destination,
      emergency_contact: applicationData.emergencyContact,
      emergency_phone: applicationData.emergencyPhone,
      supporting_documents: applicationData.supportingDocuments || [],
      dormitory_block: applicationData.dormitoryBlock || null,
      dormitory_room: applicationData.dormitoryRoom || null,
      status: applicationData.status || 'pending',
      routed_to: applicationData.routedTo || null,
      routing_reason: applicationData.routingReason || null,
      created_at: now,
      updated_at: now,
    };
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert(dbData)
        .select()
        .single();
      
      if (error) {
        console.error('Error submitting application:', error);
        throw error;
      }
      
      if (data) {
        const newApplication = mapDbApplicationToApplication(data as DatabaseApplication);
        setApplications(prev => [newApplication, ...prev]);
        return newApplication;
      }
      
      throw new Error('Failed to create application');
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  };

  const approveApplication = async (id: string, approverRole: 'hep' | 'warden', approverName: string, comments?: string) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const digitalPassCode = `KVBP-${timestamp.toString().slice(-6)}-${randomSuffix}`;
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'approved',
          approved_by: approverName,
          approver_role: approverRole,
          approved_at: new Date().toISOString(),
          comments: comments || null,
          digital_pass: digitalPassCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error approving application:', error);
        throw error;
      }
      
      if (data) {
        const updatedApp = mapDbApplicationToApplication(data as DatabaseApplication);
        setApplications(prev => prev.map(app => app.id === id ? updatedApp : app));
      }
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  };

  const rejectApplication = async (id: string, approverRole: 'hep' | 'warden', approverName: string, comments: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'rejected',
          approved_by: approverName,
          approver_role: approverRole,
          approved_at: new Date().toISOString(),
          comments: comments,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error rejecting application:', error);
        throw error;
      }
      
      if (data) {
        const updatedApp = mapDbApplicationToApplication(data as DatabaseApplication);
        setApplications(prev => prev.map(app => app.id === id ? updatedApp : app));
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  };

  const logSecurityAction = async (studentId: string, studentName: string, action: 'exit' | 'return', applicationId: string, officer: string) => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .insert({
          student_id: studentId,
          student_name: studentName,
          action: action,
          timestamp: new Date().toISOString(),
          security_officer: officer,
          application_id: applicationId,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error logging security action:', error);
        throw error;
      }
      
      if (data) {
        const newLog: SecurityLog = {
          id: data.id,
          studentId: data.student_id,
          studentName: data.student_name,
          action: data.action,
          timestamp: new Date(data.timestamp),
          securityOfficer: data.security_officer,
          applicationId: data.application_id,
        };
        setSecurityLogs(prev => [newLog, ...prev]);
      }
    } catch (error) {
      console.error('Error logging security action:', error);
      throw error;
    }
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: announcementData.title,
          content: announcementData.content,
          type: announcementData.type,
          created_by: announcementData.createdBy,
          creator_role: announcementData.creatorRole,
          is_active: announcementData.isActive !== undefined ? announcementData.isActive : true,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating announcement:', error);
        throw error;
      }
      
      if (data) {
        const newAnnouncement: Announcement = {
          id: data.id,
          title: data.title,
          content: data.content,
          type: data.type,
          createdBy: data.created_by,
          creatorRole: data.creator_role,
          createdAt: new Date(data.created_at),
          isActive: data.is_active,
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  };

  const toggleAnnouncementStatus = async (id: string) => {
    try {
      const announcement = announcements.find(a => a.id === id);
      if (!announcement) return;
      
      const { data, error } = await supabase
        .from('announcements')
        .update({ is_active: !announcement.isActive })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error toggling announcement status:', error);
        throw error;
      }
      
      if (data) {
        setAnnouncements(prev => prev.map(ann => 
          ann.id === id 
            ? { ...ann, isActive: data.is_active }
            : ann
        ));
      }
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      throw error;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting announcement:', error);
        throw error;
      }
      
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  };

  const getApplicationsByStudent = (studentId: string) => {
    if (!studentId) {
      return [];
    }
    try {
      return applications.filter(app => app.studentId === studentId);
    } catch (error) {
      console.error('Error filtering applications by student:', error);
      return [];
    }
  };

  const getPendingApplications = () => {
    return applications.filter(app => app.status === 'pending');
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const getActiveAnnouncements = () => {
    return announcements.filter(announcement => announcement.isActive);
  };

  // Calculate stats
  const stats: SystemStats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    approvedApplications: applications.filter(app => app.status === 'approved').length,
    rejectedApplications: applications.filter(app => app.status === 'rejected').length,
    studentsOut: securityLogs.filter(log => 
      log.action === 'exit' && 
      !securityLogs.some(returnLog => 
        returnLog.studentId === log.studentId && 
        returnLog.action === 'return' && 
        returnLog.timestamp > log.timestamp
      )
    ).length,
    todayApplications: applications.filter(app => {
      const today = new Date();
      const appDate = new Date(app.createdAt);
      return appDate.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <ApplicationContext.Provider value={{
      applications,
      securityLogs,
      announcements,
      stats,
      submitApplication,
      approveApplication,
      rejectApplication,
      logSecurityAction,
      createAnnouncement,
      toggleAnnouncementStatus,
      deleteAnnouncement,
      getApplicationsByStudent,
      getPendingApplications,
      getApplicationById,
      getActiveAnnouncements,
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};