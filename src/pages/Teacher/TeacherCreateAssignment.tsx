import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, File, Clock, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Modern Time Picker with AM/PM - Fully Working
const ModernTimePicker = ({ selectedTime, onTimeChange }) => {
  // Initialize with proper 12-hour format
  const get12Hour = (date) => {
    const h = date.getHours();
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  };

  const getPeriod = (date) => {
    return date.getHours() >= 12 ? 'PM' : 'AM';
  };

  const [hours, setHours] = useState(get12Hour(selectedTime));
  const [minutes, setMinutes] = useState(selectedTime.getMinutes());
  const [period, setPeriod] = useState(getPeriod(selectedTime));

  const handleHourChange = (value) => {
    const newHours = parseInt(value);
    setHours(newHours);
    updateTime(newHours, minutes, period);
  };

  const handleMinuteChange = (value) => {
    const newMinutes = parseInt(value);
    setMinutes(newMinutes);
    updateTime(hours, newMinutes, period);
  };

  const handlePeriodChange = (value) => {
    setPeriod(value);
    updateTime(hours, minutes, value);
  };

  const updateTime = (h, m, p) => {
    const newDate = new Date(selectedTime);
    let hour24 = h;
    
    // Convert 12-hour to 24-hour format
    if (p === 'PM' && h !== 12) {
      hour24 = h + 12;
    } else if (p === 'AM' && h === 12) {
      hour24 = 0;
    }
    
    newDate.setHours(hour24, m, 0, 0);
    onTimeChange(newDate);
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute options (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
      <div className="text-center">
        <Label className="text-sm font-semibold text-gray-600 mb-2 block">Select Time (12-hour format)</Label>
        <p className="text-xs text-gray-500">East Africa Time (EAT)</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Hour Selector */}
        <div className="flex flex-col items-center">
          <Label className="text-xs text-gray-500 mb-2">Hour</Label>
          <Select value={hours.toString()} onValueChange={handleHourChange}>
            <SelectTrigger className="w-24 h-16 text-3xl font-bold bg-white shadow-md border-2 border-red-200 hover:border-red-400 transition-colors">
              <SelectValue>{hours.toString().padStart(2, '0')}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {hourOptions.map((h) => (
                <SelectItem key={h} value={h.toString()} className="text-lg">
                  {h.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-4xl font-bold text-gray-700 mt-6">:</span>

        {/* Minute Selector */}
        <div className="flex flex-col items-center">
          <Label className="text-xs text-gray-500 mb-2">Minute</Label>
          <Select value={minutes.toString()} onValueChange={handleMinuteChange}>
            <SelectTrigger className="w-24 h-16 text-3xl font-bold bg-white shadow-md border-2 border-red-200 hover:border-red-400 transition-colors">
              <SelectValue>{minutes.toString().padStart(2, '0')}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {minuteOptions.map((m) => (
                <SelectItem key={m} value={m.toString()} className="text-lg">
                  {m.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AM/PM Selector */}
        <div className="flex flex-col items-center">
          <Label className="text-xs text-gray-500 mb-2">Period</Label>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-24 h-16 text-2xl font-bold bg-white shadow-md border-2 border-red-200 hover:border-red-400 transition-colors">
              <SelectValue>{period}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM" className="text-xl font-semibold">AM</SelectItem>
              <SelectItem value="PM" className="text-xl font-semibold">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Display Selected Time */}
      <div className="bg-red-600 text-white px-8 py-4 rounded-lg shadow-lg">
        <p className="text-center font-bold text-2xl tracking-wide">
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')} {period}
        </p>
        <p className="text-center text-xs mt-1 opacity-90">Selected Time (EAT)</p>
      </div>
    </div>
  );
};

// Modern Calendar Component
const ModernCalendar = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [selected, setSelected] = useState(selectedDate);
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Preserve the time from selected date
    newDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setSelected(newDate);
    onDateChange(newDate);
  };
  
  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`empty-${i}`} className="h-12" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selected && selected.getDate() === day && selected.getMonth() === currentMonth.getMonth();
    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
    days.push(
      <button 
        key={day} 
        onClick={() => handleDateClick(day)} 
        className={`h-12 rounded-lg transition-all hover:bg-red-100 font-semibold ${isSelected ? 'bg-red-600 text-white shadow-lg scale-110' : isToday ? 'bg-red-100 text-red-600' : 'text-gray-700 hover:scale-105'}`}
      >
        {day}
      </button>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-xl font-bold">←</button>
        <h3 className="text-lg font-bold text-gray-800">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-xl font-bold">→</button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map(day => <div key={day} className="text-center text-xs font-semibold text-gray-500">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">{days}</div>
    </div>
  );
};

export default function TeacherCreateAssignment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdAssignmentTitle, setCreatedAssignmentTitle] = useState('');
  
  // Initialize with current EAT time
  const getEATDate = () => {
    // Create a date in EAT timezone (Africa/Nairobi is UTC+3)
    const now = new Date();
    // Get EAT time string
    const eatString = now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
    return new Date(eatString);
  };

  const [newAssignment, setNewAssignment] = useState({
    teacherId: '',
    title: '',
    description: '',
    instructions: '',
    class: '',
    dueDate: getEATDate(),
    documentFile: null
  });

  const getCurrentUserId = () => {
    return user?.id || localStorage.getItem('userId');
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/getallusers');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users.map((user) => ({
          ...user,
          username: `${user.firstname || ''} ${user.sirname || ''}`.trim() || user.email.split('@')[0],
          class_name: user.class,
          isOnline: false
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const students = users.filter(u => u.role === 'student');
  const availableClasses = [...new Set(students.map(s => s.class_name).filter(Boolean))];

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) setNewAssignment({ ...newAssignment, documentFile: file });
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.description || !newAssignment.class) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title, Description, and Class)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      if (newAssignment.documentFile) formData.append('document', newAssignment.documentFile);
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('instructions', newAssignment.instructions);
      formData.append('class_name', newAssignment.class);
      
      // Send the date as ISO string - backend will handle timezone
      formData.append('due_date', newAssignment.dueDate.toISOString());
      
      const currentUserId = getCurrentUserId();
      formData.append('teacherId', currentUserId || '');
      
      const response = await fetch('http://localhost:5000/api/assignments/new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCreatedAssignmentTitle(newAssignment.title);
        setShowSuccessMessage(true);
        
        toast({
          title: "✅ Success",
          description: `Assignment "${newAssignment.title}" created successfully!`,
        });
        
        // Reset form
        setNewAssignment({
          teacherId: '',
          title: '',
          description: '',
          instructions: '',
          class: '',
          dueDate: getEATDate(),
          documentFile: null
        });

        // Redirect to My Assignments after 2.5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          // Trigger navigation event
          const event = new CustomEvent('navigateToTab', { detail: 'assignments' });
          window.dispatchEvent(event);
        }, 2500);

      } else {
        throw new Error(data.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date in EAT timezone with 12-hour format
  const formatEATDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi'
    }) + ' EAT';
  };

  return (
    <div className="space-y-6" style={{ zoom: '0.8' }}>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Assignment</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new assignment for your students with detailed instructions</p>
      </div>

      {/* Success Message with Animation */}
      {showSuccessMessage && (
        <Alert className="border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-in fade-in slide-in-from-top-5 duration-500">
          <CheckCircle2 className="h-6 w-6 text-green-600 animate-pulse" />
          <AlertDescription className="text-green-800 font-semibold text-lg ml-2">
            🎉 Success! Assignment "{createdAssignmentTitle}" has been created successfully! 
            <br />
            <span className="text-sm">Redirecting to My Assignments...</span>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg border-t-4 border-t-red-600">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Plus className="h-6 w-6 text-red-600" />
            Assignment Details
          </CardTitle>
          <CardDescription>Fill in the information below to create a new assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-base font-semibold">Assignment Title *</Label>
                <Input 
                  id="title" 
                  value={newAssignment.title} 
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} 
                  placeholder="Enter assignment title (e.g., Mathematics Chapter 5 Assignment)" 
                  className="mt-1 h-12 text-base" 
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                <Textarea 
                  id="description" 
                  value={newAssignment.description} 
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} 
                  placeholder="Describe what this assignment is about..." 
                  rows={3} 
                  className="mt-1 text-base" 
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="instructions" className="text-base font-semibold">Detailed Instructions (Optional)</Label>
                <Textarea 
                  id="instructions" 
                  value={newAssignment.instructions} 
                  onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })} 
                  placeholder="Provide step-by-step instructions for students..." 
                  rows={4} 
                  className="mt-1 text-base" 
                />
              </div>
              
              <div>
                <Label htmlFor="class" className="text-base font-semibold">Class *</Label>
                <Select value={newAssignment.class} onValueChange={(value) => setNewAssignment({ ...newAssignment, class: value })}>
                  <SelectTrigger className="mt-1 h-12 text-base">
                    <SelectValue placeholder="Select target class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map(className => (
                      <SelectItem key={className} value={className} className="text-base">{className}</SelectItem>
                    ))}
                    <SelectItem value="Grade 10A" className="text-base">Grade 10A</SelectItem>
                    <SelectItem value="Grade 10B" className="text-base">Grade 10B</SelectItem>
                    <SelectItem value="Grade 11A" className="text-base">Grade 11A</SelectItem>
                    <SelectItem value="Grade 11B" className="text-base">Grade 11B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-base font-semibold">Assignment Document (Optional)</Label>
                <Input 
                  type="file" 
                  onChange={handleFileUpload} 
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv" 
                  className="mt-1 h-12 cursor-pointer" 
                />
                {newAssignment.documentFile && (
                  <p className="text-sm text-green-600 mt-2 flex items-center font-medium">
                    <File className="h-4 w-4 mr-1" />
                    ✓ {newAssignment.documentFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <Label className="text-xl font-bold mb-4 block flex items-center gap-2">
                <Clock className="h-6 w-6 text-red-600" />
                Due Date & Time * (East Africa Time - EAT)
              </Label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-red-600" />
                    Select Date
                  </Label>
                  <ModernCalendar 
                    selectedDate={newAssignment.dueDate} 
                    onDateChange={(date) => setNewAssignment({ ...newAssignment, dueDate: date })} 
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    Select Time (12-hour format)
                  </Label>
                  <ModernTimePicker 
                    selectedTime={newAssignment.dueDate} 
                    onTimeChange={(date) => setNewAssignment({ ...newAssignment, dueDate: date })} 
                  />
                </div>
              </div>
              
              <div className="mt-6 p-5 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-xl border-2 border-red-300 shadow-md">
                <p className="text-center text-sm font-semibold text-gray-600 mb-2">📅 ASSIGNMENT DUE DATE & TIME</p>
                <p className="text-center text-xl font-bold text-red-700">
                  {formatEATDateTime(newAssignment.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t-2 border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => {
                  setNewAssignment({
                    teacherId: '',
                    title: '',
                    description: '',
                    instructions: '',
                    class: '',
                    dueDate: getEATDate(),
                    documentFile: null
                  });
                  toast({
                    title: "Form Reset",
                    description: "All fields have been cleared"
                  });
                }}
                className="px-8 h-12 text-base"
                disabled={isLoading}
              >
                Reset Form
              </Button>
              <Button 
                onClick={handleCreateAssignment} 
                className="bg-red-600 hover:bg-red-700 px-8 h-12 text-base font-semibold shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Assignment
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}