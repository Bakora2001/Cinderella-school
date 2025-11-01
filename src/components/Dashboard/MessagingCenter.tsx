// Cinderella-school\src\components\Dashboard\MessagingCenter.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Search,
  Check,
  CheckCheck,
  Circle,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { cn } from '@/lib/utils';

interface Assignment {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
}

interface MessagingCenterProps {
  assignments?: Assignment[];
}

export default function MessagingCenter({ assignments = [] }: MessagingCenterProps) {
  const { user } = useAuth();
  const {
    messages,
    conversations,
    onlineUsers,
    typingUsers,
    isConnected,
    sendMessage,
    getChatHistory,
    markAsRead,
    startTyping,
    stopTyping,
    getUnreadCount,
    isUserOnline,
  } = useWebSocket();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/getallusers');
        const data = await response.json();
        
        if (data.success) {
          // Filter users based on role
          let filteredUsers = data.users;
          
          if (user?.role === 'student') {
            // Students can message teachers and admins
            filteredUsers = data.users.filter((u: any) => 
              u.role === 'teacher' || u.role === 'admin'
            );
          } else if (user?.role === 'teacher') {
            // Teachers can message students and admins
            filteredUsers = data.users.filter((u: any) => 
              u.role === 'student' || u.role === 'admin'
            );
          }
          // Admins can message everyone (no filter)
          
          const formattedUsers = filteredUsers.map((u: any) => ({
            ...u,
            username: `${u.firstname || ''} ${u.sirname || ''}`.trim() || u.email.split('@')[0],
          }));
          
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user?.role]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when user opens chat
  useEffect(() => {
    if (selectedUser) {
      markAsRead(selectedUser.id.toString());
    }
  }, [selectedUser, markAsRead]);

  // Focus input when chat is selected
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 0) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSelectUser = (selectedUser: any) => {
    setSelectedUser(selectedUser);
    getChatHistory(selectedUser.id.toString());
    markAsRead(selectedUser.id.toString());
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUser) return;

    sendMessage(
      selectedUser.id.toString(),
      messageInput,
      selectedUser.role
    );

    setMessageInput('');
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(selectedUser.id.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!selectedUser) return;

    // Start typing indicator
    startTyping(selectedUser.id.toString());

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedUser.id.toString());
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get messages for selected chat
  const currentChatMessages = selectedUser
    ? messages.filter(
        (msg) =>
          (msg.senderId === user?.id.toString() &&
            msg.receiverId === selectedUser.id.toString()) ||
          (msg.senderId === selectedUser.id.toString() &&
            msg.receiverId === user?.id.toString())
      )
    : [];

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Message status icon (WhatsApp style)
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
    <div className="flex h-full border rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Messages
            </h3>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                )}
              />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 && conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Select a user to start messaging</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No conversations match your search</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const online = isUserOnline(conv.userId);
              const unread = getUnreadCount(conv.userId);

              return (
                <div
                  key={conv.userId}
                  onClick={() => {
                    const user = users.find(
                      (u) => u.id.toString() === conv.userId
                    );
                    if (user) handleSelectUser(user);
                  }}
                  className={cn(
                    'p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors',
                    selectedUser?.id.toString() === conv.userId &&
                      'bg-blue-50 border-l-4 border-l-blue-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarFallback
                          className={cn(
                            'text-white font-semibold',
                            online ? 'bg-green-600' : 'bg-gray-600'
                          )}
                        >
                          {getInitials(conv.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white',
                          online ? 'bg-green-500' : 'bg-gray-400'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">
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
                      <p className="text-xs text-gray-500 capitalize mt-0.5">
                        {conv.role}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>

        {/* Available Users (if no conversations) */}
        {conversations.length === 0 && (
          <div className="border-t">
            <p className="text-xs font-semibold text-gray-600 p-3 bg-gray-100">
              Available Users
            </p>
            <ScrollArea className="h-64">
              {users.map((u) => {
                const online = isUserOnline(u.id.toString());
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="p-3 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback
                            className={cn(
                              'text-white text-sm',
                              online ? 'bg-green-600' : 'bg-gray-600'
                            )}
                          >
                            {getInitials(u.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                            online ? 'bg-green-500' : 'bg-gray-400'
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.username}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {u.role}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarFallback
                    className={cn(
                      'text-white',
                      isUserOnline(selectedUser.id.toString())
                        ? 'bg-green-600'
                        : 'bg-gray-600'
                    )}
                  >
                    {getInitials(selectedUser.username)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                    isUserOnline(selectedUser.id.toString())
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  )}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedUser.username}</h3>
                <p className="text-xs text-gray-500">
                  {isUserOnline(selectedUser.id.toString()) ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Circle className="h-2 w-2 fill-current" />
                      Online
                    </span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {selectedUser.role}
              </Badge>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              {currentChatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">
                      Start a conversation with {selectedUser.username}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentChatMessages.map((msg, index) => {
                    const isMine = msg.senderId === user?.id.toString();
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
                            isMine ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
                              isMine
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-800 rounded-bl-sm'
                            )}
                          >
                            <p className="text-sm break-words">{msg.message}</p>
                            <div
                              className={cn(
                                'flex items-center gap-1 mt-1',
                                isMine ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <span
                                className={cn(
                                  'text-xs',
                                  isMine ? 'text-blue-100' : 'text-gray-500'
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
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Typing Indicator */}
              {typingUsers.has(selectedUser.id.toString()) && (
                <div className="flex justify-start mt-4">
                  <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${selectedUser.username}...`}
                  className="flex-1"
                  disabled={!isConnected}
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
          <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
            <div className="text-center">
              <MessageSquare className="h-24 w-24 mx-auto mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-2">
                Choose a user from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
