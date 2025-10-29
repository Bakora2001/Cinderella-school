import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, File } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CircularClock = ({ selectedTime, onTimeChange }) => {
  const [hours, setHours] = useState(selectedTime.getHours());
  const [minutes, setMinutes] = useState(selectedTime.getMinutes());
  const [isHourMode, setIsHourMode] = useState(true);
  
  const handleClockClick = (e) => {
    const clock = e.currentTarget;
    const rect = clock.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
    
    if (isHourMode) {
      const newHours = Math.round(degrees / 30) % 12 || 12;
      setHours(newHours);
      const newDate = new Date(selectedTime);
      newDate.setHours(newHours);
      onTimeChange(newDate);
    } else {
      const newMinutes = Math.round(degrees / 6) % 60;
      setMinutes(newMinutes);
      const newDate = new Date(selectedTime);
      newDate.setMinutes(newMinutes);
      onTimeChange(newDate);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 text-3xl font-bold">
        <button onClick={() => setIsHourMode(true)} className={`px-4 py-2 rounded-lg transition-colors ${isHourMode ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {hours.toString().padStart(2, '0')}
        </button>
        <span className="py-2">:</span>
        <button onClick={() => setIsHourMode(false)} className={`px-4 py-2 rounded-lg transition-colors ${!isHourMode ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {minutes.toString().padStart(2, '0')}
        </button>
      </div>
      <div className="relative w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full shadow-inner cursor-pointer" onClick={handleClockClick}>
        {(isHourMode ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]).map((num, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const radius = 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return <div key={num} className="absolute text-sm font-semibold text-gray-600" style={{left: `calc(50% + ${x}px - 10px)`, top: `calc(50% + ${y}px - 10px)`, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{num}</div>;
        })}
        <div className="absolute w-1 bg-red-600 origin-bottom rounded-full transition-transform duration-200" style={{height: '80px', left: 'calc(50% - 2px)', top: 'calc(50% - 80px)', transform: `rotate(${isHourMode ? (hours % 12) * 30 : minutes * 6}deg)`}}>
          <div className="absolute -top-2 -left-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white" />
        </div>
        <div className="absolute w-3 h-3 bg-red-600 rounded-full" style={{ left: 'calc(50% - 6px)', top: 'calc(50% - 6px)' }} />
      </div>
    </div>
  );
};

const ModernCalendar = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [selected, setSelected] = useState(selectedDate);
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelected(newDate);
    onDateChange(newDate);
  };
  
  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`empty-${i}`} className="h-10" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selected && selected.getDate() === day && selected.getMonth() === currentMonth.getMonth();
    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
    days.push(<button key={day} onClick={() => handleDateClick(day)} className={`h-10 rounded-full transition-all hover:bg-red-100 ${isSelected ? 'bg-red-600 text-white font-bold shadow-lg scale-110' : isToday ? 'bg-red-100 text-red-600 font-semibold' : 'text-gray-700 hover:scale-105'}`}>{day}</button>);
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">←</button>
        <h3 className="text-lg font-bold text-gray-800">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">→</button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">{dayNames.map(day => <div key={day} className="text-center text-xs font-semibold text-gray-500">{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-2">{days}</div>
    </div>
  );
};

export default function TeacherCreateAssignment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    teacherId: '',
    title: '',
    description: '',
    instructions: '',
    class: '',
    dueDate: new Date(),
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
        description: "Please fill in all required fields",
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
        toast({
          title: "Success",
          description: `Assignment "${newAssignment.title}" created successfully!`,
        });
        
        // Reset form
        setNewAssignment({
          teacherId: '',
          title: '',
          description: '',
          instructions: '',
          class: '',
          dueDate: new Date(),
          documentFile: null
        });
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Assignment</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new assignment for your students with detailed instructions</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Assignment Details</CardTitle>
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
                  placeholder="Enter assignment title" 
                  className="mt-1" 
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                <Textarea 
                  id="description" 
                  value={newAssignment.description} 
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} 
                  placeholder="Describe the assignment" 
                  rows={3} 
                  className="mt-1" 
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="instructions" className="text-base font-semibold">Instructions</Label>
                <Textarea 
                  id="instructions" 
                  value={newAssignment.instructions} 
                  onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })} 
                  placeholder="Provide detailed instructions for students" 
                  rows={4} 
                  className="mt-1" 
                />
              </div>
              
              <div>
                <Label htmlFor="class" className="text-base font-semibold">Class *</Label>
                <Select value={newAssignment.class} onValueChange={(value) => setNewAssignment({ ...newAssignment, class: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map(className => (
                      <SelectItem key={className} value={className}>{className}</SelectItem>
                    ))}
                    <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                    <SelectItem value="Grade 10B">Grade 10B</SelectItem>
                    <SelectItem value="Grade 11A">Grade 11A</SelectItem>
                    <SelectItem value="Grade 11B">Grade 11B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-base font-semibold">Assignment Document (Optional)</Label>
                <Input 
                  type="file" 
                  onChange={handleFileUpload} 
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv" 
                  className="mt-1" 
                />
                {newAssignment.documentFile && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <File className="h-4 w-4 mr-1" />
                    {newAssignment.documentFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold mb-3 block">Due Date & Time *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ModernCalendar 
                    selectedDate={newAssignment.dueDate} 
                    onDateChange={(date) => {
                      const newDate = new Date(date);
                      newDate.setHours(newAssignment.dueDate.getHours());
                      newDate.setMinutes(newAssignment.dueDate.getMinutes());
                      setNewAssignment({ ...newAssignment, dueDate: newDate });
                    }} 
                  />
                </div>
                <div>
                  <CircularClock 
                    selectedTime={newAssignment.dueDate} 
                    onTimeChange={(date) => setNewAssignment({ ...newAssignment, dueDate: date })} 
                  />
                </div>
              </div>
              <p className="text-center mt-4 text-lg font-semibold text-gray-700">
                Selected: {newAssignment.dueDate.toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setNewAssignment({
                  teacherId: '',
                  title: '',
                  description: '',
                  instructions: '',
                  class: '',
                  dueDate: new Date(),
                  documentFile: null
                })}
                className="px-6"
              >
                Reset
              </Button>
              <Button 
                onClick={handleCreateAssignment} 
                className="bg-red-600 hover:bg-red-700 px-6"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}