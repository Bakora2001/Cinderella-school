import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, FileText, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockActivities } from '../../data/mockData';

export default function TeacherActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);

  const getCurrentUserId = () => {
    return user?.id || localStorage.getItem('userId');
  };

  useEffect(() => {
    // Filter activities for current teacher
    const currentUserId = getCurrentUserId();
    const teacherActivities = mockActivities.filter(a => a.userId === currentUserId);
    setActivities(teacherActivities);
  }, [user?.id]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'submission':
        return <Upload className="h-5 w-5 text-green-600" />;
      case 'review':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Log</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View recent activities and updates</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>Track all your recent activities and student interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No recent activity</p>
                <p className="text-gray-400">Your activities will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}