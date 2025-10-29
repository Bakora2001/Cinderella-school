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
    const typeMap = {'pdf': 'application/pdf', 'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'txt': 'text/plain', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'mp4': 'video/mp4', 'avi': 'video/x-msvideo', 'mov': 'video/quicktime', 'wmv': 'video/x-ms-wmv'};
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
        if (showRefreshToast) toast({title: "Success", description: `Loaded ${transformedAssignments.length} assignment${transformedAssignments.length !== 1 ? 's' : ''}`});
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({title: "Error", description: "Failed to fetch assignments", variant: "destructive"});
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600 mt-1">Manage and view all your assignments</p>
        </div>
        <Button variant="outline" onClick={() => fetchTeacherAssignments(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          {assignments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No assignments yet</p>
                <p className="text-gray-400">Create your first assignment to get started!</p>
              </CardContent>
            </Card>
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
                        {assignment.instructions && (
                          <p className="text-sm text-gray-600 mt-2 italic">Instructions: {assignment.instructions}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">{assignment.class}</Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">{assignment.subject}</Badge>
                          {assignment.isEdited && <Badge className="bg-orange-600">Edited</Badge>}
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
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Due: {assignment.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Upload className="h-4 w-4 mr-1" />
                          Submissions: {submissionCount}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {assignment.documentUrl && (
                          <Button variant="outline" size="sm" onClick={() => setPreviewDocument(assignment)} className="hover:bg-blue-50">
                            <Eye className="h-4 w-4 mr-1" />View Document
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="hover:bg-green-50">
                          <Edit className="h-4 w-4 mr-1" />Edit
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
            toast({title: "Success", description: "Document downloaded successfully!"});
          }
          setPreviewDocument(null);
        }} 
      />

      {selectedAssignmentForSubmissions && (
        <Dialog open={!!selectedAssignmentForSubmissions} onOpenChange={() => setSelectedAssignmentForSubmissions(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedAssignmentForSubmissions.title}</DialogTitle>
              <DialogDescription>View all submissions for this assignment</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] mt-4">
              {getSubmissionsForAssignment(selectedAssignmentForSubmissions.id).map((sub) => (
                <Card key={sub.id} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getInitials(sub.student_name || 'Student')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{sub.student_name}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(new Date(sub.submitted_at))}
                          </p>
                        </div>
                      </div>
                      <Badge className={sub.status === 'submitted' ? 'bg-orange-600' : 'bg-green-600'}>
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