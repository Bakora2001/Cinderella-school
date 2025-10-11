import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Search
} from 'lucide-react';
import { mockAssignments, mockSubmissions } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import ActivityTimeline from '../Shared/ActivityTimeline';
import DocumentPreview from '../Shared/DocumentPreview';
import NotificationPanel from '../Shared/NotificationPanel';
import { mockActivities, mockNotifications } from '../../data/mockData';
import { Assignment, Submission } from '../../types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [previewDocument, setPreviewDocument] = useState<Assignment | Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Filter assignments for student's class
  const myAssignments = mockAssignments.filter(a => a.class === user?.class);
  const mySubmissions = mockSubmissions.filter(s => s.studentId === user?.id);
  const myNotifications = mockNotifications.filter(n => n.userId === user?.id);

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSubmissionStatus = (assignmentId: string) => {
    return mySubmissions.find(s => s.assignmentId === assignmentId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleSubmitAssignment = () => {
    if (!uploadFile || !selectedAssignment) return;
    
    // Mock submission creation
    console.log('Submitting assignment:', selectedAssignment.title, 'with file:', uploadFile.name);
    
    setUploadFile(null);
    setSelectedAssignment(null);
    setIsUploadOpen(false);
  };

  const filteredAssignments = myAssignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overdueAssignments = myAssignments.filter(a => getDaysUntilDue(a.dueDate) < 0 && !getSubmissionStatus(a.id));
  const upcomingAssignments = myAssignments.filter(a => getDaysUntilDue(a.dueDate) <= 3 && getDaysUntilDue(a.dueDate) >= 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Available assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mySubmissions.length}</div>
            <p className="text-xs text-muted-foreground">Completed submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {myAssignments.length - mySubmissions.length}
            </div>
            <p className="text-xs text-muted-foreground">Need to submit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overdueAssignments.length > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            You have {overdueAssignments.length} overdue assignment{overdueAssignments.length > 1 ? 's' : ''}. 
            Please submit them as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      {upcomingAssignments.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            You have {upcomingAssignments.length} assignment{upcomingAssignments.length > 1 ? 's' : ''} due within 3 days.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="assignments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="submissions">My Submissions</TabsTrigger>
              <TabsTrigger value="help">Help & Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="assignments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Available Assignments</h3>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>

              <ScrollArea className="h-96">
                {filteredAssignments.map((assignment) => {
                  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                  const submission = getSubmissionStatus(assignment.id);
                  const isOverdue = daysUntilDue < 0 && !submission;
                  
                  return (
                    <Card key={assignment.id} className={`mb-4 ${isOverdue ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : ''}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>{assignment.description}</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{assignment.subject}</Badge>
                              <Badge variant="outline">{assignment.teacherName}</Badge>
                              {assignment.isEdited && (
                                <Badge className="bg-orange-600">Updated</Badge>
                              )}
                            </div>
                            {assignment.editComment && (
                              <p className="text-sm text-orange-600 mt-2 italic">
                                📝 {assignment.editComment}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {submission ? (
                              <Badge className="bg-green-600">
                                Submitted
                              </Badge>
                            ) : (
                              <Badge 
                                variant={isOverdue ? "destructive" : daysUntilDue <= 2 ? "default" : "secondary"}
                                className={daysUntilDue <= 2 && daysUntilDue >= 0 ? "bg-orange-600" : ""}
                              >
                                {isOverdue ? "Overdue" : `${daysUntilDue} days left`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Instructions:</strong> {assignment.instructions}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                Due: {assignment.dueDate.toLocaleDateString()} at {assignment.dueDate.toLocaleTimeString()}
                              </span>
                              <span className="text-sm text-gray-600">
                                Posted: {formatTimeAgo(assignment.createdAt)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {assignment.documentUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPreviewDocument(assignment)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              )}
                              {assignment.documentUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Downloading:', assignment.documentName);
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              )}
                              {!submission && (
                                <Button
                                  className="bg-red-600 hover:bg-red-700"
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
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-4">
              <h3 className="text-lg font-semibold">My Submissions</h3>
              <ScrollArea className="h-96">
                {mySubmissions.map((submission) => {
                  const assignment = myAssignments.find(a => a.id === submission.assignmentId);
                  
                  return (
                    <Card key={submission.id} className="mb-4">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment?.title}</CardTitle>
                            <CardDescription>
                              Submitted {formatTimeAgo(submission.submittedAt)}
                            </CardDescription>
                            {submission.grade && (
                              <div className="mt-2">
                                <Badge className="bg-green-600">
                                  Grade: {submission.grade}/100
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={
                              submission.status === 'submitted' ? 'default' :
                              submission.status === 'reviewed' ? 'secondary' : 'outline'
                            }
                            className={
                              submission.status === 'submitted' ? 'bg-orange-600' :
                              submission.status === 'reviewed' ? 'bg-green-600' : ''
                            }
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {submission.feedback && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Teacher Feedback:</p>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{submission.feedback}</p>
                            </div>
                          )}
                          
                          {submission.teacherComments.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Comments:</p>
                              {submission.teacherComments.map((comment) => (
                                <div key={comment.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <p className="text-sm">{comment.content}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {comment.userName} • {formatTimeAgo(comment.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              {submission.documentName && (
                                <span className="text-sm text-gray-600">
                                  File: {submission.documentName}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {submission.documentUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPreviewDocument(submission)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    How to Use the Assignment System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">📥 Viewing Assignments</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li>• Check the "Assignments" tab to see all available assignments</li>
                      <li>• Click "View" to preview assignment documents</li>
                      <li>• Click "Download" to save assignment files to your device</li>
                      <li>• Pay attention to due dates and priority badges</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">📤 Submitting Work</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li>• Click "Submit" button on any assignment</li>
                      <li>• Upload your completed work (PDF, DOC, DOCX, images)</li>
                      <li>• Make sure your file is properly named</li>
                      <li>• Submit before the due date to avoid penalties</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">📊 Tracking Progress</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li>• Check "My Submissions" to see all your submitted work</li>
                      <li>• View grades and feedback from teachers</li>
                      <li>• Read teacher comments for improvement suggestions</li>
                      <li>• Monitor your submission status</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">🔔 Notifications</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li>• Check the bell icon for new assignments</li>
                      <li>• Get notified when teachers post feedback</li>
                      <li>• Receive deadline reminders</li>
                      <li>• Stay updated on assignment changes</li>
                    </ul>
                  </div>

                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Need Help?</strong> Contact your teacher or administrator if you have technical issues or questions about assignments.
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Upload your completed work for: {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Due:</strong> {selectedAssignment?.dueDate.toLocaleDateString()} at {selectedAssignment?.dueDate.toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Instructions:</strong> {selectedAssignment?.instructions}
              </p>
            </div>
            <div>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              {uploadFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Selected: {uploadFile.name}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitAssignment} 
                className="bg-red-600 hover:bg-red-700"
                disabled={!uploadFile}
              >
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
          console.log('Downloading:', previewDocument?.documentName);
          setPreviewDocument(null);
        }}
      />
    </div>
  );
}