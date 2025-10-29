import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Search, 
  RefreshCw, 
  Eye, 
  Download, 
  MessageSquare, 
  Clock, 
  File,
  X,
  Video,
  Image as ImageIcon,
  FileCode,
  FileText
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

export default function TeacherSubmissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teacherSubmissions, setTeacherSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const fetchTeacherSubmissions = async (showRefreshToast = false) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      setLoading(!showRefreshToast);
      setRefreshing(showRefreshToast);
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
        
        if (showRefreshToast) {
          toast({
            title: "Success", 
            description: `Loaded ${transformedSubmissions.length} submission${transformedSubmissions.length !== 1 ? 's' : ''}`
          });
        }
      } else {
        throw new Error(data.message || 'Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to fetch submissions", 
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
      fetchTeacherSubmissions();
    }
  }, [user?.id]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleDownload = async (submissionId, documentName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/submissions/download/${submissionId}`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      
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
      
      toast({
        title: "Success",
        description: "Document downloaded successfully!"
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

  const filteredSubmissions = teacherSubmissions.filter(submission => {
    const matchesSearch = submission.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         submission.assignment_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Student Submissions</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and grade student submissions ({teacherSubmissions.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchTeacherSubmissions(true)}
            disabled={refreshing}
            className="shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
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
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-white shadow">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {submission.student_name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'ST'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{submission.assignment_title}</CardTitle>
                        <CardDescription className="mt-1">
                          Submitted by <span className="font-semibold">{submission.student_name}</span>
                        </CardDescription>
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(new Date(submission.submitted_at))}
                        </p>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 mt-2">
                          {submission.student_class}
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
                        <>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(submission.id.toString(), submission.document_path.split('/').pop())} 
                            className="hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />Download
                          </Button>
                        </>
                      )}
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
      )}

      {/* Document Preview Modal */}
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
    </div>
  );
}