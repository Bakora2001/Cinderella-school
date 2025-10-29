import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function StudentCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const fetchAssignments = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/assignments/student/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const transformedAssignments = data.assignments.map(assignment => ({
          id: assignment.id.toString(),
          title: assignment.title,
          dueDate: new Date(assignment.due_date),
          submissionId: assignment.submission_id,
          class: assignment.class_name
        }));
        
        setAssignments(transformedAssignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getAssignmentsForDate = (date) => {
    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      return dueDate.getDate() === date.getDate() &&
             dueDate.getMonth() === date.getMonth() &&
             dueDate.getFullYear() === date.getFullYear();
    });
  };

  const getAssignmentsForDay = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return getAssignmentsForDate(date);
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const diffInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const selectedDayAssignments = getAssignmentsForDate(selectedDate);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isSelected = selectedDate && selectedDate.getDate() === day && 
                      selectedDate.getMonth() === currentMonth.getMonth() &&
                      selectedDate.getFullYear() === currentMonth.getFullYear();
    const isToday = new Date().getDate() === day && 
                   new Date().getMonth() === currentMonth.getMonth() && 
                   new Date().getFullYear() === currentMonth.getFullYear();
    const dayAssignments = getAssignmentsForDay(day);
    const hasAssignments = dayAssignments.length > 0;
    
    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`h-24 p-2 border transition-all hover:bg-blue-50 relative ${
          isSelected ? 'bg-blue-600 text-white border-blue-700 shadow-lg scale-105' : 
          isToday ? 'bg-blue-100 border-blue-400 font-semibold' : 
          'bg-white border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="text-left">
          <span className={`text-lg font-semibold ${isSelected ? 'text-white' : isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </span>
        </div>
        {hasAssignments && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="flex flex-wrap gap-1">
              {dayAssignments.slice(0, 2).map((assignment, idx) => (
                <div 
                  key={assignment.id}
                  className={`h-1.5 w-full rounded-full ${
                    assignment.submissionId ? 'bg-green-500' : 
                    getDaysUntilDue(assignment.dueDate) < 0 ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                />
              ))}
              {dayAssignments.length > 2 && (
                <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                  +{dayAssignments.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Calendar</h1>
        <p className="text-gray-600 mt-1">View your assignment deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <Button onClick={previousMonth} variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-2xl">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </CardTitle>
                <Button onClick={nextMonth} variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Overdue</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments for Selected Date */}
        <div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedDayAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No assignments due</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {selectedDayAssignments.map(assignment => {
                      const daysUntil = getDaysUntilDue(assignment.dueDate);
                      const isOverdue = daysUntil < 0 && !assignment.submissionId;
                      
                      return (
                        <Card key={assignment.id} className={`${
                          isOverdue ? 'border-l-4 border-l-red-600' : 
                          assignment.submissionId ? 'border-l-4 border-l-green-600' : 
                          'border-l-4 border-l-orange-600'
                        }`}>
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-sm">{assignment.title}</h4>
                                {assignment.submissionId ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : isOverdue ? (
                                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                ) : (
                                  <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {assignment.class}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock className="h-3 w-3" />
                                {assignment.dueDate.toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              <Badge className={`text-xs ${
                                assignment.submissionId ? 'bg-green-600' :
                                isOverdue ? 'bg-red-600' : 'bg-orange-600'
                              }`}>
                                {assignment.submissionId ? 'Submitted' :
                                 isOverdue ? 'Overdue' : 
                                 daysUntil === 0 ? 'Due Today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Assignments Summary */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assignments
              .filter(a => getDaysUntilDue(a.dueDate) >= 0 && getDaysUntilDue(a.dueDate) <= 7 && !a.submissionId)
              .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
              .slice(0, 6)
              .map(assignment => (
                <Card key={assignment.id} className="border-l-4 border-l-orange-600">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{assignment.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <CalendarIcon className="h-3 w-3" />
                        {assignment.dueDate.toLocaleDateString()}
                      </div>
                      <Badge className="bg-orange-600 text-xs">
                        {getDaysUntilDue(assignment.dueDate) === 0 ? 'Due Today' : 
                         `${getDaysUntilDue(assignment.dueDate)} day${getDaysUntilDue(assignment.dueDate) !== 1 ? 's' : ''} left`}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}