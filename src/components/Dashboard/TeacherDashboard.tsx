import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MessageSquare,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { mockAssignments, mockSubmissions, mockUsers } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import ActivityTimeline from '../Shared/ActivityTimeline';
import DocumentPreview from '../Shared/DocumentPreview';
import { mockActivities } from '../../data/mockData';
import { Assignment, Submission } from '../../types';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState(mockAssignments.filter(a => a.teacherId === user?.id));
  const [submissions] = useState(mockSubmissions);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Assignment | Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    class: '',
    dueDate: new Date(),
    documentFile: null as File | null
  });

  const students = mockUsers.filter(u => u.role === 'student');
  const mySubmissions = submissions.filter(s => 
    assignments.some(a => a.id === s.assignmentId)
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.description) return;
    
    const assignment = {
      id: Date.now().toString(),
      ...newAssignment,
      teacherId: user?.id || '',
      teacherName: user?.name || '',
      subject: user?.subject || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      documentUrl: newAssignment.documentFile ? `/mock-documents/${newAssignment.documentFile.name}` : undefined,
      documentName: newAssignment.documentFile?.name,
      documentType: newAssignment.documentFile?.type,
      isEdited: false
    };
    
    setAssignments([...assignments, assignment]);
    setNewAssignment({
      title: '',
      description: '',
      instructions: '',
      class: '',
      dueDate: new Date(),
      documentFile: null
    });
    setIsCreateAssignmentOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewAssignment({ ...newAssignment, documentFile: file });
    }
  };

  const filteredSubmissions = mySubmissions.filter(submission => {
    const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignments.find(a => a.id === submission.assignmentId)?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mySubmissions.length}</div>
            <p className="text-xs text-muted-foreground">Total submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mySubmissions.filter(s => s.status === 'submitted').length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.isOnline).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="assignments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assignments">My Assignments</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>

            <TabsContent value="assignments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Assignment Management</h3>
                <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Assignment</DialogTitle>
                      <DialogDescription>
                        Create a new assignment for your students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Assignment Title</Label>
                        <Input
                          id="title"
                          value={newAssignment.title}
                          onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                          placeholder="Enter assignment title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newAssignment.description}
                          onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                          placeholder="Describe the assignment"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                          id="instructions"
                          value={newAssignment.instructions}
                          onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                          placeholder="Provide detailed instructions for students"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="class">Class</Label>
                        <Select value={newAssignment.class} onValueChange={(value) => setNewAssignment({ ...newAssignment, class: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                            <SelectItem value="Grade 10B">Grade 10B</SelectItem>
                            <SelectItem value="Grade 11A">Grade 11A</SelectItem>
                            <SelectItem value="Grade 11B">Grade 11B</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="datetime-local"
                          value={newAssignment.dueDate.toISOString().slice(0, 16)}
                          onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: new Date(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="document">Assignment Document (Optional)</Label>
                        <Input
                          id="document"
                          type="file"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        {newAssignment.documentFile && (
                          <p className="text-sm text-gray-600 mt-1">
                            Selected: {newAssignment.documentFile.name}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateAssignmentOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAssignment} className="bg-red-600 hover:bg-red-700">
                          Create Assignment
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-96">
                {assignments.map((assignment) => {
                  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                  const submissionCount = mySubmissions.filter(s => s.assignmentId === assignment.id).length;
                  
                  return (
                    <Card key={assignment.id} className="mb-4">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>{assignment.description}</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{assignment.class}</Badge>
                              <Badge variant="outline">{assignment.subject}</Badge>
                              {assignment.isEdited && (
                                <Badge className="bg-orange-600">Edited</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={daysUntilDue < 0 ? "destructive" : daysUntilDue <= 2 ? "default" : "secondary"}
                              className={daysUntilDue <= 2 && daysUntilDue >= 0 ? "bg-orange-600" : ""}
                            >
                              {daysUntilDue < 0 ? "Overdue" : `${daysUntilDue} days left`}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              Due: {assignment.dueDate.toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-600">
                              Submissions: {submissionCount}
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
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Student Submissions</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
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

              <ScrollArea className="h-96">
                {filteredSubmissions.map((submission) => {
                  const assignment = assignments.find(a => a.id === submission.assignmentId);
                  
                  return (
                    <Card key={submission.id} className="mb-4">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment?.title}</CardTitle>
                            <CardDescription>
                              Submitted by {submission.studentName}
                            </CardDescription>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatTimeAgo(submission.submittedAt)}
                            </p>
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
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            {submission.grade && (
                              <span className="text-sm font-medium text-green-600">
                                Grade: {submission.grade}/100
                              </span>
                            )}
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Mock download
                                console.log('Downloading:', submission.documentName);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <h3 className="text-lg font-semibold">My Students</h3>
              <ScrollArea className="h-96">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={student.isOnline ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.class}</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${student.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-xs text-gray-500">
                            {student.isOnline ? 'Online now' : `Last seen ${formatTimeAgo(student.lastActive)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={student.isOnline ? "default" : "secondary"} className={student.isOnline ? "bg-green-600" : ""}>
                        {student.isOnline ? "Online" : "Offline"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
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

          {/* Activity Timeline */}
          <ActivityTimeline 
            activities={mockActivities.filter(a => a.userId === user?.id)} 
            title="My Activity" 
            maxHeight="h-64"
          />
        </div>
      </div>

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