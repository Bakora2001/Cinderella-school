import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageSquare, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function TeacherStudents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/getallusers');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users.map((user) => ({
          ...user,
          username: `${user.firstname || ''} ${user.sirname || ''}`.trim() || user.email.split('@')[0],
          class_name: user.class,
          isOnline: false,
          lastActive: new Date()
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/active-users');
      const data = await response.json();
      
      if (data.success) {
        setActiveUsers(data.users);
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            isOnline: data.users.some((activeUser) => activeUser.id === user.id)
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    await fetchActiveUsers();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Student list refreshed"
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchActiveUsers();
    
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const students = users.filter(u => u.role === 'student');
  const onlineStudents = students.filter(s => s.isOnline);
  
  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatLastActive = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Students</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total: {students.length} students | Online: {onlineStudents.length}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="shadow-sm hover:shadow-md transition-all"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{students.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{onlineStudents.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {[...new Set(students.map(s => s.class_name).filter(Boolean))].length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>View and manage all your students</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-400px)]">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No students found</p>
                <p className="text-gray-400">Students will appear here once they join your classes</p>
              </div>
            ) : (
              students.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-4 border rounded-lg mb-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow">
                        <AvatarFallback 
                          className={`text-base ${student.isOnline ? "bg-green-600 text-white" : "bg-gray-600 text-white"}`}
                        >
                          {getInitials(student.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${student.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                      ></div>
                    </div>
                    <div>
                      <p className="font-semibold text-base">{student.username}</p>
                      <p className="text-sm text-gray-600">{student.class_name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">
                          {student.isOnline ? '🟢 Online now' : `⚫ Last seen ${formatLastActive(student.lastActive || new Date())}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={student.isOnline ? "default" : "secondary"} 
                      className={`${student.isOnline ? "bg-green-600" : ""} px-3 py-1`}
                    >
                      {student.isOnline ? "Online" : "Offline"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}