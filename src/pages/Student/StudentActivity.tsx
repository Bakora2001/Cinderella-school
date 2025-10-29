import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Activity, Upload, CheckCircle, FileText, Calendar, Clock, TrendingUp, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function StudentActivity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
          title: assignment.title,
          createdAt: new Date(assignment.created_at),
          submittedAt: assignment.submitted_at ? new Date(assignment.submitted_at) : null,
          submissionId: assignment.submission_id,
          grade: assignment.grade,
          class: assignment.class_name
        }));
        
        setAssignments(transformedAssignments);
        
        if (showRefreshToast) {
          toast({
            title: "Success",
            description: "Activity refreshed successfully",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activity",
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
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return `${Math.floor(diffInMinutes / 10080)}w ago`;
  };

  // Create activity timeline
  const activities = [];

  // Add assignment received activities
  assignments.forEach(assignment => {
    activities.push({
      id: `received-${assignment.id}`,
      type: 'received',
      title: assignment.title,
      class: assignment.class,
      timestamp: assignment.createdAt,
      icon: FileText,
      color: 'blue'
    });
  });

  // Add submission activities
  assignments.filter(a => a.submittedAt).forEach(assignment => {
    activities.push({
      id: `submitted-${assignment.id}`,
      type: 'submitted',
      title: assignment.title,
      class: assignment.class,
      timestamp: assignment.submittedAt,
      icon: Upload,
      color: 'green'
    });
  });

  // Add grading activities
  assignments.filter(a => a.grade !== null).forEach(assignment => {
    activities.push({
      id: `graded-${assignment.id}`,
      type: 'graded',
      title: assignment.title,
      class: assignment.class,
      grade: assignment.grade,
      timestamp: assignment.submittedAt, // Using submitted date as we don't have graded date
      icon: CheckCircle,
      color: 'purple'
    });
  });

  // Sort by timestamp (most recent first)
  const sortedActivities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const stats = {
    totalActivities: activities.length,
    assignmentsReceived: assignments.length,
    submitted: assignments.filter(a => a.submissionId).length,
    graded: assignments.filter(a => a.grade !== null).length
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'received':
        return `New assignment received: ${activity.title}`;
      case 'submitted':
        return `Submitted assignment: ${activity.title}`;
      case 'graded':
        return `Assignment graded: ${activity.title} (${activity.grade}%)`;
      default:
        return activity.title;
    }
  };

  const getActivityIcon = (activity) => {
    const Icon = activity.icon;
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100'
    };
    
    return (
      <div className={`p-2 rounded-full ${colorMap[activity.color]}`}>
        <Icon className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Activity Timeline</h1>
          <p className="text-gray-600 mt-1">Track your academic activities</p>
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
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalActivities}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.assignmentsReceived}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <Upload className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.submitted}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.graded}</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No activity yet</p>
              <p className="text-gray-400">Your activities will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {sortedActivities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      {getActivityIcon(activity)}
                      {index < sortedActivities.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    
                    {/* Activity content */}
                    <Card className="flex-1 hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-gray-800">
                              {getActivityText(activity)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {activity.class}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(activity.timestamp)}
                            <span className="text-gray-400">•</span>
                            {activity.timestamp.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <Badge className={`text-xs ${
                            activity.type === 'received' ? 'bg-blue-600' :
                            activity.type === 'submitted' ? 'bg-green-600' :
                            activity.type === 'graded' ? 'bg-purple-600' : 'bg-gray-600'
                          }`}>
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}