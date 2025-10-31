import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  Eye, 
  Edit, 
  CalendarIcon, 
  Upload, 
  Clock,
  Download,
  X,
  File,
  Video,
  Image as ImageIcon,
  FileCode
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
        <div className="mt-4">{renderPreview()}</div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Countdown Timer Component
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{value}</span>
          </div>
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

export default function TeacherAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [teacherSubmissions, setTeacherSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  const getCurrentUserId = () => {
    return user?.id || localStorage.getItem('userId');
  };

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

  const fetchTeacherSubmissions = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/submissions/teacher/${currentUserId}/submissions`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      
      const data = await response.json();
      
      if (data.success) {
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
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchTeacherAssignments = async (showRefreshToast = false) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      setLoading(!showRefreshToast);
      setRefreshing(showRefreshToast);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/assignments/teacher/${currentUserId}`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await response.json();
      
      if (data.success) {
        const transformedAssignments = data.assignments.map(assignment => ({
          id: assignment.id.toString(),
          teacherId: assignment.teacher_id.toString(),
          teacherName: user?.name || 'Teacher',
          title: assignment.title,
          description: assignment.description || '',
          instructions: assignment.instructions || '',
          subject: user?.subject || 'General',
          class: assignment.class_name,
          dueDate: new Date(assignment.due_date),
          createdAt: new Date(assignment.created_at),
          updatedAt: new Date(assignment.updated_at || assignment.created_at),
          documentUrl: assignment.document_path ? `http://localhost:5000${assignment.document_path}` : null,
          documentName: assignment.document_path ? assignment.document_path.split('/').pop() : null,
          documentType: assignment.document_path ? getDocumentTypeFromPath(assignment.document_path) : null,
          isEdited: new Date(assignment.updated_at || assignment.created_at).getTime() !== new Date(assignment.created_at).getTime()
        }));
        
        setAssignments(transformedAssignments);
        
        if (showRefreshToast) {
          toast({
            title: "Success",
            description: `Loaded ${transformedAssignments.length} assignment${transformedAssignments.length !== 1 ? 's' : ''}`
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

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      fetchTeacherAssignments();
      fetchTeacherSubmissions();
    }
  }, [user?.id]);

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    return Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Format date in EAT timezone with 12-hour format
  const formatEATDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi'
    }) + ' EAT';
  };

  const handleDownload = async (documentUrl, documentName) => {
    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentName || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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

  const getSubmissionsForAssignment = (assignmentId) => {
    return teacherSubmissions.filter(sub => sub.assignment_id === parseInt(assignmentId));
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{ zoom: '0.8' }}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Assignments</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all your assignments ({assignments.length} total)</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchTeacherAssignments(true)}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid gap-4">
            {filteredAssignments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No assignments found</p>
                  <p className="text-gray-400">Create your first assignment to get started!</p>
                </CardContent>
              </Card>
            ) : (
              filteredAssignments.map((assignment) => {
                const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                const assignmentSubmissions = getSubmissionsForAssignment(assignment.id);
                const submissionCount = assignmentSubmissions.length;
                
                return (
                  <Card key={assignment.id} className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-600">
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
                              {assignment.subject}
                            </Badge>
                            {assignment.isEdited && (
                              <Badge className="bg-orange-600">Edited</Badge>
                            )}
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              Created {formatTimeAgo(assignment.createdAt)}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          variant={daysUntilDue < 0 ? "destructive" : daysUntilDue <= 2 ? "default" : "secondary"}
                          className={`text-base px-3 py-1 ${daysUntilDue <= 2 && daysUntilDue >= 0 ? "bg-orange-600" : ""}`}
                        >
                          {daysUntilDue < 0 ? "Overdue" : `${daysUntilDue} days left`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <CountdownTimer dueDate={assignment.dueDate} />
                      </div>

                      {/* Submission Summary */}
                      {submissionCount > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-blue-900">📝 Recent Submissions ({submissionCount})</h4>
                          </div>
                          <div className="space-y-2">
                            {assignmentSubmissions.slice(0, 3).map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                    {getInitials(sub.student_name || 'Student')}
                                  </div>
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
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-sm text-gray-600 flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span className="font-semibold">Due:</span>
                            <span className="ml-1 text-red-600 font-bold">
                              {formatEATDateTime(assignment.dueDate)}
                            </span>
                          </span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Upload className="h-4 w-4 mr-1" />
                            <span className="font-semibold">Submissions:</span>
                            <span className="ml-1 text-blue-600 font-bold">{submissionCount}</span>
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
                          <Button variant="outline" size="sm" className="hover:bg-orange-50">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      )}

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
    </div>
  );
}