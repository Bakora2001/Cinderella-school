// Cinderella-school\src\pages\Student\StudentMessages.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StudentMessagingCenter from '../../components/Dashboard/StudentMessagingCenter';
import { MessageSquare, Users, Clock, CheckCircle, Zap } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentMessages() {
  const { user } = useAuth();
  const { isConnected, onlineUsers, conversations } = useWebSocket();
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    onlineTeachers: 0,
  });

  useEffect(() => {
    // Calculate stats from WebSocket data
    const totalConversations = conversations.length;
    const unreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const onlineTeachers = onlineUsers.filter(u => 
      u.role === 'teacher' || u.role === 'admin'
    ).length;

    setStats({
      totalConversations,
      unreadMessages,
      onlineTeachers,
    });
  }, [conversations, onlineUsers]);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" style={{ zoom: '0.9' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600">Chat with your teachers and administrators</p>
          </div>
        </div>

        {/* Connection Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-600" : ""}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">Active chats</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">New messages</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onlineTeachers}</div>
            <p className="text-xs text-muted-foreground">Teachers available</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Fast</div>
            <p className="text-xs text-muted-foreground">Real-time messaging</p>
          </CardContent>
        </Card>
      </div>

      {/* Messaging Center */}
      <Card className="shadow-xl border-blue-200">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Chat with Teachers & Admins
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Start a conversation or continue an existing chat
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[700px]">
            <StudentMessagingCenter />
          </div>
        </CardContent>
      </Card>

      
      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
            💬 Messaging Center Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Quick Access</p>
                  <p className="text-xs text-gray-500">Message teachers about assignments and coursework instantly</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Real-Time Chat</p>
                  <p className="text-xs text-gray-500">See when teachers are online and get instant responses</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Message History</p>
                  <p className="text-xs text-gray-500">All your conversations are saved and accessible anytime</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Status Updates</p>
                  <p className="text-xs text-gray-500">See delivery and read receipts for all your messages</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>ear

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you're experiencing issues with messaging or need assistance, please contact your teacher or school administrator through this messaging system.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">
                  ✓ Messages are delivered instantly
                </Badge>
                <Badge variant="outline" className="bg-white">
                  ✓ See when teachers read your messages
                </Badge>
                <Badge variant="outline" className="bg-white">
                  ✓ Get notified of new replies
                </Badge>
                <Badge variant="outline" className="bg-white">
                  ✓ Chat history is always saved
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}