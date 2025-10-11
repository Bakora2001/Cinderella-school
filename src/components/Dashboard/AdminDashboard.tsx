import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Users,
  GraduationCap,
  FileText,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';
import { mockUsers, mockAssignments, mockSubmissions, mockStats } from '../../data/mockData';
import ActivityTimeline from '../Shared/ActivityTimeline';
import { mockActivities } from '../../data/mockData';

export default function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as 'admin' | 'teacher' | 'student',
    class: '',
    subject: ''
  });

  const stats = mockStats;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) return;
    
    const user = {
      id: Date.now().toString(),
      ...newUser,
      isOnline: false,
      lastActive: new Date()
    };
    
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'student', class: '', subject: '' });
    setIsCreateUserOpen(false);
  };

  const onlineUsers = users.filter(u => u.isOnline);
  const offlineUsers = users.filter(u => !u.isOnline);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Educators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onlineUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage students and teachers</CardDescription>
                </div>
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>
                        Add a new student or teacher to the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={newUser.role} onValueChange={(value: 'admin' | 'teacher' | 'student') => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newUser.role === 'student' && (
                        <div>
                          <Label htmlFor="class">Class</Label>
                          <Input
                            id="class"
                            value={newUser.class}
                            onChange={(e) => setNewUser({ ...newUser, class: e.target.value })}
                            placeholder="e.g., Grade 10A"
                          />
                        </div>
                      )}
                      {newUser.role === 'teacher' && (
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={newUser.subject}
                            onChange={(e) => setNewUser({ ...newUser, subject: e.target.value })}
                            placeholder="e.g., Mathematics"
                          />
                        </div>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateUser} className="bg-red-600 hover:bg-red-700">
                          Create User
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="online">Online ({onlineUsers.length})</TabsTrigger>
                  <TabsTrigger value="offline">Offline ({offlineUsers.length})</TabsTrigger>
                  <TabsTrigger value="teachers">Teachers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <ScrollArea className="h-96">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-red-600 text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            {user.class && <p className="text-xs text-red-600">{user.class}</p>}
                            {user.subject && <p className="text-xs text-red-600">{user.subject}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.isOnline ? "default" : "secondary"} className={user.isOnline ? "bg-green-600" : ""}>
                            {user.isOnline ? "Online" : "Offline"}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                          <p className="text-xs text-gray-500">{formatLastActive(user.lastActive)}</p>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="online">
                  <ScrollArea className="h-96">
                    {onlineUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg mb-2 bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-red-600 text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Currently online</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="offline">
                  <ScrollArea className="h-96">
                    {offlineUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gray-600 text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-500">Last active: {formatLastActive(user.lastActive)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="teachers">
                  <ScrollArea className="h-96">
                    {users.filter(u => u.role === 'teacher').map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-600 text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            <p className="text-xs text-blue-600">{user.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.isOnline ? "default" : "secondary"} className={user.isOnline ? "bg-green-600" : ""}>
                            {user.isOnline ? "Online" : "Offline"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <div>
          <ActivityTimeline activities={mockActivities} title="System Activity" />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Assignment Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Assignments</span>
                <span className="font-bold">{mockAssignments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Submissions</span>
                <span className="font-bold">{mockSubmissions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Reviews</span>
                <span className="font-bold text-orange-600">
                  {mockSubmissions.filter(s => s.status === 'submitted').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed Reviews</span>
                <span className="font-bold text-green-600">
                  {mockSubmissions.filter(s => s.status === 'reviewed').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Assignments Posted Today</span>
                <span className="font-bold text-blue-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Submissions Today</span>
                <span className="font-bold text-green-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Reviews Posted Today</span>
                <span className="font-bold text-purple-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users Today</span>
                <span className="font-bold text-red-600">{onlineUsers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}