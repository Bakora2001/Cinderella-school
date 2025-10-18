import React, { useState, useEffect } from 'react';
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
  Eye,
  BarChart3,
  Clock,
  Download,
  FileSpreadsheet,
  Trash2,
  LogOut
} from 'lucide-react';
import { mockAssignments, mockSubmissions } from '../../data/mockData';
import ActivityTimeline from '../Shared/ActivityTimeline';
import { mockActivities } from '../../data/mockData';
import { useToast } from '@/hooks/use-toast';
import SubmissionReport from './SubmissionReport';

interface User {
  id: string;
  username: string;
  // firstname?: string;
  // name?: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  class_name?: string;
  class?: string;
  subject?: string;
  created_at?: string;
  isOnline?: boolean;
  lastActive?: Date;
  loginTime?: string;
}

interface ActiveUser {
  id: string;
  email: string;
  username: string;
  role: string;
  loginTime: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmissionReportOpen, setIsSubmissionReportOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student' as 'admin' | 'teacher' | 'student',
    class_name: '',
    subject: ''
  });

  // Fetch users from auth endpoint (users table with username, email, role, class_name)
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users.map((user: any) => ({
          ...user,
          id: user.id?.toString() || '',
          isOnline: false,
          lastActive: new Date(user.created_at || Date.now())
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


  // Fetch users using getallusers endpoint (different table structure with firstname, sirname)
  const fetchAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/getallusers');
      const data = await response.json();
      
      if (data.success) {
        const formattedUsers = data.users.map((user: any) => ({
          ...user,
          id: user.id?.toString() || '',
          username: `${user.username || ''}`.trim() || user.email.split('@')[0],
          class_name: user.class,
          isOnline: false,
          lastActive: new Date()
        }));
        
        // Merge with existing users from auth endpoint
        setUsers(prevUsers => {
          const authUsers = prevUsers.filter(u => u.username);
          const allUsers = [...authUsers, ...formattedUsers];
          
          // Remove duplicates based on email
          const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.email === user.email)
          );
          
          return uniqueUsers;
        });
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users from secondary endpoint",
        variant: "destructive"
      });
    }
  };

  // Fetch active users from backend
  const fetchActiveUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/active-users');
      const data = await response.json();
      
      if (data.success) {
        setActiveUsers(data.users);
        
        // Update users list to mark active users as online
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            isOnline: data.users.some((activeUser: ActiveUser) => activeUser.id === user.id)
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchAllUsers();
    fetchActiveUsers();
    
    // Poll active users every 30 seconds
    const interval = setInterval(fetchActiveUsers, 3000000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats dynamically
  const stats = {
    totalStudents: users.filter(u => u.role === 'student').length,
    totalTeachers: users.filter(u => u.role === 'teacher').length,
    totalAssignments: mockAssignments.length,
    onlineUsers: activeUsers.length
  };

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

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/newacc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          class_name: newUser.role === 'student' ? newUser.class_name : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });

        // Refresh users list
        fetchUsers();
        fetchAllUsers();
        setNewUser({ username: '', email: '', password: '', role: 'student', class_name: '', subject: '' });
        setIsCreateUserOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/edituserdata/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // firstname: editingUser.firstname || editingUser.username.split(' ')[0] || editingUser.username,
          username: editingUser.username || editingUser.username.split(' ')[1] || '',
          email: editingUser.email,
          role: editingUser.role,
          class_name: editingUser.class_name || editingUser.class || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });

        // Refresh users list
        fetchUsers();
        fetchAllUsers();
        setEditingUser(null);
        setIsEditDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/deleteuser/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'admin' // Assuming current user is admin
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });

        // Refresh users list
        fetchUsers();
        fetchAllUsers();
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogoutUser = async (userId: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "User logged out successfully",
        });

        // Refresh active users
        fetchActiveUsers();
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error logging out user:', error);
      toast({
        title: "Error",
        description: "Failed to logout user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const onlineUsers = users.filter(u => u.isOnline);
  const offlineUsers = users.filter(u => !u.isOnline);

  return (
    <div className="space-y-6">
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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage students and teachers</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                  onClick={() => setIsSubmissionReportOpen(true)}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  View Reports
                </Button>

                <SubmissionReport 
                  isOpen={isSubmissionReportOpen} 
                  onOpenChange={setIsSubmissionReportOpen} 
                />

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
                          <Label htmlFor="username">Username *</Label>
                          <Input
                            id="username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Enter password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role *</Label>
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
                            <Label htmlFor="class_name">Class</Label>
                            <Input
                              id="class_name"
                              value={newUser.class_name}
                              onChange={(e) => setNewUser({ ...newUser, class_name: e.target.value })}
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
                          <Button 
                            onClick={handleCreateUser} 
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Creating...' : 'Create User'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            {user.class_name && <p className="text-xs text-red-600">{user.class_name}</p>}
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
                          <p className="text-xs text-gray-500">{formatLastActive(user.lastActive || new Date())}</p>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.isOnline && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleLogoutUser(user.id)}
                              title="Logout User"
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Currently online</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLogoutUser(user.id)}
                            title="Logout User"
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </div>
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
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-500">Last active: {formatLastActive(user.lastActive || new Date())}</p>
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
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
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

        <div>
          <ActivityTimeline activities={mockActivities} title="System Activity" />
        </div>
      </div>

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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value: 'admin' | 'teacher' | 'student') => 
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
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
              {editingUser.role === 'student' && (
                <div>
                  <Label htmlFor="edit-class">Class</Label>
                  <Input
                    id="edit-class"
                    value={editingUser.class_name || editingUser.class || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, class_name: e.target.value })}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditUser} 
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}