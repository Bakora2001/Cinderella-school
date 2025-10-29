import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  FileText,
  Upload,
  Users,
  Settings,
  Bell,
  Calendar,
  BarChart3,
  BookOpen,
  GraduationCap,
  Shield,
  Activity,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) {
  const { user } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'assignments', label: 'All Assignments', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'activity', label: 'Activity Log', icon: Activity },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'assignments', label: 'My Assignments', icon: FileText },
          { id: 'create', label: 'Create Assignment', icon: Upload },
          { id: 'submissions', label: 'Submissions', icon: BookOpen },
          { id: 'students', label: 'My Students', icon: Users },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'activity', label: 'Activity', icon: Activity },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'submissions', label: 'My Submissions', icon: Upload },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'activity', label: 'Activity', icon: Activity },
          { id: 'help', label: 'Help & Instructions', icon: HelpCircle },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
      case 'teacher':
        return <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
      case 'student':
        return <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-800 shadow-lg"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 p-4 sm:p-6 border-b border-gray-700">
          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-semibold text-white truncate">Cinderella School</h2>
            <p className="text-xs sm:text-sm text-gray-400 truncate">Assignment System</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex-shrink-0">
              {getRoleIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p>
              {user?.subject && (
                <p className="text-xs text-red-400 truncate">{user.subject}</p>
              )}
              {user?.class && (
                <p className="text-xs text-red-400 truncate">{user.class}</p>
              )}
            </div>
            <div className={cn(
              "w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0",
              user?.isOnline ? "bg-green-500" : "bg-gray-500"
            )} />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 text-left h-9 sm:h-10 px-2 sm:px-3",
                    activeTab === item.id
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                  onClick={() => {
                    onTabChange(item.id);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Cinderella School
          </p>
        </div>
      </div>
    </>
  );
}