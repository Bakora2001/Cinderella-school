import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AdminDashboard from '../Dashboard/AdminDashboard';
import TeacherDashboard from '../Dashboard/TeacherDashboard';
import StudentDashboard from '../Dashboard/StudentDashboard';

export default function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    if (!user) return null;

    // For this MVP, we'll show the main dashboard regardless of tab selection
    // In a full implementation, you'd have different components for each tab
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
        return <StudentDashboard />;
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