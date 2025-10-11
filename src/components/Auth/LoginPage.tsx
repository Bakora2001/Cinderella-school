import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, Users, Shield, Eye, Target, Heart, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(email, password, selectedRole);
    if (!success) {
      setError('Invalid credentials. Please check your email, password, and selected role.');
    }
  };

  const getDemoCredentials = (role: string) => {
    switch (role) {
      case 'admin':
        return { email: 'admin@cinderella.edu', password: 'admin123' };
      case 'teacher':
        return { email: 'john.teacher@cinderella.edu', password: 'teacher123' };
      case 'student':
        return { email: 'alice.student@cinderella.edu', password: 'student123' };
      default:
        return { email: '', password: '' };
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'teacher' | 'student') => {
    const credentials = getDemoCredentials(role);
    setEmail(credentials.email);
    setPassword(credentials.password);
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Mobile Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - School Information */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-red-600 to-red-800 dark:from-red-700 dark:to-red-900">
          <div className="max-w-lg text-white space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* School Header */}
            <div className="space-y-2 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-3">
                <GraduationCap className="h-8 w-8 sm:h-10 w-10 lg:h-12 lg:w-12 text-white" />
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Cinderella School</h1>
                  <p className="text-sm sm:text-lg lg:text-xl text-gray-200">Assignment Management System</p>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-red-300 mt-1 flex-shrink-0 mx-auto sm:mx-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Our Mission</h3>
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                    To provide exceptional education through innovative technology and personalized learning experiences. 
                    We empower students, teachers, and administrators with cutting-edge tools that foster academic excellence.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-red-300 mt-1 flex-shrink-0 mx-auto sm:mx-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Our Vision</h3>
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                    To be a leading international school that transforms education through technology, 
                    creating a global community of lifelong learners who are confident and creative.
                  </p>
                </div>
              </div>
            </div>

            {/* Values - Hidden on small screens */}
            <div className="hidden sm:block space-y-3 lg:space-y-4">
              <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-300 mt-1 flex-shrink-0 mx-auto sm:mx-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Our Values</h3>
                  <ul className="text-sm sm:text-base text-gray-200 space-y-1">
                    <li>• Excellence in Education</li>
                    <li>• Innovation & Technology</li>
                    <li>• Integrity & Respect</li>
                    <li>• Global Citizenship</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Features Highlight - Hidden on mobile */}
            <div className="hidden lg:block border-t border-red-400/30 pt-6">
              <h4 className="text-lg font-semibold mb-3">Platform Features</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-red-100">
                <div>✓ Assignment Management</div>
                <div>✓ Real-time Notifications</div>
                <div>✓ Document Upload/Download</div>
                <div>✓ Progress Tracking</div>
                <div>✓ Grade Management</div>
                <div>✓ Activity Timeline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl sm:text-2xl text-center text-gray-900 dark:text-white">Welcome Back</CardTitle>
                <CardDescription className="text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Sign in to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Select Your Role</Label>
                  <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'admin' | 'teacher' | 'student')} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 h-10 sm:h-11">
                      <TabsTrigger 
                        value="student" 
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm px-1 sm:px-3"
                      >
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Student</span>
                        <span className="sm:hidden">S</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="teacher" 
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm px-1 sm:px-3"
                      >
                        <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Teacher</span>
                        <span className="sm:hidden">T</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="admin" 
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm px-1 sm:px-3"
                      >
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Admin</span>
                        <span className="sm:hidden">A</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 text-sm font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 h-10 sm:h-11"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 h-10 sm:h-11"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <AlertDescription className="text-red-800 dark:text-red-200 text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium h-10 sm:h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-3">Quick Demo Access:</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials('student')}
                      className="w-full text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 h-8 sm:h-9"
                    >
                      <Users className="h-3 w-3 mr-2" />
                      Try Student Demo
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials('teacher')}
                        className="text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 h-8 sm:h-9"
                      >
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Teacher
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials('admin')}
                        className="text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 h-8 sm:h-9"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact your administrator for login credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}