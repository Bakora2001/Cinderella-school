import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle, Clock, Star, MessageSquare, Search, RefreshCw, Award, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function StudentSubmissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, graded, pending

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
        const submittedAssignments = data.assignments
          .filter(a => a.submission_id)
          .map(assignment => ({
            id: assignment.id.toString(),
            title: assignment.title,
            description: assignment.description || '',
            class: assignment.class_name,
            dueDate: new Date(assignment.due_date),
            submittedAt: assignment.submitted_at ? new Date(assignment.submitted_at) : null,
            grade: assignment.grade,
            feedback: assignment.feedback,
            submissionStatus: assignment.submission_status,
            submissionId: assignment.submission_id
          }));
        
        setAssignments(submittedAssignments);
        
        if (showRefreshToast) {
          toast({
            title: "Success",
            description: `Loaded ${submittedAssignments.length} submission${submittedAssignments.length !== 1 ? 's' : ''}`,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadge = (grade) => {
    if (grade >= 90) return { label: 'Excellent', color: 'bg-green-600' };
    if (grade >= 80) return { label: 'Very Good', color: 'bg-blue-600' };
    if (grade >= 70) return { label: 'Good', color: 'bg-yellow-600' };
    if (grade >= 60) return { label: 'Pass', color: 'bg-orange-600' };
    return { label: 'Needs Improvement', color: 'bg-red-600' };
  };

  const filteredSubmissions = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filterStatus) {
      case 'graded':
        return assignment.grade !== null;
      case 'pending':
        return assignment.grade === null;
      default:
        return true;
    }
  });

  const stats = {
    total: assignments.length,
    graded: assignments.filter(a => a.grade !== null).length,
    pending: assignments.filter(a => a.grade === null).length,
    averageGrade: assignments.filter(a => a.grade !== null).length > 0 
      ? Math.round(assignments.filter(a => a.grade !== null).reduce((sum, a) => sum + a.grade, 0) / assignments.filter(a => a.grade !== null).length)
      : 0
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Submissions</h1>
          <p className="text-gray-600 mt-1">Track your submitted work and grades</p>
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
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <Star className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.graded}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getGradeColor(stats.averageGrade)}`}>
              {stats.averageGrade}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      {stats.graded > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.grade >= 90).length}
                </div>
                <p className="text-sm text-green-600 font-medium">Excellent (90+)</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">
                  {assignments.filter(a => a.grade >= 80 && a.grade < 90).length}
                </div>
                <p className="text-sm text-blue-600 font-medium">Very Good (80-89)</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-yellow-600">
                  {assignments.filter(a => a.grade >= 70 && a.grade < 80).length}
                </div>
                <p className="text-sm text-yellow-600 font-medium">Good (70-79)</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-600">
                  {assignments.filter(a => a.grade < 70 && a.grade !== null).length}
                </div>
                <p className="text-sm text-orange-600 font-medium">Needs Work (&lt;70)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
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
                variant={filterStatus === 'graded' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('graded')}
              >
                Graded
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          {filteredSubmissions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No submissions found</p>
                <p className="text-gray-400">Your submitted work will appear here</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((assignment) => (
              <Card key={assignment.id} className="mb-4 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        Submitted {assignment.submittedAt ? formatTimeAgo(assignment.submittedAt) : 'recently'}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                          {assignment.class}
                        </Badge>
                        <Badge 
                          variant={
                            assignment.submissionStatus === 'submitted' ? 'default' :
                            assignment.submissionStatus === 'graded' ? 'secondary' : 'outline'
                          }
                          className={`${
                            assignment.submissionStatus === 'submitted' ? 'bg-orange-600' :
                            assignment.submissionStatus === 'graded' ? 'bg-green-600' : ''
                          }`}
                        >
                          {assignment.submissionStatus ? assignment.submissionStatus.charAt(0).toUpperCase() + assignment.submissionStatus.slice(1) : 'Submitted'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {assignment.grade !== null && (
                        <div>
                          <div className={`text-3xl font-bold ${getGradeColor(assignment.grade)}`}>
                            {assignment.grade}%
                          </div>
                          <Badge className={`${getGradeBadge(assignment.grade).color} mt-1`}>
                            {getGradeBadge(assignment.grade).label}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignment.feedback && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800 mb-1">Teacher Feedback:</p>
                            <p className="text-sm text-blue-700">{assignment.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!assignment.grade && (
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <p className="text-sm text-orange-700">
                            Waiting for teacher review and grading
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-sm text-gray-600">
                        Due was: {assignment.dueDate.toLocaleDateString()}
                      </span>
                      {assignment.submittedAt && (
                        <span className="text-sm text-gray-600">
                          Submitted: {assignment.submittedAt.toLocaleDateString()} at {assignment.submittedAt.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </ScrollArea>
      )}
    </div>
  );
}