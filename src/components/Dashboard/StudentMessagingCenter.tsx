// Cinderella-school\src\components\Dashboard\StudentMessagingCenter.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Plus, Search, MessageSquare, User, Check, CheckCheck, Circle } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AvailableUser {
  id: string;
  username: string;
  email: string;
  role: string;
  class_name?: string;
}

interface Assignment {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
}

interface StudentMessagingCenterProps {
  assignments?: Assignment[];
}

export default function StudentMessagingCenter({ assignments = [] }: StudentMessagingCenterProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isConnected,
    onlineUsers,
    messages,
    typingUsers,
    sendMessage,
    getChatHistory,
    markAsRead,
    startTyping,
    stopTyping,
    conversations,
    getUnreadCount,
    isUserOnline,
  } = useWebSocket();

  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('http://localhost:5000/api/users/getallusers');
        const data = await response.json();

        if (data.success) {
          const filteredUsers = data.users
            .filter((u: any) => u.role === 'teacher' || u.role === 'admin')
            .map((u: any) => ({
              id: u.id.toString(),
              username: `${u.firstname || ''} ${u.sirname || ''}`.trim() || u.email.split('@')[0],
              email: u.email,
              role: u.role,
              class_name: u.class,
            }));
          setAvailableUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Error fetching available users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch available users',
          variant: 'destructive',
        });
      }
    };

    fetchAvailableUsers();
  }, [user?.id, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      markAsRead(selectedUser.id);
    }
  }, [selectedUser, markAsRead]);

  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

  const handleUserSelect = (selectedUserData: AvailableUser) => {
    setSelectedUser(selectedUserData);
    getChatHistory(selectedUserData.id);
    setIsNewChatOpen(false);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUser || !user) return;

    sendMessage(selectedUser.id, messageInput, selectedUser.role);
    setMessageInput('');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(selectedUser.id);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!selectedUser) return;

    startTyping(selectedUser.id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedUser.id);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageDate.toLocaleDateString();
  };

  const filteredAvailableUsers = availableUsers.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teachersAndAdmins = filteredAvailableUsers.reduce((acc, user) => {
    const key = user.role === 'admin' ? 'Administrators' : 'Teachers';
    if (!acc[key]) acc[key] = [];
    acc[key].push(user);
    return acc;
  }, {} as Record<string, AvailableUser[]>);

  const conversationsList = conversations.map((conv) => ({
    ...conv,
    isOnline: isUserOnline(conv.userId),
  }));

  const currentChatMessages = selectedUser
    ? messages.filter(
        (msg) =>
          (msg.senderId === user?.id.toString() &&
            msg.receiverId === selectedUser.id) ||
          (msg.senderId === selectedUser.id &&
            msg.receiverId === user?.id.toString())
      )
    : [];

  const MessageStatusIcon = ({ message }: { message: any }) => {
    if (message.senderId !== user?.id.toString()) return null;

    if (message.status === 'read' || message.isRead) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    }
    return <Check className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div className="flex h-[600px] gap-4">
      {/* Conversations List */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Messages
            </CardTitle>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teachers and admins..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <ScrollArea className="h-96">
                    {Object.keys(teachersAndAdmins).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No teachers or admins available</p>
                      </div>
                    ) : (
                      Object.entries(teachersAndAdmins).map(([groupName, groupUsers]) => (
                        <div key={groupName} className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2 px-3">
                            {groupName}
                          </h3>
                          {groupUsers.map((availableUser) => {
                            const online = isUserOnline(availableUser.id);
                            return (
                              <div
                                key={availableUser.id}
                                onClick={() => handleUserSelect(availableUser)}
                                className="flex items-center gap-3 p-3 hover:bg-blue-100 rounded-lg cursor-pointer mb-2"
                              >
                                <div className="relative">
                                  <Avatar>
                                    <AvatarFallback
                                      className={`${
                                        online ? 'bg-green-600' : 'bg-gray-600'
                                      } text-white`}
                                    >
                                      {getInitials(availableUser.username)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {online && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {availableUser.username}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {availableUser.email}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs capitalize ${
                                      availableUser.role === 'admin'
                                        ? 'bg-purple-50 text-purple-700 border-purple-300'
                                        : 'bg-blue-50 text-blue-700 border-blue-300'
                                    }`}
                                  >
                                    {availableUser.role}
                                  </Badge>
                                  {online && (
                                    <span className="text-xs text-green-600">
                                      Online
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full px-4">
            {conversationsList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">
                  Start a chat with your teacher or admin
                </p>
              </div>
            ) : (
              conversationsList.map((conv) => {
                const unread = getUnreadCount(conv.userId);
                return (
                  <div
                    key={conv.userId}
                    onClick={() => {
                      const user = availableUsers.find(u => u.id === conv.userId);
                      if (user) handleUserSelect(user);
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-colors',
                      selectedUser?.id === conv.userId
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback
                          className={`${
                            conv.isOnline ? 'bg-green-600' : 'bg-gray-600'
                          } text-white`}
                        >
                          {getInitials(conv.username)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {conv.username}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conv.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-600 truncate flex-1">
                          {conv.lastMessage}
                        </p>
                        {unread > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center ml-2">
                            {unread > 99 ? '99+' : unread}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize mt-1 ${
                          conv.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300'
                        }`}
                      >
                        {conv.role}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback
                      className={`${
                        selectedUser.role === 'admin'
                          ? 'bg-purple-600'
                          : 'bg-blue-600'
                      } text-white`}
                    >
                      {getInitials(selectedUser.username)}
                    </AvatarFallback>
                  </Avatar>
                  {isUserOnline(selectedUser.id) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedUser.username}</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        selectedUser.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : 'bg-blue-50 text-blue-700 border-blue-300'
                      }`}
                    >
                      {selectedUser.role}
                    </Badge>
                    {isUserOnline(selectedUser.id) && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Circle className="h-2 w-2 fill-current" />
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <ScrollArea className="flex-1 pr-4 mb-4">
                {currentChatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">
                      Send a message to start the conversation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentChatMessages.map((msg, index) => {
                      const isMe = msg.senderId === user?.id.toString();
                      const showDate =
                        index === 0 ||
                        new Date(msg.timestamp).toDateString() !==
                          new Date(
                            currentChatMessages[index - 1].timestamp
                          ).toDateString();

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {new Date(msg.timestamp).toLocaleDateString(
                                  'en-US',
                                  { weekday: 'long', month: 'short', day: 'numeric' }
                                )}
                              </div>
                            </div>
                          )}
                          <div
                            className={cn(
                              'flex',
                              isMe ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <div
                              className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
                                isMe
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 rounded-bl-sm border'
                              )}
                            >
                              <p className="text-sm break-words">{msg.message}</p>
                              <div
                                className={cn(
                                  'flex items-center gap-1 mt-1',
                                  isMe ? 'justify-end' : 'justify-start'
                                )}
                              >
                                <span
                                  className={cn(
                                    'text-xs',
                                    isMe ? 'text-blue-100' : 'text-gray-500'
                                  )}
                                >
                                  {formatTime(msg.timestamp)}
                                </span>
                                <MessageStatusIcon message={msg} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {typingUsers.has(selectedUser.id) && (
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border">
                          <div className="flex gap-1 items-center">
                            <span className="text-xs text-gray-500 mr-2">typing</span>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.4s' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={messageInput}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={!isConnected}
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
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No conversation selected</p>
              <p className="text-sm mt-1">
                Choose a conversation or start a new one with your teacher or admin
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}