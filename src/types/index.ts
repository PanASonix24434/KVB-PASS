export interface User {
  id: string;
  name: string;
  icNumber: string;
  email: string;
  role: 'student' | 'hep' | 'warden' | 'security' | 'admin';
  studentId?: string;
  class?: string;
  dormitoryBlock?: string;
  dormitoryRoom?: string;
  profileCompleted?: boolean;
  profile?: StudentProfile;
  createdAt: Date;
}

export interface StudentProfile {
  // Account Information
  email: string;
  password?: string;
  
  // Personal Information
  fullName: string;
  icNumber: string;
  gender: 'Lelaki' | 'Perempuan';
  phoneNumber: string;
  homeAddress: string;
  residenceStatus: 'Pelajar Asrama' | 'Pelajar Harian';
  
  // Academic Information
  program: 'Teknologi Maklumat' | 'Teknologi Automotif' | 'Teknologi Elektrik' | 'Teknologi Pemesinan Industri' | 'Teknologi Penyejukan dan Penyamanan Udara' | 'Teknologi Pembinaan' | 'Teknologi Kimpalan' | 'Seni Kulinari' | 'Pengurusan Pelancongan';
  studyYear: 'Tahun 1 SVM' | 'Tahun 2 SVM' | 'Tahun 1 DVM' | 'Tahun 2 DVM';
  
  // Dormitory Information (if applicable)
  dormitoryBlock?: string;
  dormitoryRoom?: string;
  
  // Parent/Guardian Information
  parentName: string;
  parentPhone: string;
  
  // Profile Photo
  profilePhoto?: string;
}

export interface Application {
  id: string;
  applicationId: string; // 10-digit application ID
  studentId: string;
  studentName: string;
  studentIc: string;
  studentClass: string;
  reason: string;
  exitDate: string;
  exitTime: string;
  returnDate: string;
  returnTime: string;
  destination: string;
  emergencyContact: string;
  emergencyPhone: string;
  supportingDocuments: string[];
  dormitoryBlock?: string;
  dormitoryRoom?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approverRole?: 'hep' | 'warden';
  approvedAt?: Date;
  comments?: string;
  digitalPass?: string;
  routedTo?: 'hep' | 'warden';
  routingReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityLog {
  id: string;
  studentId: string;
  studentName: string;
  action: 'exit' | 'return';
  timestamp: Date;
  securityOfficer: string;
  applicationId: string;
}

export interface SystemStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  studentsOut: number;
  todayApplications: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  createdBy: string;
  creatorRole: 'hep' | 'warden' | 'admin';
  createdAt: Date;
  isActive: boolean;
}
export interface Notification {
  id: string;
  type: 'new_application' | 'approval_update' | 'system_announcement' | 'maintenance';
  title: string;
  message: string;
  targetRole?: 'student' | 'hep' | 'warden' | 'security' | 'admin';
  targetUserId?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}