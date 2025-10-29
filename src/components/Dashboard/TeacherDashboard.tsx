import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Download, Eye, Edit, Calendar as CalendarIcon, Clock, Users, MessageSquare, Plus, Search, X, File, Video, Image as ImageIcon, FileCode, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ActivityTimeline from '../Shared/ActivityTimeline';
import { mockActivities } from '../../data/mockData';
import { useToast } from '@/hooks/use-toast';

const CircularClock = ({ selectedTime, onTimeChange }) => {
  const [hours, setHours] = useState(selectedTime.getHours());
  const [minutes, setMinutes] = useState(selectedTime.getMinutes());
  const [isHourMode, setIsHourMode] = useState(true);
  const handleClockClick = (e) => {
    const clock = e.currentTarget;
    const rect = clock.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
    if (isHourMode) {
      const newHours = Math.round(degrees / 30) % 12 || 12;
      setHours(newHours);
      const newDate = new Date(selectedTime);
      newDate.setHours(newHours);
      onTimeChange(newDate);
    } else {
      const newMinutes = Math.round(degrees / 6) % 60;
      setMinutes(newMinutes);
      const newDate = new Date(selectedTime);
      newDate.setMinutes(newMinutes);
      onTimeChange(newDate);
    }
  };
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 text-3xl font-bold">
        <button onClick={() => setIsHourMode(true)} className={`px-4 py-2 rounded-lg transition-colors ${isHourMode ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{hours.toString().padStart(2, '0')}</button>
        <span className="py-2">:</span>
        <button onClick={() => setIsHourMode(false)} className={`px-4 py-2 rounded-lg transition-colors ${!isHourMode ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{minutes.toString().padStart(2, '0')}</button>
      </div>
      <div className="relative w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full shadow-inner cursor-pointer" onClick={handleClockClick}>
        {(isHourMode ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]).map((num, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const radius = 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return <div key={num} className="absolute text-sm font-semibold text-gray-600" style={{left: `calc(50% + ${x}px - 10px)`, top: `calc(50% + ${y}px - 10px)`, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{num}</div>;
        })}
        <div className="absolute w-1 bg-red-600 origin-bottom rounded-full transition-transform duration-200" style={{height: '80px', left: 'calc(50% - 2px)', top: 'calc(50% - 80px)', transform: `rotate(${isHourMode ? (hours % 12) * 30 : minutes * 6}deg)`}}>
          <div className="absolute -top-2 -left-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white" />
        </div>
        <div className="absolute w-3 h-3 bg-red-600 rounded-full" style={{ left: 'calc(50% - 6px)', top: 'calc(50% - 6px)' }} />
      </div>
    </div>
  );
};

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
  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`empty-${i}`} className="h-10" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selected && selected.getDate() === day && selected.getMonth() === currentMonth.getMonth();
    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
    days.push(<button key={day} onClick={() => handleDateClick(day)} className={`h-10 rounded-full transition-all hover:bg-red-100 ${isSelected ? 'bg-red-600 text-white font-bold shadow-lg scale-110' : isToday ? 'bg-red-100 text-red-600 font-semibold' : 'text-gray-700 hover:scale-105'}`}>{day}</button>);
  }
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">←</button>
        <h3 className="text-lg font-bold text-gray-800">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">→</button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">{dayNames.map(day => <div key={day} className="text-center text-xs font-semibold text-gray-500">{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-2">{days}</div>
    </div>
  );
};

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
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20">
          <svg className="transform -rotate-90 w-20 h-20">
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200" />
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={color} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold">{value}</span></div>
        </div>
        <span className="text-xs text-gray-600 mt-1">{label}</span>
      </div>
    );
  };
  return (
    <div className="flex justify-around items-center gap-2">
      <CircularProgress value={timeLeft.days} max={30} label="Days" color="text-red-600" />
      <CircularProgress value={timeLeft.hours} max={24} label="Hours" color="text-orange-600" />
      <CircularProgress value={timeLeft.minutes} max={60} label="Minutes" color="text-blue-600" />
      <CircularProgress value={timeLeft.seconds} max={60} label="Seconds" color="text-green-600" />
    </div>
  );
};

