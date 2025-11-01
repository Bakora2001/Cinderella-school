import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2,
  Circle,
  Wifi,
  WifiOff,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useToast } from '@/hooks/use-toast';

interface MessagingCenterProps {
  assignments?: any[];
}

export default function MessagingCenter({ assignments = [] }: MessagingCenterProps) {
  const { user } = useAuth();
  const { 
    messages, 
    conversations, 
    onlineUsers, 
    sendMessage, 
    markAsRead, 
    fetchConversations, 
    fetchMessages,
    isConnected 
  } = useWebSocket();
  const { toast } = useToast();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAvailableUsers = async () => {
    if (!user?.id || !user?.role) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/websocketschat/available-users/${user.id}/${user.role}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setAvailableUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    const assignmentId = selectedAssignment || undefined;
    sendMessage(selectedConversation, messageInput.trim(), assignmentId);
    setMessageInput('');
    setSelectedAssignment('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewConversation = (userId: string) => {
    setSelectedConversation(userId);
    setIsNewChatOpen(false);
    
    // Add to conversations if not exists
    if (!conversations.find(c => c.userId === userId)) {
      const newUser = availableUsers.find(u => u.id === userId);
      if (newUser) {
        // This will be handled by the WebSocket context
      }
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.userId === selectedConversation);
  const conversationMessages = messages.filter(m => 
    (m.senderId === selectedConversation && m.receiverId === user?.id) ||
    (m.senderId === user?.id && m.receiverId === selectedConversation)
  );

  const getAssignmentTitle = (assignmentId?: string) => {
    if (!assignmentId) return null;
    const assignment = assignments.find(a => a.id === assignmentId);
    return assignment?.title || 'Unknown Assignment';
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Messages</h2>
              <p className="text-sm text-gray-600">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-green-600" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3 text-red-600" />
                    Disconnected
                  </span>
                )}
              </p>
            </div>
          </div>
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={fetchAvailableUsers}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
                <DialogDescription>
                  Select a {user?.role === 'student' ? 'teacher or admin' : 'student'} to start chatting
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-64">
                {availableUsers.map(availableUser => (
                  <div
                    key={availableUser.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => startNewConversation(availableUser.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${
                            onlineUsers.includes(availableUser.id) ? 'bg-green-600' : 'bg-gray-600'
                          } text-white`}>
                            {getInitials(availableUser.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          onlineUsers.includes(availableUser.id) ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <p className="font-medium">{availableUser.username}</p>
                        <p className="text-sm text-gray-500 capitalize">{availableUser.role}</p>
                      </div>
                    </div>
                    <Badge variant={onlineUsers.includes(availableUser.id) ? 'default' : 'secondary'}>
                      {onlineUsers.includes(availableUser.id) ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                ))}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin</p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <div
                  key={conversation.userId}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.userId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.userId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={`${
                          conversation.isOnline ? 'bg-green-600' : 'bg-gray-600'
                        } text-white`}>
                          {getInitials(conversation.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        conversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.username}</p>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <Badge className="bg-red-600 text-xs px-2 py-1">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 capitalize">{conversation.role}</p>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      )}
                      {conversation.lastMessageTime && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(conversation.lastMessageTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${
                      currentConversation?.isOnline ? 'bg-green-600' : 'bg-gray-600'
                    } text-white`}>
                      {currentConversation ? getInitials(currentConversation.username) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentConversation?.username}</p>
                    <p className="text-sm text-gray-500">
                      {currentConversation?.isOnline ? 'Online' : 'Offline'} • {currentConversation?.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversationMessages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.assignmentId && (
                          <div className={`text-xs mb-2 p-2 rounded ${
                            message.senderId === user?.id
                              ? 'bg-blue-700 bg-opacity-50'
                              : 'bg-gray-200'
                          }`}>
                            <FileText className="h-3 w-3 inline mr-1" />
                            Re: {getAssignmentTitle(message.assignmentId)}
                          </div>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-gray-50">
                {assignments.length > 0 && (
                  <div className="mb-3">
                    <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Reference an assignment (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No assignment reference</SelectItem>
                        {assignments.map(assignment => (
                          <SelectItem key={assignment.id} value={assignment.id}>
                            {assignment.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
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
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Select a conversation</p>
                <p className="text-sm">Choose someone to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}