import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Eye, Edit, Calendar as CalendarIcon, Upload, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import DocumentPreview from '@/components/Shared/DocumentPreview';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Stylish Date Time Display Component
const StylishDateTime = ({ date }) => {
  const formatDate = (dateObj) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
  };

  const formatTime = (dateObj) => {
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return { time: `${hours}:${minutesStr}`, ampm };
  };

  const timeInfo = formatTime(date);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
        <CalendarIcon className="h-3.5 w-3.5 text-red-600" />
        <span className="text-xs font-medium text-red-700">{formatDate(date)}</span>
      </div>
      <div className="flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
        <Clock className="h-3.5 w-3.5 text-purple-600" />
        <span className="text-xs font-semibold text-purple-700">{timeInfo.time}</span>
        <span className="text-[10px] font-bold text-purple-600 bg-purple-200 px-1 py-0.5 rounded">
          {timeInfo.ampm}
        </span>
      </div>
    </div>
  );
};

export default function TeacherAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [teacherSubmissions, setTeacherSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);

  const getCurrentUserId = () => user?.id || localStorage.getItem('userId');

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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const transformedSubmissions = data.submissions.map(sub => ({
          ...sub,
          student_name: sub.student_name || `${sub.firstname || ''} ${sub.sirname || ''}`.trim(),
          document_url: sub.document_url || (sub.document_path ? `http://localhost:5000${sub.document_path}` : null),
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
        headers: { 'Authorization': `Bearer ${token}` }
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
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
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

  const getInitials = (name) => name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);

  const getSubmissionsForAssignment = (assignmentId) => {
    return teacherSubmissions.filter(sub => sub.assignment_id === parseInt(assignmentId));
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-sm text-gray-600 mt-0.5">Manage and view all your assignments</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchTeacherAssignments(true)} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          {assignments.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-base mb-1">No assignments yet</p>
                <p className="text-gray-400 text-sm">Create your first assignment to get started!</p>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => {
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const assignmentSubmissions = getSubmissionsForAssignment(assignment.id);
              const submissionCount = assignmentSubmissions.length;
              
              return (
                <Card key={assignment.id} className="mb-3 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-600">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-gray-800 truncate">{assignment.title}</CardTitle>
                        <CardDescription className="mt-1 text-sm line-clamp-2">{assignment.description}</CardDescription>
                        {assignment.instructions && (
                          <p className="text-xs text-gray-600 mt-1.5 italic line-clamp-1">
                            📝 {assignment.instructions}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs px-2 py-0">
                            {assignment.class}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs px-2 py-0">
                            {assignment.subject}
                          </Badge>
                          {assignment.isEdited && <Badge className="bg-orange-600 text-xs px-2 py-0">Edited</Badge>}
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs px-2 py-0">
                            {formatTimeAgo(assignment.createdAt)}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant={daysUntilDue < 0 ? "destructive" : daysUntilDue <= 2 ? "default" : "secondary"} 
                        className={`text-xs px-2.5 py-1 flex-shrink-0 ${daysUntilDue <= 2 && daysUntilDue >= 0 ? "bg-orange-600" : ""}`}
                      >
                        {daysUntilDue < 0 ? "Overdue" : `${daysUntilDue}d left`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {submissionCount > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-blue-900">📝 Submissions ({submissionCount})</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedAssignmentForSubmissions(assignment)}
                            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 h-7 text-xs"
                          >
                            View All <Eye className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                        <div className="space-y-1.5">
                          {assignmentSubmissions.slice(0, 2).map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-blue-600 text-white text-[10px]">
                                    {getInitials(sub.student_name || 'Student')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-medium">{sub.student_name}</p>
                                  <p className="text-[10px] text-gray-500">{formatTimeAgo(new Date(sub.submitted_at))}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={sub.status === 'submitted' ? 'default' : 'secondary'}
                                className={`text-[10px] px-1.5 py-0.5 ${sub.status === 'submitted' ? 'bg-orange-600' : 'bg-green-600'}`}
                              >
                                {sub.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <StylishDateTime date={assignment.dueDate} />
                        <span className="text-xs text-gray-600 flex items-center bg-gray-50 px-2 py-1 rounded">
                          <Upload className="h-3 w-3 mr-1" />
                          {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {assignment.documentUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPreviewDocument(assignment)} 
                            className="hover:bg-blue-50 h-8 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />View Doc
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-green-50 h-8 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </ScrollArea>
      )}

      <DocumentPreview 
        isOpen={!!previewDocument} 
        onClose={() => setPreviewDocument(null)} 
        documentUrl={previewDocument?.documentUrl} 
        documentName={previewDocument?.documentName} 
        documentType={previewDocument?.documentType} 
        onDownload={() => {
          if (previewDocument?.documentUrl) {
            const link = document.createElement('a');
            link.href = previewDocument.documentUrl;
            link.download = previewDocument.documentName || 'document';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "Success", description: "Document downloaded successfully!" });
          }
          setPreviewDocument(null);
        }} 
      />

      {selectedAssignmentForSubmissions && (
        <Dialog open={!!selectedAssignmentForSubmissions} onOpenChange={() => setSelectedAssignmentForSubmissions(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedAssignmentForSubmissions.title}</DialogTitle>
              <DialogDescription className="text-sm">View all submissions for this assignment</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] mt-3">
              {getSubmissionsForAssignment(selectedAssignmentForSubmissions.id).map((sub) => (
                <Card key={sub.id} className="mb-3">
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-red-600 text-white text-sm">
                            {getInitials(sub.student_name || 'Student')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{sub.student_name}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(new Date(sub.submitted_at))}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${sub.status === 'submitted' ? 'bg-orange-600' : 'bg-green-600'}`}>
                        {sub.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}