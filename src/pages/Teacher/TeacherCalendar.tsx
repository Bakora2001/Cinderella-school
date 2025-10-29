import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function TeacherCalendar() {
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
      const response = await fetch(`http://localhost:5000/api/assignments/teacher/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const transformedAssignments = data.assignments.map(assignment => ({
          id: assignment.id.toString(),
          title: assignment.title,
          class: assignment.class_name,
          dueDate: new Date(assignment.due_date),
          createdAt: new Date(assignment.created_at),
          submissionsCount: assignment.submissions_count || 0,
          totalStudents: assignment.total_students || 0
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

  const getSubmissionPercentage = (assignment) => {
    if (assignment.totalStudents === 0) return 0;
    return Math.round((assignment.submissionsCount / assignment.totalStudents) * 100);
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
        className={`h-24 p-2 border transition-all hover:bg-red-50 relative ${
          isSelected ? 'bg-red-600 text-white border-red-700 shadow-lg scale-105' : 
          isToday ? 'bg-red-100 border-red-400 font-semibold' : 
          'bg-white border-gray-200 hover:border-red-300'
        }`}
      >
        <div className="text-left">
          <span className={`text-lg font-semibold ${isSelected ? 'text-white' : isToday ? 'text-red-600' : 'text-gray-700'}`}>
            {day}
          </span>
        </div>
        {hasAssignments && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="flex flex-wrap gap-1">
              {dayAssignments.slice(0, 2).map((assignment) => {
                const daysUntil = getDaysUntilDue(assignment.dueDate);
                return (
                  <div 
                    key={assignment.id}
                    className={`h-1.5 w-full rounded-full ${
                      daysUntil < 0 ? 'bg-gray-400' : 
                      daysUntil <= 2 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                  />
                );
              })}
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

  // Get upcoming assignments in the next 7 days
  const upcomingAssignments = assignments
    .filter(a => {
      const daysUntil = getDaysUntilDue(a.dueDate);
      return daysUntil >= 0 && daysUntil <= 7;
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Calendar</h1>
        <p className="text-gray-600 mt-1">View and manage assignment due dates</p>
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
              <CardDescription>Your assignment schedule and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <>
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
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-600">Due Soon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-gray-600">Due in 1-2 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                      <span className="text-sm text-gray-600">Past Due</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignments for Selected Date */}
        <div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-red-600" />
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </CardTitle>
              <CardDescription>Assignments due on this date</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
                      const submissionPercentage = getSubmissionPercentage(assignment);
                      
                      return (
                        <Card key={assignment.id} className={`${
                          daysUntil < 0 ? 'border-l-4 border-l-gray-600' : 
                          daysUntil <= 2 ? 'border-l-4 border-l-orange-600' : 
                          'border-l-4 border-l-red-600'
                        }`}>
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-sm">{assignment.title}</h4>
                                {daysUntil < 0 ? (
                                  <AlertCircle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                ) : (
                                  <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
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
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Submissions
                                  </span>
                                  <span className="font-semibold">
                                    {assignment.submissionsCount}/{assignment.totalStudents} ({submissionPercentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      submissionPercentage >= 80 ? 'bg-green-600' :
                                      submissionPercentage >= 50 ? 'bg-orange-600' : 'bg-red-600'
                                    }`}
                                    style={{ width: `${submissionPercentage}%` }}
                                  />
                                </div>
                              </div>
                              <Badge className={`text-xs ${
                                daysUntil < 0 ? 'bg-gray-600' :
                                daysUntil <= 2 ? 'bg-orange-600' : 'bg-red-600'
                              }`}>
                                {daysUntil < 0 ? 'Past Due' :
                                 daysUntil === 0 ? 'Due Today' : 
                                 `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`}
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
      {upcomingAssignments.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Deadlines (Next 7 Days)</CardTitle>
            <CardDescription>Assignments that need attention soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingAssignments.map(assignment => {
                const daysUntil = getDaysUntilDue(assignment.dueDate);
                const submissionPercentage = getSubmissionPercentage(assignment);
                
                return (
                  <Card key={assignment.id} className={`border-l-4 ${
                    daysUntil <= 2 ? 'border-l-orange-600' : 'border-l-red-600'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">{assignment.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {assignment.class}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <CalendarIcon className="h-3 w-3" />
                          {assignment.dueDate.toLocaleDateString()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Submissions</span>
                            <span className="font-semibold">
                              {assignment.submissionsCount}/{assignment.totalStudents}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                submissionPercentage >= 80 ? 'bg-green-600' :
                                submissionPercentage >= 50 ? 'bg-orange-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${submissionPercentage}%` }}
                            />
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          daysUntil <= 2 ? 'bg-orange-600' : 'bg-red-600'
                        }`}>
                          {daysUntil === 0 ? 'Due Today' : 
                           `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <CalendarIcon className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {assignments.filter(a => {
                const daysUntil = getDaysUntilDue(a.dueDate);
                return daysUntil >= 0 && daysUntil <= 7;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertCircle className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {assignments.filter(a => getDaysUntilDue(a.dueDate) < 0).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Submission Rate</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {assignments.length > 0 
                ? Math.round(
                    assignments.reduce((sum, a) => sum + getSubmissionPercentage(a), 0) / assignments.length
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}