const DocumentPreview = ({ isOpen, onClose, documentUrl, documentName, documentType, onDownload }) => {
  const getFileIcon = () => {
    if (!documentType) return <File className="h-12 w-12 text-gray-400" />;
    if (documentType.includes('video')) return <Video className="h-12 w-12 text-purple-600" />;
    if (documentType.includes('image')) return <ImageIcon className="h-12 w-12 text-blue-600" />;
    if (documentType.includes('pdf')) return <FileText className="h-12 w-12 text-red-600" />;
    return <FileCode className="h-12 w-12 text-green-600" />;
  };
  const renderPreview = () => {
    if (!documentUrl || !documentType) return <div className="flex flex-col items-center justify-center h-96 text-gray-400">{getFileIcon()}<p className="mt-4">No preview available</p></div>;
    if (documentType.includes('image')) return <img src={documentUrl} alt={documentName} className="max-w-full h-auto rounded-lg" />;
    if (documentType.includes('video')) return <video controls className="w-full rounded-lg"><source src={documentUrl} type={documentType} />Your browser does not support the video tag.</video>;
    if (documentType.includes('pdf')) return <iframe src={documentUrl} className="w-full h-96 rounded-lg border" title={documentName} />;
    return <div className="flex flex-col items-center justify-center h-96 text-gray-600">{getFileIcon()}<p className="mt-4 text-center">Preview not available for this file type<br />Click download to view</p></div>;
  };
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>{documentName || 'Document Preview'}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>
        <div className="mt-4">{renderPreview()}</div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onDownload}><Download className="h-4 w-4 mr-2" />Download</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [teacherSubmissions, setTeacherSubmissions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
  const [newAssignment, setNewAssignment] = useState({teacherId: '', title: '', description: '', instructions: '', class: '', dueDate: new Date(), documentFile: null});

  // Get current user ID consistently
  const getCurrentUserId = () => {
    return user?.id || localStorage.getItem('userId');
  };

  const getDocumentTypeFromPath = (filePath) => {
    if (!filePath) return 'application/octet-stream';
    const ext = filePath.split('.').pop()?.toLowerCase();
    const typeMap = {'pdf': 'application/pdf', 'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'txt': 'text/plain', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'mp4': 'video/mp4', 'avi': 'video/x-msvideo', 'mov': 'video/quicktime', 'wmv': 'video/x-ms-wmv'};
    return typeMap[ext || ''] || 'application/octet-stream';
  };

  const fetchTeacherSubmissions = async (showRefreshToast = false) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      setSubmissionsLoading(!showRefreshToast);
      const token = localStorage.getItem('token');
      
      
      const response = await fetch(`http://localhost:5000/api/submissions/teacher/${currentUserId}/submissions`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Transform the submissions data to ensure proper formatting
        const transformedSubmissions = data.submissions.map(sub => ({
          ...sub,
          id: sub.id,
          assignment_id: sub.assignment_id,
          student_id: sub.student_id,
          assignment_title: sub.assignment_title,
          student_name: sub.student_name || `${sub.firstname || ''} ${sub.sirname || ''}`.trim(),
          student_class: sub.student_class || sub.assignment_class,
          document_path: sub.document_path,
          document_url: sub.document_url || (sub.document_path ? `http://localhost:5000${sub.document_path}` : null),
          status: sub.status,
          submitted_at: sub.submitted_at,
          grade: sub.grade,
          feedback: sub.feedback,
          created_at: sub.created_at,
          updated_at: sub.updated_at
        }));
        
        setTeacherSubmissions(transformedSubmissions);
        
        if (showRefreshToast) {
          toast({
            title: "Success", 
            description: `Loaded ${transformedSubmissions.length} submission${transformedSubmissions.length !== 1 ? 's' : ''}`
          });
        }
      } else {
        console.error('❌ API Error:', data.message);
        throw new Error(data.message || 'Failed to fetch submissions');
      }
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to fetch submissions", 
        variant: "destructive"
      });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchTeacherAssignments = async (showRefreshToast = false) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      setLoading(!showRefreshToast);
      setRefreshing(showRefreshToast);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/assignments/teacher/${currentUserId}`, {headers: {'Authorization': `Bearer ${token}`}});
      const data = await response.json();
      if (data.success) {
        const transformedAssignments = data.assignments.map(assignment => ({
          id: assignment.id.toString(), teacherId: assignment.teacher_id.toString(), teacherName: user?.name || 'Teacher', title: assignment.title, description: assignment.description || '', instructions: assignment.instructions || '', subject: user?.subject || 'General', class: assignment.class_name, dueDate: new Date(assignment.due_date), createdAt: new Date(assignment.created_at), updatedAt: new Date(assignment.updated_at || assignment.created_at), documentUrl: assignment.document_path ? `http://localhost:5000${assignment.document_path}` : null, documentName: assignment.document_path ? assignment.document_path.split('/').pop() : null, documentType: assignment.document_path ? getDocumentTypeFromPath(assignment.document_path) : null, isEdited: new Date(assignment.updated_at || assignment.created_at).getTime() !== new Date(assignment.created_at).getTime()
        }));
        setAssignments(transformedAssignments);
        if (showRefreshToast) toast({title: "Success", description: `Loaded ${transformedAssignments.length} assignment${transformedAssignments.length !== 1 ? 's' : ''}`});
      } else throw new Error(data.message || 'Failed to fetch assignments');
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({title: "Error", description: error instanceof Error ? error.message : "Failed to fetch assignments", variant: "destructive"});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
const fetchUsers = async () => {
  try {
    const url = 'http://localhost:5000/api/users/getallusers';
    
    const response = await fetch(url);
    
    if (!response.ok) {
     // Try to get error details from response body
      const errorText = await response.text();

      console.log(errorText, "Get all users cracked")
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ [FRONTEND DEBUG] Success! Processing', data.users.length, 'users');
      setUsers(data.users.map((user) => ({
        ...user, 
        username: `${user.username || ''}`.trim() || user.email.split('@')[0], 
        class_name: user.class_name, 
        isOnline: false, 
        lastActive: new Date()
      })));
    } else {
      console.error('❌ [FRONTEND DEBUG] API returned success: false', data.message);
    }
    
  } catch (error) {
    console.error('❌ [FRONTEND DEBUG] Network/fetch error:', error);
    console.error('❌ [FRONTEND DEBUG] Error name:', error.name);
    console.error('❌ [FRONTEND DEBUG] Error message:', error.message);
  }
};

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/active-users');
      const data = await response.json();
      if (data.success) {
        setActiveUsers(data.users);
        setUsers(prevUsers => prevUsers.map(user => ({...user, isOnline: data.users.some((activeUser) => activeUser.id === user.id)})));
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      console.log('🚀 TeacherDashboard mounted for user:', currentUserId);
      fetchUsers();
      fetchActiveUsers();
      fetchTeacherAssignments();
      fetchTeacherSubmissions();
      const interval = setInterval(fetchActiveUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const students = users.filter(u => u.role === 'student');
  const stats = {
    myAssignments: assignments.length, 
    totalSubmissions: teacherSubmissions.length, 
    pendingReviews: teacherSubmissions.filter(s => s.status === 'submitted').length, 
    onlineStudents: students.filter(s => s.isOnline).length, 
    totalStudents: students.length, 
    totalOnlineUsers: activeUsers.length
  };
  
  const getInitials = (name) => name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    return Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.description || !newAssignment.class) {
      toast({title: "Error", description: "Please fill in all required fields", variant: "destructive"});
      return;
    }
    try {
      const formData = new FormData();
      if (newAssignment.documentFile) formData.append('document', newAssignment.documentFile);
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('instructions', newAssignment.instructions);
      formData.append('class_name', newAssignment.class);
      formData.append('due_date', newAssignment.dueDate.toISOString());
      
      const currentUserId = getCurrentUserId();
      formData.append('teacherId', currentUserId || '');
      
      const response = await fetch('http://localhost:5000/api/assignments/new', {method: 'POST', headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}, body: formData});
      const data = await response.json();
      if (data.success) {
        toast({title: "Success", description: `Assignment "${newAssignment.title}" created successfully!`});
        await fetchTeacherAssignments(false);
        setNewAssignment({teacherId: '', title: '', description: '', instructions: '', class: '', dueDate: new Date(), documentFile: null});
        setIsCreateAssignmentOpen(false);
      } else throw new Error(data.message || 'Failed to create assignment');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({title: "Error", description: error instanceof Error ? error.message : "Failed to create assignment. Please try again.", variant: "destructive"});
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) setNewAssignment({ ...newAssignment, documentFile: file });
  };

  const handleDownload = async (submissionId, documentName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/submissions/download/${submissionId}`, {headers: {'Authorization': `Bearer ${token}`}});
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({title: "Success", description: "Document downloaded successfully!"});
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({title: "Error", description: "Failed to download document.", variant: "destructive"});
    }
  };

  const handleRefreshAssignments = () => fetchTeacherAssignments(true);
  const handleRefreshSubmissions = () => fetchTeacherSubmissions(true);
  
  const filteredSubmissions = teacherSubmissions.filter(submission => {
    const matchesSearch = submission.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || submission.assignment_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getSubmissionsForAssignment = (assignmentId) => {
    return teacherSubmissions.filter(sub => sub.assignment_id === parseInt(assignmentId));
  };

  const availableClasses = [...new Set(students.map(s => s.class_name).filter(Boolean))];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
            <FileText className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.myAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">Active assignments</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Upload className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Students</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.onlineStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 shadow-lg">
        <CardHeader><CardTitle className="text-purple-800 dark:text-purple-200 text-xl">🎓 School Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow"><div className="text-3xl font-bold text-purple-600">{stats.totalStudents}</div><p className="text-sm text-purple-600 font-medium mt-1">Total Students</p></div>
            <div className="text-center p-4 bg-white rounded-lg shadow"><div className="text-3xl font-bold text-green-600">{stats.onlineStudents}</div><p className="text-sm text-green-600 font-medium mt-1">Students Online</p></div>
            <div className="text-center p-4 bg-white rounded-lg shadow"><div className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'teacher').length}</div>
            <p className="text-sm text-blue-600 font-medium mt-1">Total Teachers</p></div>
            <div className="text-center p-4 bg-white rounded-lg shadow"><div className="text-3xl font-bold text-red-600">{stats.totalOnlineUsers}</div><p className="text-sm text-red-600 font-medium mt-1">All Online</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="assignments" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-md">
              <TabsTrigger value="assignments" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">My Assignments</TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Submissions</TabsTrigger>
              <TabsTrigger value="students" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Students</TabsTrigger>
            </TabsList>

            <TabsContent value="assignments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Assignment Management</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRefreshAssignments} disabled={refreshing} className="shadow-sm hover:shadow-md transition-all">
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />Refresh
                  </Button>
                  <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all"><Plus className="h-4 w-4 mr-2" />Create Assignment</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Create New Assignment</DialogTitle>
                        <DialogDescription>Create a new assignment for your students with detailed instructions</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="title" className="text-base font-semibold">Assignment Title *</Label>
                            <Input id="title" value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} placeholder="Enter assignment title" className="mt-1" />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                            <Textarea id="description" value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} placeholder="Describe the assignment" rows={3} className="mt-1" />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="instructions" className="text-base font-semibold">Instructions</Label>
                            <Textarea id="instructions" value={newAssignment.instructions} onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })} placeholder="Provide detailed instructions for students" rows={4} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="class" className="text-base font-semibold">Class *</Label>
                            <Select value={newAssignment.class} onValueChange={(value) => setNewAssignment({ ...newAssignment, class: value })}>
                              <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                              <SelectContent>
                                {availableClasses.map(className => <SelectItem key={className} value={className}>{className}</SelectItem>)}
                                <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                                <SelectItem value="Grade 10B">Grade 10B</SelectItem>
                                <SelectItem value="Grade 11A">Grade 11A</SelectItem>
                                <SelectItem value="Grade 11B">Grade 11B</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Assignment Document (Optional)</Label>
                            <Input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv" className="mt-1" />
                            {newAssignment.documentFile && <p className="text-sm text-green-600 mt-2 flex items-center"><File className="h-4 w-4 mr-1" />{newAssignment.documentFile.name}</p>}
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <Label className="text-base font-semibold mb-3 block">Due Date & Time *</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><ModernCalendar selectedDate={newAssignment.dueDate} onDateChange={(date) => {const newDate = new Date(date); newDate.setHours(newAssignment.dueDate.getHours()); newDate.setMinutes(newAssignment.dueDate.getMinutes()); setNewAssignment({ ...newAssignment, dueDate: newDate });}} /></div>
                            <div><CircularClock selectedTime={newAssignment.dueDate} onTimeChange={(date) => setNewAssignment({ ...newAssignment, dueDate: date })} /></div>
                          </div>
                          <p className="text-center mt-4 text-lg font-semibold text-gray-700">Selected: {newAssignment.dueDate.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                          <Button variant="outline" onClick={() => setIsCreateAssignmentOpen(false)} className="px-6">Cancel</Button>
                          <Button onClick={handleCreateAssignment} className="bg-red-600 hover:bg-red-700 px-6">Create Assignment</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>
              ) : (
                <ScrollArea className="h-[600px]">
                  {assignments.length === 0 ? (
                    <Card className="text-center py-12"><CardContent><FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500 text-lg mb-2">No assignments yet</p><p className="text-gray-400">Create your first assignment to get started!</p></CardContent></Card>
                  ) : (
                    assignments.map((assignment) => {
                      const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                      const assignmentSubmissions = getSubmissionsForAssignment(assignment.id);
                      const submissionCount = assignmentSubmissions.length;
                      return (
                        <Card key={assignment.id} className="mb-4 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-600">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-xl text-gray-800">{assignment.title}</CardTitle>
                                <CardDescription className="mt-1 text-base">{assignment.description}</CardDescription>
                                {assignment.instructions && <p className="text-sm text-gray-600 mt-2 italic">Instructions: {assignment.instructions}</p>}
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">{assignment.class}</Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">{assignment.subject}</Badge>
                                  {assignment.isEdited && <Badge className="bg-orange-600">Edited</Badge>}
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Created {formatTimeAgo(assignment.createdAt)}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={daysUntilDue < 0 ? "destructive" : daysUntilDue <= 2 ? "default" : "secondary"} className={`text-base px-3 py-1 ${daysUntilDue <= 2 && daysUntilDue >= 0 ? "bg-orange-600" : ""}`}>
                                  {daysUntilDue < 0 ? "Overdue" : `${daysUntilDue} days left`}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4"><CountdownTimer dueDate={assignment.dueDate} /></div>
                            
                            {/* Submission Summary - ENHANCED */}
                            {submissionCount > 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-blue-900">📝 Recent Submissions ({submissionCount})</h4>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedAssignmentForSubmissions(assignment)}
                                    className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                                  >
                                    View All <Eye className="h-4 w-4 ml-1" />
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {assignmentSubmissions.slice(0, 3).map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                                            {getInitials(sub.student_name || 'Student')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-sm font-medium">{sub.student_name}</p>
                                          <p className="text-xs text-gray-500">{formatTimeAgo(new Date(sub.submitted_at))}</p>
                                        </div>
                                      </div>
                                      <Badge 
                                        variant={sub.status === 'submitted' ? 'default' : 'secondary'}
                                        className={`text-xs ${sub.status === 'submitted' ? 'bg-orange-600' : 'bg-green-600'}`}
                                      >
                                        {sub.status}
                                      </Badge>
                                    </div>
                                  ))}
                                  {submissionCount > 3 && (
                                    <p className="text-xs text-blue-600 text-center mt-2">
                                      +{submissionCount - 3} more submissions
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 flex items-center"><CalendarIcon className="h-4 w-4 mr-1" />Due: {assignment.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-sm text-gray-600 flex items-center"><Upload className="h-4 w-4 mr-1" />Submissions: {submissionCount}</span>
                              </div>
                              <div className="flex gap-2">
                                {assignment.documentUrl && <Button variant="outline" size="sm" onClick={() => setPreviewDocument(assignment)} className="hover:bg-blue-50"><Eye className="h-4 w-4 mr-1" />View Document</Button>}
                                <Button variant="outline" size="sm" className="hover:bg-green-50"><Edit className="h-4 w-4 mr-1" />Edit</Button>
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
              <div className="flex justify-between items-center flex-wrap gap-3">
                <h3 className="text-xl font-bold text-gray-800">Student Submissions ({teacherSubmissions.length})</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRefreshSubmissions} disabled={submissionsLoading} className="shadow-sm hover:shadow-md transition-all">
                    <RefreshCw className={`h-4 w-4 mr-2 ${submissionsLoading ? 'animate-spin' : ''}`} />Refresh
                  </Button>
                  <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Search submissions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" /></div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {submissionsLoading ? (
                <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>
              ) : (
                <ScrollArea className="h-[600px]">
                  {filteredSubmissions.length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Upload className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-2">
                          {teacherSubmissions.length === 0 ? 'No submissions yet' : 'No submissions match your search'}
                        </p>
                        <p className="text-gray-400">
                          {teacherSubmissions.length === 0 ? 'Students will submit their work here' : 'Try adjusting your search or filter criteria'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <Card key={submission.id} className="mb-4 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{submission.assignment_title}</CardTitle>
                              <CardDescription className="mt-1">Submitted by <span className="font-semibold">{submission.student_name}</span></CardDescription>
                              <p className="text-sm text-gray-600 mt-1 flex items-center"><Clock className="h-4 w-4 mr-1" />{formatTimeAgo(new Date(submission.submitted_at))}</p>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 mt-2">{submission.student_class}</Badge>
                            </div>
                            <Badge variant={submission.status === 'submitted' ? 'default' : submission.status === 'reviewed' ? 'secondary' : 'outline'} className={`text-sm px-3 py-1 ${submission.status === 'submitted' ? 'bg-orange-600' : submission.status === 'reviewed' ? 'bg-green-600' : ''}`}>
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              {submission.grade && <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Grade: {submission.grade}/100</span>}
                              {submission.document_path && <span className="text-sm text-gray-600 flex items-center"><File className="h-4 w-4 mr-1" />{submission.document_path.split('/').pop()}</span>}
                            </div>
                            <div className="flex gap-2">
                              {submission.document_url && <Button variant="outline" size="sm" onClick={() => setPreviewDocument({documentUrl: submission.document_url, documentName: submission.document_path.split('/').pop(), documentType: getDocumentTypeFromPath(submission.document_path)})} className="hover:bg-blue-50"><Eye className="h-4 w-4 mr-1" />View</Button>}
                              <Button variant="outline" size="sm" onClick={() => handleDownload(submission.id.toString(), submission.document_path.split('/').pop())} className="hover:bg-green-50"><Download className="h-4 w-4 mr-1" />Download</Button>
                              <Button variant="outline" size="sm" className="hover:bg-purple-50"><MessageSquare className="h-4 w-4 mr-1" />Review</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">My Students ({stats.totalStudents} total)</h3>
              <ScrollArea className="h-[600px]">
                {students.length === 0 ? (
                  <Card className="text-center py-12"><CardContent><Users className="h-16 w-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500 text-lg mb-2">No students found</p><p className="text-gray-400">Students will appear here once they join your classes</p></CardContent></Card>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg mb-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-white shadow">
                            <AvatarFallback className={`text-base ${student.isOnline ? "bg-green-600 text-white" : "bg-gray-600 text-white"}`}>{getInitials(student.username)}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${student.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div>
                          <p className="font-semibold text-base">{student.username}</p>
                          <p className="text-sm text-gray-600">{student.class_name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">{student.isOnline ? '🟢 Online now' : `⚫ Last seen ${formatTimeAgo(student.lastActive || new Date())}`}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={student.isOnline ? "default" : "secondary"} className={`${student.isOnline ? "bg-green-600" : ""} px-3 py-1`}>{student.isOnline ? "Online" : "Offline"}</Badge>
                        <Button variant="ghost" size="sm" className="hover:bg-purple-50"><MessageSquare className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><CalendarIcon className="h-5 w-5 text-red-600" />Calendar</CardTitle></CardHeader>
            <CardContent><ModernCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} /></CardContent>
          </Card>
          <ActivityTimeline activities={mockActivities.filter(a => a.userId === getCurrentUserId())} title="My Activity" maxHeight="h-64" />
        </div>
      </div>

      <DocumentPreview 
        isOpen={!!previewDocument} 
        onClose={() => setPreviewDocument(null)} 
        documentUrl={previewDocument?.documentUrl} 
        documentName={previewDocument?.documentName} 
        documentType={previewDocument?.documentType} 
        onDownload={() => {
          if (previewDocument?.documentUrl) {
            // For assignment documents - direct download from URL
            const link = document.createElement('a');
            link.href = previewDocument.documentUrl;
            link.download = previewDocument.documentName || 'document';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({title: "Success", description: "Document downloaded successfully!"});
          }
          setPreviewDocument(null);
        }} 
      />

      {/* Assignment Submissions Dialog */}
      <Dialog open={!!selectedAssignmentForSubmissions} onOpenChange={() => setSelectedAssignmentForSubmissions(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl">{selectedAssignmentForSubmissions?.title}</DialogTitle>
                <DialogDescription className="mt-2">
                  View all submissions for this assignment
                </DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedAssignmentForSubmissions(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedAssignmentForSubmissions && (
            <div className="space-y-4 mt-4">
              {/* Assignment Info Summary */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="font-semibold text-lg">{selectedAssignmentForSubmissions.class}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-semibold text-lg">
                        {new Date(selectedAssignmentForSubmissions.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Submissions</p>
                      <p className="font-semibold text-lg text-blue-600">
                        {getSubmissionsForAssignment(selectedAssignmentForSubmissions.id).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending Review</p>
                      <p className="font-semibold text-lg text-orange-600">
                        {getSubmissionsForAssignment(selectedAssignmentForSubmissions.id).filter(s => s.status === 'submitted').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submissions List */}
              <ScrollArea className="h-[500px]">
                {getSubmissionsForAssignment(selectedAssignmentForSubmissions.id).length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Upload className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No submissions yet</p>
                      <p className="text-gray-400">Students haven't submitted their work for this assignment</p>
                    </CardContent>
                  </Card>
                ) : (
                  getSubmissionsForAssignment(selectedAssignmentForSubmissions.id).map((submission) => (
                    <Card key={submission.id} className="mb-4 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-white shadow">
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                {getInitials(submission.student_name || 'Student')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{submission.student_name}</CardTitle>
                              <CardDescription className="mt-1">
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Submitted {formatTimeAgo(new Date(submission.submitted_at))}
                                </span>
                              </CardDescription>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 mt-2">
                                {submission.student_class || 'No Class'}
                              </Badge>
                            </div>
                          </div>
                          <Badge 
                            variant={submission.status === 'submitted' ? 'default' : submission.status === 'reviewed' ? 'secondary' : 'outline'} 
                            className={`text-sm px-3 py-1 ${submission.status === 'submitted' ? 'bg-orange-600' : submission.status === 'reviewed' ? 'bg-green-600' : ''}`}
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            {submission.grade && (
                              <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                Grade: {submission.grade}/100
                              </span>
                            )}
                            {submission.document_path && (
                              <span className="text-sm text-gray-600 flex items-center">
                                <File className="h-4 w-4 mr-1" />
                                {submission.document_path.split('/').pop()}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {submission.document_url && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPreviewDocument({
                                  documentUrl: submission.document_url, 
                                  documentName: submission.document_path.split('/').pop(), 
                                  documentType: getDocumentTypeFromPath(submission.document_path)
                                })} 
                                className="hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-1" />View
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownload(submission.id.toString(), submission.document_path.split('/').pop())} 
                              className="hover:bg-green-50"
                            >
                              <Download className="h-4 w-4 mr-1" />Download
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-purple-50">
                              <MessageSquare className="h-4 w-4 mr-1" />Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}