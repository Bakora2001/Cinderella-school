import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  FileText, 
  Upload, 
  MessageSquare, 
  Edit,
  User,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { Activity } from '../../types';

interface ActivityTimelineProps {
  activities: Activity[];
  title?: string;
  maxHeight?: string;
}

export default function ActivityTimeline({ 
  activities, 
  title = "Recent Activity",
  maxHeight = "h-96"
}: ActivityTimelineProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'assignment_posted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'submission_uploaded':
        return <Upload className="h-4 w-4 text-green-500" />;
      case 'review_posted':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'document_edited':
        return <Edit className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleIcon = (role: Activity['userRole']) => {
    switch (role) {
      case 'admin':
        return <User className="h-3 w-3 text-red-500" />;
      case 'teacher':
        return <GraduationCap className="h-3 w-3 text-blue-500" />;
      case 'student':
        return <BookOpen className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'assignment_posted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'submission_uploaded':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'review_posted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'document_edited':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={maxHeight}>
          {sortedActivities.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {sortedActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-white dark:border-gray-900">
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < sortedActivities.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mt-2" />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {getRoleIcon(activity.userRole)}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {activity.userName}
                            </span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getActivityColor(activity.type)}`}
                          >
                            {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap ml-2">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}