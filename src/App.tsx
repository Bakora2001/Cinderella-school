// Cinderella-school\src\App.tsx
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import LoginPage from './components/Auth/LoginPage';
import MainLayout from './components/Layout/MainLayout';

// Import Dashboard Components
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

// Import Message Pages
import TeacherMessages from './pages/Teacher/TeacherMessages';
import StudentMessages from './pages/Student/StudentMessages';

const queryClient = new QueryClient();

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        
        {/* Protected Routes with MainLayout */}
        {user && (
          <Route path="/" element={<MainLayout />}>
            {/* Dashboard Routes */}
            <Route 
              index 
              element={
                user.role === 'teacher' ? <TeacherDashboard /> :
                user.role === 'student' ? <StudentDashboard /> :
                user.role === 'admin' ? <AdminDashboard /> :
                <Navigate to="/login" replace />
              } 
            />
            
            {/* Teacher Routes */}
            {user.role === 'teacher' && (
              <>
                <Route path="teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="teacher/messages" element={<TeacherMessages />} />
              </>
            )}
            
            {/* Student Routes */}
            {user.role === 'student' && (
              <>
                <Route path="student/dashboard" element={<StudentDashboard />} />
                <Route path="student/messages" element={<StudentMessages />} />
              </>
            )}
            
            {/* Admin Routes */}
            {user.role === 'admin' && (
              <>
                <Route path="admin/dashboard" element={<AdminDashboard />} />
              </>
            )}
          </Route>
        )}
        
        <Route 
          path="*" 
          element={<Navigate to={user ? "/" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;