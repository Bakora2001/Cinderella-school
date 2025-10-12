import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, Users, Shield, Eye, Target, Heart, Lightbulb, HandHeart, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const [showMission, setShowMission] = useState(true);
  const { login, isLoading } = useAuth();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowMission(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const coreValues = [
    {
      icon: <Heart className="h-5 w-5 text-red-500" />,
      title: "Honesty",
      content: "Building a culture of honesty and responsibility"
    },
    {
      icon: <Award className="h-5 w-5 text-red-500" />,
      title: "Excellence",
      content: "Striving for a holistic excellence"
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-red-500" />,
      title: "Innovation",
      content: "Integrating teaching and learning with technology"
    },
    {
      icon: <HandHeart className="h-5 w-5 text-red-500" />,
      title: "Collaboration",
      content: "Supporting each other and encouraging collective responsibility"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-900/20 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-800/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-950/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.85); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.3); }
          50% { box-shadow: 0 0 40px rgba(220, 38, 38, 0.6); }
        }
        @keyframes scroll-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.9s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.9s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll-horizontal 20s linear infinite;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row min-h-screen relative z-10">
        {/* Left Side - School Information with Black Background */}
        <div className="hidden lg:flex flex-[1.2] items-center justify-center p-8 bg-black border-r border-red-900/30 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 border-2 border-red-600/20 rounded-full opacity-30 animate-float"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 border-2 border-red-500/20 rounded-full opacity-30 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 border-2 border-red-700/20 rounded-full opacity-20 animate-float animation-delay-4000"></div>
          
          <div className="max-w-2xl w-full space-y-6">
            {/* School Header - Logo and Name on One Line */}
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-2xl animate-pulse-glow flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-300">
                    Cinderella International School
                  </h1>
                  <p className="text-sm text-gray-300 font-medium mt-1">Assignment Management System</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 leading-relaxed border-l-4 border-red-600 pl-4 py-2 bg-gray-900/30 rounded-r-lg">
                A modern educational institution dedicated to academic excellence and character building through innovative learning experiences.
              </p>
            </div>

            {/* Mission and Vision - Sliding Glass Card */}
            <div className="relative h-48 animate-fade-in-up overflow-hidden">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
                <div className={`absolute inset-0 p-6 transition-all duration-700 ${showMission ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-red-900/40 rounded-full">
                      <Eye className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-100 mb-3 text-center">Our Mission</h3>
                  <p className="text-gray-300 text-center leading-relaxed text-sm">
                    Provide learner friendly experiences that excites students to succeed academically and socially
                  </p>
                </div>
                <div className={`absolute inset-0 p-6 transition-all duration-700 ${!showMission ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-red-900/40 rounded-full">
                      <Target className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-100 mb-3 text-center">Our Vision</h3>
                  <p className="text-gray-300 text-center leading-relaxed text-sm">
                    To nurture tomorrow's leaders through quality education and global sensitization
                  </p>
                </div>
              </div>
            </div>

            {/* Core Values - Animated Horizontal Scroll */}
            <div className="bg-gray-900/30 rounded-xl p-5 shadow-xl border border-red-900/40 animate-fade-in-up overflow-hidden">
              <h3 className="text-xl font-bold text-center mb-5 text-gray-300 tracking-wider">
                CORE VALUES
              </h3>
              
              {/* Animated scrolling container */}
              <div className="relative overflow-hidden">
                <div className="flex animate-scroll space-x-4 hover:pause">
                  {/* Duplicate the array for seamless loop */}
                  {[...coreValues, ...coreValues].map((value, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-64 bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 border border-red-700/30 hover:border-red-500/50 hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-red-900/50"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-red-900/40 rounded-lg">
                          {value.icon}
                        </div>
                        <h4 className="text-base font-bold text-gray-100">{value.title}</h4>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{value.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form with More Space */}
        <div className="flex-[1] flex items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-gray-900/40 to-gray-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-4 animate-slide-in-right">
            <Card className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-red-900/40 shadow-2xl hover:shadow-red-900/30 transition-all duration-500 animate-pulse-glow">
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-2xl text-center text-gray-100 font-bold">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-gray-400 text-sm">
                  Sign in to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-gray-100 text-sm font-semibold">Select Your Role</Label>
                  <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'admin' | 'teacher' | 'student')} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-950/80 h-11 border border-red-900/30">
                      <TabsTrigger 
                        value="student" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Student
                      </TabsTrigger>
                      <TabsTrigger 
                        value="teacher" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Teacher
                      </TabsTrigger>
                      <TabsTrigger 
                        value="admin" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-100 text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-950/60 border-red-900/40 text-gray-100 placeholder-gray-500 h-11 transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-100 text-sm font-semibold">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-950/60 border-red-900/40 text-gray-100 placeholder-gray-500 h-11 transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <Alert className="bg-red-950/50 border-red-700/50 animate-fade-in-up">
                      <AlertDescription className="text-red-300 text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-semibold h-11 shadow-xl hover:shadow-red-900/50 transition-all duration-300 transform hover:scale-[1.02] animate-pulse-glow"
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
                <div className="pt-4 border-t border-red-900/30">
                  <p className="text-sm text-gray-100 text-center mb-3 font-semibold">Quick Demo Access:</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials('student')}
                      className="w-full bg-gray-950/60 border-red-800/50 text-gray-300 hover:bg-red-900/30 hover:border-red-600 hover:text-white h-9 transition-all duration-300"
                    >
                      <Users className="h-3.5 w-3.5 mr-2" />
                      Try Student Demo
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials('teacher')}
                        className="bg-gray-950/60 border-red-800/50 text-gray-300 hover:bg-red-900/30 hover:border-red-600 hover:text-white h-9 transition-all duration-300"
                      >
                        <GraduationCap className="h-3.5 w-3.5 mr-1" />
                        Teacher
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials('admin')}
                        className="bg-gray-950/60 border-red-800/50 text-gray-300 hover:bg-red-900/30 hover:border-red-600 hover:text-white h-9 transition-all duration-300"
                      >
                        <Shield className="h-3.5 w-3.5 mr-1" />
                        Admin
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-gray-500 animate-fade-in-up">
              Need help? Contact your administrator for login credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}