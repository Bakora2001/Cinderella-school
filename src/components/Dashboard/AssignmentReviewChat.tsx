import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  FileText, 
  User, 
  Clock,
  X,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useToast } from '@/hooks/use-toast';

interface AssignmentReviewChatProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
  submission: any;
}

export default function AssignmentReviewChat({ 
  isOpen, 
  onClose, 
  assignment, 
  submission 
}: AssignmentReviewChatProps) {
  const { user } = useAuth();
  const { messages, sendMessage, fetchMessages, isConnected } = useWebSocket();
  const { toast } = useToast();
  
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && submission) {
      fetchMessages(submission.student_id);
    }
  }, [isOpen, submission]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !submission) return;
    
    sendMessage(submission.student_id, messageInput.trim(), assignment.id);
    setMessageInput('');
    
    toast({
      title: "Message Sent",
      description: `Message sent to ${submission.student_name} about "${assignment.title}"`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Filter messages for this specific assignment conversation
  const assignmentMessages = messages.filter(m => 
    m.assignmentId === assignment?.id &&
    ((m.senderId === submission?.student_id && m.receiverId === user?.id) ||
     (m.senderId === user?.id && m.receiverId === submission?.student_id))
  );

  if (!isOpen || !assignment || !submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">Assignment Review Chat</DialogTitle>
                <DialogDescription className="mt-1">
                  Discussing "{assignment.title}" with {submission.student_name}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[600px]">
          {/* Assignment & Student Info */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Assignment</p>
                <p className="font-semibold text-blue-800">{assignment.title}</p>
                <p className="text-xs text-gray-500">{assignment.class}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getInitials(submission.student_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{submission.student_name}</p>
                    <p className="text-xs text-gray-500">{submission.student_class}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submission Status</p>
                <Badge 
                  variant={submission.status === 'submitted' ? 'default' : 'secondary'}
                  className={submission.status === 'submitted' ? 'bg-orange-600' : 'bg-green-600'}
                >
                  {submission.status}
                </Badge>
                {submission.grade && (
                  <p className="text-sm font-medium text-green-600 mt-1">
                    Grade: {submission.grade}/100
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4 border rounded-lg">
            <div className="space-y-4">
              {assignmentMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No messages about this assignment yet</p>
                  <p className="text-sm">Start the conversation to provide feedback or answer questions</p>
                </div>
              ) : (
                assignmentMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {message.senderId === user?.id ? 'You (Teacher)' : submission.student_name}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${
                          message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                        {message.senderId === user?.id && (
                          <CheckCircle className="h-3 w-3 text-blue-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <Input
                placeholder={`Message ${submission.student_name} about this assignment...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !isConnected}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • This message will reference "{assignment.title}"
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}