import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Search,
  RefreshCw,
  X,
  File,
  Video,
  Image as ImageIcon,
  FileCode,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ActivityTimeline from '../Shared/ActivityTimeline';
import NotificationPanel from '../Shared/NotificationPanel';
import { mockActivities, mockNotifications, mockSubmissions } from '../../data/mockData';
import { useToast } from '@/hooks/use-toast';
import AITutorChat from './AITutorChat';
import StudentMessagingCenter from './StudentMessagingCenter';

// Modern Calendar Component
const ModernCalendar = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [selected, setSelected] = useState(selectedDate);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelected(newDate);
    onDateChange(newDate);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selected && selected.getDate() === day && selected.getMonth() === currentMonth.getMonth();
    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
    
    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`h-10 rounded-full transition-all hover:bg-blue-100 ${
          isSelected ? 'bg-blue-600 text-white font-bold shadow-lg scale-110' : 
          isToday ? 'bg-blue-100 text-blue-600 font-semibold' : 
          'text-gray-700 hover:scale-105'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          ←
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>
    </div>
  );
};

// Document Preview Component
const DocumentPreview = ({ isOpen, onClose, documentUrl, documentName, documentType, onDownload }) => {
  const getFileIcon = () => {
    if (!documentType) return <File className="h-12 w-12 text-gray-400" />;
    
    if (documentType.includes('video')) return <Video className="h-12 w-12 text-purple-600" />;
    if (documentType.includes('image')) return <ImageIcon className="h-12 w-12 text-blue-600" />;
    if (documentType.includes('pdf')) return <FileText className="h-12 w-12 text-red-600" />;
    return <FileCode className="h-12 w-12 text-green-600" />;
  };

  const renderPreview = () => {
    if (!documentUrl || !documentType) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          {getFileIcon()}
          <p className="mt-4">No preview available</p>
        </div>
      );
    }

    if (documentType.includes('image')) {
      return <img src={documentUrl} alt={documentName} className="max-w-full h-auto rounded-lg" />;
    }

    if (documentType.includes('video')) {
      return (
        <video controls className="w-full rounded-lg">
          <source src={documentUrl} type={documentType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (documentType.includes('pdf')) {
      return (
        <iframe
          src={documentUrl}
          className="w-full h-96 rounded-lg border"
          title={documentName}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-600">
        {getFileIcon()}
        <p className="mt-4 text-center">Preview not available for this file type<br />Click download to view</p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>{documentName || 'Document Preview'}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4">
          {renderPreview()}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Countdown Timer Display
const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(dueDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  const CircularProgress = ({ value, max, label, color }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 35;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <svg className="transform -rotate-90 w-16 h-16">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={color}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{value}</span>
          </div>
        </div>
        <span className="text-xs text-gray-600 mt-1">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex justify-around items-center gap-1">
      <CircularProgress value={timeLeft.days} max={30} label="Days" color="text-blue-600" />
      <CircularProgress value={timeLeft.hours} max={24} label="Hours" color="text-purple-600" />
      <CircularProgress value={timeLeft.minutes} max={60} label="Mins" color="text-orange-600" />
      <CircularProgress value={timeLeft.seconds} max={60} label="Secs" color="text-green-600" />
    </div>
  );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [previewDocument, setPreviewDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to get document type from file path
  const getDocumentTypeFromPath = (filePath) => {
    if (!filePath) return 'application/octet-stream';
    
    const ext = filePath.split('.').pop()?.toLowerCase();
    const typeMap = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv'
    };
    return typeMap[ext || ''] || 'application/octet-stream';
  };

  // Fetch assignments for student's class from API
  const fetchStudentAssignments = async (showRefreshToast = false) => {
    if (!user?.id) return;
    
    try {
      setLoading(!showRefreshToast);
      setRefreshing(showRefreshToast);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/assignments/student/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match frontend format
        const transformedAssignments = data.assignments.map(assignment => ({
          id: assignment.id.toString(),
          teacherId: assignment.teacher_id.toString(),
          teacherName: assignment.teacher_name || 'Teacher',
          title: assignment.title,
          description: assignment.description || '',
          instructions: assignment.instructions || '',
          subject: 'General',
          class: assignment.class_name,
          dueDate: new Date(assignment.due_date),
          createdAt: new Date(assignment.created_at),
          updatedAt: new Date(assignment.updated_at || assignment.created_at),
          documentUrl: assignment.document_path ? `http://localhost:5000${assignment.document_path}` : null,
          documentName: assignment.document_path ? assignment.document_path.split('/').pop() : null,
          documentType: assignment.document_path ? getDocumentTypeFromPath(assignment.document_path) : null,
          isEdited: new Date(assignment.updated_at || assignment.created_at).getTime() !== new Date(assignment.created_at).getTime(),
          submissionStatus: assignment.submission_status,
          submissionId: assignment.submission_id,
          submittedAt: assignment.submitted_at ? new Date(assignment.submitted_at) : null,
          grade: assignment.grade,
          feedback: assignment.feedback
        }));
        
        setAssignments(transformedAssignments);
        
        if (showRefreshToast) {
          toast({
            title: "Success",
            description: `Loaded ${transformedAssignments.length} assignment${transformedAssignments.length !== 1 ? 's' : ''}`,
          });
        }
      } else {
        throw new Error(data.message || 'Failed to fetch assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/getallusers');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users.map((user) => ({
          ...user,
          username: `${user.firstname || ''} ${user.sirname || ''}`.trim() || user.email.split('@')[0],
          class_name: user.class,
          isOnline: false
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/active-users');
      const data = await response.json();
      
      if (data.success) {
        setActiveUsers(data.users);
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            isOnline: data.users.some((activeUser) => activeUser.id === user.id)
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUsers();
      fetchActiveUsers();
      fetchStudentAssignments();
      
      const interval = setInterval(fetchActiveUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const currentStudent = users.find(u => u.id === user?.id);
  const mySubmissions = submissions.filter(s => s.studentId === user?.id);
  const myNotifications = mockNotifications.filter(n => n.userId === user?.id);

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const diffInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const getSubmissionStatus = (assignmentId) => {
    return assignments.find(a => a.id === assignmentId && a.submissionId);
  };

  const stats = {
    totalAssignments: assignments.length,
    submitted: assignments.filter(a => a.submissionId).length,
    pending: assignments.filter(a => !a.submissionId).length,
    overdue: assignments.filter(a => getDaysUntilDue(a.dueDate) < 0 && !a.submissionId).length,
    onlineClassmates: users.filter(u => u.role === 'student' && u.class_name === currentStudent?.class_name && u.isOnline).length,
    totalClassmates: users.filter(u => u.role === 'student' && u.class_name === currentStudent?.class_name).length
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!uploadFile || !selectedAssignment) return;
    
    try {
      const formData = new FormData();
      formData.append('document', uploadFile);
      formData.append('assignmentId', selectedAssignment.id);
      formData.append('studentId', user?.id || '');
      
      const response = await fetch('http://localhost:5000/api/submissions/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Assignment "${selectedAssignment.title}" submitted successfully!`,
        });
        
        // Refresh assignments to show updated submission status
        await fetchStudentAssignments(false);
        
        setUploadFile(null);
        setSelectedAssignment(null);
        setIsUploadOpen(false);
      } else {
        throw new Error(data.message || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit assignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (documentUrl, documentName) => {
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Document downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download document.",
        variant: "destructive"
      });
    }
  };

  const handleRefreshAssignments = () => {
    fetchStudentAssignments(true);
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overdueAssignments = assignments.filter(a => getDaysUntilDue(a.dueDate) < 0 && !a.submissionId);
  const upcomingAssignments = assignments.filter(a => getDaysUntilDue(a.dueDate) <= 3 && getDaysUntilDue(a.dueDate) >= 0);
  const classmates = users.filter(u => 
    u.role === 'student' && 
    u.class_name === currentStudent?.class_name && 
    u.id !== user?.id
  );

  // Prepare assignments data for messaging center
  const assignmentsForMessaging = assignments.map(assignment => ({
    id: assignment.id,
    title: assignment.title,
    teacherId: assignment.teacherId,
    teacherName: assignment.teacherName
  }));

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" style={{ zoom: '0.9' }}>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">Available assignments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed submissions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Need to submit</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground mt-1">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 text-xl">📚 My Class: {currentStudent?.class_name || user?.class}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl font-bold text-blue-600">{stats.totalClassmates}</div>
              <p className="text-sm text-blue-600 font-medium mt-1">Total Classmates</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl font-bold text-green-600">{stats.onlineClassmates}</div>
              <p className="text-sm text-green-600 font-medium mt-1">Online Now</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'teacher').length}</div>
              <p className="text-sm text-purple-600 font-medium mt-1">Teachers</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl font-bold text-red-600">{activeUsers.length}</div>
              <p className="text-sm text-red-600 font-medium mt-1">School Online</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {overdueAssignments.length > 0 && (
        <Alert className="border-red-200 bg-red-50 shadow-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            ⚠️ You have {overdueAssignments.length} overdue assignment{overdueAssignments.length > 1 ? 's' : ''}. 
            Please submit them as soon as possible!
          </AlertDescription>
        </Alert>
      )}

      {upcomingAssignments.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 shadow-lg">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            📅 You have {upcomingAssignments.length} assignment{upcomingAssignments.length > 1 ? 's' : ''} due within 3 days.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="assignments" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-md">
              <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Assignments</TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">My Submissions</TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Messages</TabsTrigger>
              <TabsTrigger value="classmates" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Classmates</TabsTrigger>
              <TabsTrigger value="help" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Help</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-4">
              <div className="h-[600px]">
                <StudentMessagingCenter assignments={assignmentsForMessaging} />
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Available Assignments</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRefreshAssignments}
                    disabled={refreshing}
                    className="shadow-sm hover:shadow-md transition-all"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  {filteredAssignments.length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-2">No assignments available</p>
                        <p className="text-gray-400">Your teacher will post assignments here</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredAssignments.map((assignment) => {
                      const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                      const isOverdue = daysUntilDue < 0 && !assignment.submissionId;
                      
                      return (
                        <Card key={assignment.id} className={`mb-4 shadow-md hover:shadow-lg transition-shadow ${isOverdue ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-blue-600'}`}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-xl text-gray-800">{assignment.title}</CardTitle>
                                <CardDescription className="mt-1 text-base">{assignment.description}</CardDescription>
                                {assignment.instructions && (
                                  <p className="text-sm text-gray-600 mt-2 italic">
                                    📝 Instructions: {assignment.instructions}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                    {assignment.class}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                    {assignment.teacherName}
                                  </Badge>
                                  {assignment.isEdited && (
                                    <Badge className="bg-orange-600">Updated</Badge>
                                  )}
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                    Posted {formatTimeAgo(assignment.createdAt)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                {assignment.submissionId ? (
                                  <Badge className="bg-green-600 text-base px-3 py-1">
                                    ✓ Submitted
                                  </Badge>
                                ) : (
                                  <Badge 
                                    variant={isOverdue ? "destructive" : daysUntilDue <= 2 ? "default" : "secondary"}
                                    className={`text-base px-3 py-1 ${daysUntilDue <= 2 && daysUntilDue >= 0 ? "bg-orange-600" : ""}`}
                                  >
                                    {isOverdue ? "Overdue" : `${daysUntilDue} days left`}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <CountdownTimer dueDate={assignment.dueDate} />
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Due: {assignment.dueDate.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                {assignment.documentUrl && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setPreviewDocument(assignment)}
                                      className="hover:bg-blue-50"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(assignment.documentUrl, assignment.documentName)}
                                      className="hover:bg-green-50"
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </Button>
                                  </>
                                )}
                                {!assignment.submissionId && (
                                  <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setIsUploadOpen(true);
                                    }}
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Submit
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="submissions" className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">My Submissions</h3>
              <ScrollArea className="h-[600px]">
                {assignments.filter(a => a.submissionId).length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Upload className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No submissions yet</p>
                      <p className="text-gray-400">Your submitted work will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  assignments.filter(a => a.submissionId).map((assignment) => (
                    <Card key={assignment.id} className="mb-4 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>
                              Submitted {assignment.submittedAt ? formatTimeAgo(assignment.submittedAt) : 'recently'}
                            </CardDescription>
                            {assignment.grade && (
                              <div className="mt-2">
                                <Badge className="bg-green-600 text-base px-3 py-1">
                                  Grade: {assignment.grade}/100
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={
                              assignment.submissionStatus === 'submitted' ? 'default' :
                              assignment.submissionStatus === 'graded' ? 'secondary' : 'outline'
                            }
                            className={`text-sm px-3 py-1 ${
                              assignment.submissionStatus === 'submitted' ? 'bg-orange-600' :
                              assignment.submissionStatus === 'graded' ? 'bg-green-600' : ''
                            }`}
                          >
                            {assignment.submissionStatus ? assignment.submissionStatus.charAt(0).toUpperCase() + assignment.submissionStatus.slice(1) : 'Submitted'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {assignment.feedback && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">Teacher Feedback:</p>
                              <p className="text-sm text-blue-700 mt-1">{assignment.feedback}</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                Due was: {assignment.dueDate.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="hover:bg-purple-50">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="classmates" className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">My Classmates ({currentStudent?.class_name})</h3>
              <ScrollArea className="h-[600px]">
                {classmates.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No classmates found</p>
                      <p className="text-gray-400">Your classmates will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  classmates.map((classmate) => (
                    <div key={classmate.id} className="flex items-center justify-between p-4 border rounded-lg mb-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-white shadow">
                            <AvatarFallback className={`text-base ${classmate.isOnline ? "bg-green-600 text-white" : "bg-gray-600 text-white"}`}>
                              {getInitials(classmate.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${classmate.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div>
                          <p className="font-semibold text-base">{classmate.username}</p>
                          <p className="text-sm text-gray-600">{classmate.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {classmate.isOnline ? '🟢 Online now' : '⚫ Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={classmate.isOnline ? "default" : "secondary"} className={`${classmate.isOnline ? "bg-green-600" : ""} px-3 py-1`}>
                          {classmate.isOnline ? "Online" : "Offline"}
                        </Badge>
                        <Button variant="ghost" size="sm" className="hover:bg-purple-50" disabled>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    How to Use the Assignment System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-base mb-2 text-blue-800">📥 Viewing Assignments</h4>
                    <ul className="text-sm text-blue-700 space-y-1 ml-4">
                      <li>• Check the "Assignments" tab to see all available assignments</li>
                      <li>• Click "View" to preview assignment documents</li>
                      <li>• Click "Download" to save assignment files to your device</li>
                      <li>• Pay attention to due dates and priority badges</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-base mb-2 text-green-800">📤 Submitting Work</h4>
                    <ul className="text-sm text-green-700 space-y-1 ml-4">
                      <li>• Click "Submit" button on any assignment</li>
                      <li>• Upload your completed work (PDF, DOC, DOCX, images)</li>
                      <li>• Make sure your file is properly named</li>
                      <li>• Submit before the due date to avoid penalties</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-base mb-2 text-purple-800">📊 Tracking Progress</h4>
                    <ul className="text-sm text-purple-700 space-y-1 ml-4">
                      <li>• Check "My Submissions" to see all your submitted work</li>
                      <li>• View grades and feedback from teachers</li>
                      <li>• Read teacher comments for improvement suggestions</li>
                      <li>• Monitor your submission status</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-base mb-2 text-orange-800">💬 Messaging</h4>
                    <ul className="text-sm text-orange-700 space-y-1 ml-4">
                      <li>• Use the "Messages" tab to communicate with teachers and admin</li>
                      <li>• Ask questions about specific assignments</li>
                      <li>• Get help and clarification on coursework</li>
                      <li>• Check online status of teachers for immediate help</li>
                    </ul>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Need Help?</strong> Use the Messages tab to contact your teachers or administrators if you have technical issues or questions about assignments.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModernCalendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </CardContent>
          </Card>

          {/* Notifications */}
          <NotificationPanel 
            notifications={myNotifications} 
            title="My Notifications" 
            maxHeight="h-64"
          />

          {/* Activity Timeline */}
          <ActivityTimeline 
            activities={mockActivities.filter(a => a.userId === user?.id)} 
            title="My Activity" 
            maxHeight="h-48"
          />
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Submit Assignment</DialogTitle>
            <DialogDescription className="text-base">
              Upload your completed work for: <strong>{selectedAssignment?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Due:</strong> {selectedAssignment?.dueDate.toLocaleDateString()} at {selectedAssignment?.dueDate.toLocaleTimeString()}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> {selectedAssignment?.instructions}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Upload Your Work</label>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              {uploadFile && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <File className="h-4 w-4 mr-1" />
                  ✓ Selected: {uploadFile.name}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setIsUploadOpen(false);
                setUploadFile(null);
              }} className="px-6">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitAssignment} 
                className="bg-blue-600 hover:bg-blue-700 px-6"
                disabled={!uploadFile}
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <DocumentPreview
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        documentUrl={previewDocument?.documentUrl}
        documentName={previewDocument?.documentName}
        documentType={previewDocument?.documentType}
        onDownload={() => {
          if (previewDocument?.documentUrl && previewDocument?.documentName) {
            handleDownload(previewDocument.documentUrl, previewDocument.documentName);
          }
          setPreviewDocument(null);
        }}
      />

      {/* AI Tutor Chat Component */}
      <AITutorChat user={user} toast={toast} />
    </div>
  );
}