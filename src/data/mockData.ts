import { User, Assignment, Submission, Activity, Notification, Stats } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@cinderella.edu',
    name: 'System Administrator',
    role: 'admin',
    isOnline: true,
    lastActive: new Date(),
  },
  {
    id: '2',
    email: 'john.teacher@cinderella.edu',
    name: 'John Smith',
    role: 'teacher',
    isOnline: true,
    lastActive: new Date(),
    subject: 'Mathematics',
  },
  {
    id: '3',
    email: 'jane.teacher@cinderella.edu',
    name: 'Jane Doe',
    role: 'teacher',
    isOnline: false,
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    subject: 'English Literature',
  },
  {
    id: '4',
    email: 'alice.student@cinderella.edu',
    name: 'Alice Johnson',
    role: 'student',
    isOnline: true,
    lastActive: new Date(),
    class: 'Grade 10A',
  },
  {
    id: '5',
    email: 'bob.student@cinderella.edu',
    name: 'Bob Wilson',
    role: 'student',
    isOnline: false,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    class: 'Grade 10A',
  },
  {
    id: '6',
    email: 'carol.student@cinderella.edu',
    name: 'Carol Brown',
    role: 'student',
    isOnline: true,
    lastActive: new Date(),
    class: 'Grade 11B',
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Algebra Problem Set 1',
    description: 'Complete exercises 1-20 from Chapter 5',
    teacherId: '2',
    teacherName: 'John Smith',
    subject: 'Mathematics',
    class: 'Grade 10A',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    documentUrl: '/mock-documents/algebra-problems.pdf',
    documentName: 'algebra-problems.pdf',
    documentType: 'application/pdf',
    instructions: 'Show all your work and explain your reasoning for each problem.',
    isEdited: false,
  },
  {
    id: '2',
    title: 'Shakespeare Essay',
    description: 'Write a 500-word essay on Hamlet',
    teacherId: '3',
    teacherName: 'Jane Doe',
    subject: 'English Literature',
    class: 'Grade 11B',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    documentUrl: '/mock-documents/hamlet-essay-prompt.docx',
    documentName: 'hamlet-essay-prompt.docx',
    documentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    instructions: 'Focus on character development and use specific examples from the text.',
    isEdited: true,
    editComment: 'Updated with additional requirements - please review the new guidelines.',
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    assignmentId: '1',
    studentId: '4',
    studentName: 'Alice Johnson',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    documentUrl: '/mock-submissions/alice-algebra-solutions.pdf',
    documentName: 'alice-algebra-solutions.pdf',
    documentType: 'application/pdf',
    status: 'submitted',
    teacherComments: [],
  },
  {
    id: '2',
    assignmentId: '2',
    studentId: '6',
    studentName: 'Carol Brown',
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    documentUrl: '/mock-submissions/carol-hamlet-essay.docx',
    documentName: 'carol-hamlet-essay.docx',
    documentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    status: 'reviewed',
    grade: 85,
    feedback: 'Good analysis of character development. Consider adding more textual evidence.',
    teacherComments: [
      {
        id: '1',
        userId: '3',
        userName: 'Jane Doe',
        userRole: 'teacher',
        content: 'Great work on the introduction! Please expand on your conclusion.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        submissionId: '2',
      },
    ],
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'assignment_posted',
    userId: '2',
    userName: 'John Smith',
    userRole: 'teacher',
    assignmentId: '1',
    description: 'Posted new assignment: Algebra Problem Set 1',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'submission_uploaded',
    userId: '4',
    userName: 'Alice Johnson',
    userRole: 'student',
    assignmentId: '1',
    submissionId: '1',
    description: 'Submitted assignment: Algebra Problem Set 1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'review_posted',
    userId: '3',
    userName: 'Jane Doe',
    userRole: 'teacher',
    assignmentId: '2',
    submissionId: '2',
    description: 'Posted review for: Shakespeare Essay',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '4',
    type: 'assignment_posted',
    title: 'New Assignment Posted',
    message: 'John Smith posted a new assignment: Algebra Problem Set 1',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    assignmentId: '1',
  },
  {
    id: '2',
    userId: '2',
    type: 'submission_received',
    title: 'New Submission Received',
    message: 'Alice Johnson submitted: Algebra Problem Set 1',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    assignmentId: '1',
    submissionId: '1',
  },
  {
    id: '3',
    userId: '6',
    type: 'review_posted',
    title: 'Assignment Reviewed',
    message: 'Jane Doe reviewed your submission: Shakespeare Essay',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    assignmentId: '2',
    submissionId: '2',
  },
];

export const mockStats: Stats = {
  totalStudents: 3,
  totalTeachers: 2,
  totalAssignments: 2,
  totalSubmissions: 2,
  onlineUsers: 4,
  submissionsThisWeek: 5,
};