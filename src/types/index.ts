export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  isOnline: boolean;
  lastActive: Date;
  avatar?: string;
  class?: string; // For students
  subject?: string; // For teachers
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  class: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  instructions: string;
  isEdited: boolean;
  editComment?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  status: 'submitted' | 'reviewed' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
  teacherComments: Comment[];
  isLate?: boolean;
}

export interface TeacherReport {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  createdAt: string;
  pdfUrl: string;
  reportType: 'assignment' | 'student_progress' | 'class_summary' | 'other';
  isPublic: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: 'teacher' | 'student';
  content: string;
  createdAt: Date;
  assignmentId?: string;
  submissionId?: string;
}

export interface Activity {
  id: string;
  type: 'assignment_posted' | 'submission_uploaded' | 'review_posted' | 'document_edited';
  userId: string;
  userName: string;
  userRole: 'admin' | 'teacher' | 'student';
  assignmentId?: string;
  submissionId?: string;
  description: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'assignment_posted' | 'submission_received' | 'review_posted' | 'deadline_reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  assignmentId?: string;
  submissionId?: string;
}

export interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalAssignments: number;
  totalSubmissions: number;
  onlineUsers: number;
  submissionsThisWeek: number;
}