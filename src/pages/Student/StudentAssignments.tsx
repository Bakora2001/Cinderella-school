import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText, Upload, Download, Eye, Calendar as CalendarIcon,
  Clock, CheckCircle, AlertCircle, Search, RefreshCw, X, File
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  return (
    <div className="flex justify-around items-center gap-2 text-sm">
      <div className="text-center">
        <div className="font-bold text-lg">{timeLeft.days}</div>
        <div className="text-xs text-gray-600">Days</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg">{timeLeft.hours}</div>
        <div className="text-xs text-gray-600">Hours</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-600">Mins</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-600">Secs</div>
      </div>
    </div>
  );
};

export default function StudentAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, submitted, overdue

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

  const fetchAssignments = async (showRefreshToast = false) => {
    if (!user?.id) return;
    
    try {
      setLoading(!showRefreshToast);
      setRefreshing(showRefreshToast);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/assignments/student/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const transformedAssignments = data.assignments.map(assignment => ({
          id: assignment.id.toString(),
          teacherId: assignment.teacher_id.toString(),
          teacherName: 'Teacher',
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

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]);

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const diffInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
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
        
        await fetchAssignments(false);
        
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

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    const isOverdue = daysUntilDue < 0 && !assignment.submissionId;

    switch (filterStatus) {
      case 'pending':
        return !assignment.submissionId && !isOverdue;
      case 'submitted':
        return !!assignment.submissionId;
      case 'overdue':
        return isOverdue;
      default:
        return true;
    }
  });

  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => a.submissionId).length,
    pending: assignments.filter(a => !a.submissionId && getDaysUntilDue(a.dueDate) >= 0).length,
    overdue: assignments.filter(a => getDaysUntilDue(a.dueDate) < 0 && !a.submissionId).length
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Assignments</h1>
          <p className="text-gray-600 mt-1">View and manage all your assignments</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchAssignments(true)}
          disabled={refreshing}
          className="shadow-sm hover:shadow-md transition-all"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.submitted}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'submitted' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('submitted')}
              >
                Submitted
              </Button>
              <Button
                variant={filterStatus === 'overdue' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('overdue')}
              >
                Overdue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
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
                <p className="text-gray-500 text-lg mb-2">No assignments found</p>
                <p className="text-gray-400">Try adjusting your filters</p>
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
    </div>
  );
}