// Cinderella-school\src\components\Layout\MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AdminDashboard from '../Dashboard/AdminDashboard';
import TeacherDashboard from '../Dashboard/TeacherDashboard';
import StudentDashboard from '../Dashboard/StudentDashboard';

// Import new page components
import TeacherAssignments from '../../pages/Teacher/TeacherAssignments';
import TeacherCreateAssignment from '../../pages/Teacher/TeacherCreateAssignment';
import TeacherSubmissions from '../../pages/Teacher/TeacherSubmissions';
import TeacherStudents from '../../pages/Teacher/TeacherStudents';
import TeacherCalendar from '../../pages/Teacher/TeacherCalendar';
import TeacherActivity from '../../pages/Teacher/TeacherActivity';
import TeacherMessages from '../../pages/Teacher/TeacherMessages';

import StudentAssignments from '../../pages/Student/StudentAssignments';
import StudentSubmissions from '../../pages/Student/StudentSubmissions';
import StudentCalendar from '../../pages/Student/StudentCalendar';
import StudentActivity from '../../pages/Student/StudentActivity';
import StudentHelp from '../../pages/Student/StudentHelp';
import StudentMessages from '../../pages/Student/StudentMessages';

export default function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle navigation event from CreateAssignment
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, []);

  const renderContent = () => {
    if (!user) return null;

    // Render content based on user role and active tab
    switch (user.role) {
      case 'admin':
        switch (activeTab) {
          case 'dashboard':
            return <AdminDashboard />;
          default:
            return <AdminDashboard />;
        }
      
      case 'teacher':
        switch (activeTab) {
          case 'dashboard':
            return <TeacherDashboard />;
          case 'assignments':
            return <TeacherAssignments />;
          case 'create':
            return <TeacherCreateAssignment />;
          case 'submissions':
            return <TeacherSubmissions />;
          case 'students':
            return <TeacherStudents />;
          case 'calendar':
            return <TeacherCalendar />;
          case 'activity':
            return <TeacherActivity />;
          case 'messages':
            return <TeacherMessages />;
          default:
            return <TeacherDashboard />;
        }
      
      case 'student':
        switch (activeTab) {
          case 'dashboard':
            return <StudentDashboard />;
          case 'assignments':
            return <StudentAssignments />;
          case 'submissions':
            return <StudentSubmissions />;
          case 'calendar':
            return <StudentCalendar />;
          case 'activity':
            return <StudentActivity />;
          case 'help':
            return <StudentHelp />;
          case 'messages':
            return <StudentMessages />;
          default:
            return <StudentDashboard />;
        }
      
      default:
        return <div>Invalid user role</div>;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={handleMenuToggle}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopBar onMenuToggle={handleMenuToggle} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}