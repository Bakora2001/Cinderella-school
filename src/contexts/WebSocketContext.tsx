import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client'; 
import { useAuth } from './AuthContext';

// Use ReturnType to get the Socket type from io function
type SocketIO = ReturnType<typeof io>;

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  message: string;
  senderRole: string;
  senderName: string;
  receiverRole: string;
  assignmentId?: number;
  timestamp: Date;
  isRead: boolean;
  status?: 'sent' | 'delivered' | 'read'; // WhatsApp-style status
}

interface OnlineUser {
  userId: string;
  username: string;
  role: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface Conversation {
  userId: string;
  username: string;
  role: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: Date;
}

interface WebSocketContextType {
  socket: SocketIO | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  messages: Message[];
  conversations: Conversation[];
  typingUsers: Map<string, boolean>;
  sendMessage: (receiverId: string, message: string, receiverRole: string, assignmentId?: number) => void;
  getChatHistory: (otherUserId: string) => void;
  markAsRead: (conversationUserId: string) => void;
  startTyping: (receiverId: string) => void;
  stopTyping: (receiverId: string) => void;
  clearMessages: () => void;
  getUnreadCount: (userId: string) => number;
  isUserOnline: (userId: string) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<SocketIO | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const socketRef = useRef<SocketIO | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const messageSeenTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Helper function to check if user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.some(u => u.userId === userId && u.isOnline);
  }, [onlineUsers]);

  // Helper function to get unread count for a specific user
  const getUnreadCount = useCallback((userId: string): number => {
    const conversation = conversations.find(c => c.userId === userId);
    return conversation?.unreadCount || 0;
  }, [conversations]);

  // Update conversations when messages or online users change
  useEffect(() => {
    if (!user?.id) return;

    const conversationMap = new Map<string, Conversation>();

    messages.forEach((message) => {
      const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
      const otherUserName = message.senderId === user.id ? 'User' : message.senderName;
      const otherUserRole = message.senderId === user.id ? message.receiverRole : message.senderRole;

      const existing = conversationMap.get(otherUserId);
      const isUnread = message.receiverId === user.id && !message.isRead;

      if (!existing || new Date(message.timestamp) > new Date(existing.timestamp)) {
        const onlineUser = onlineUsers.find(u => u.userId === otherUserId);
        
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          username: otherUserName,
          role: otherUserRole,
          lastMessage: message.message,
          timestamp: message.timestamp,
          unreadCount: existing 
            ? (isUnread ? existing.unreadCount + 1 : existing.unreadCount)
            : (isUnread ? 1 : 0),
          isOnline: onlineUser?.isOnline || false,
          lastSeen: onlineUser?.lastSeen,
        });
      } else if (isUnread && existing) {
        existing.unreadCount += 1;
      }
    });

    setConversations(Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, [messages, user?.id, onlineUsers]);

  // Initialize socket connection
  useEffect(() => {
    if (!user?.id) {
      console.log('❌ No user ID, skipping socket connection');
      return;
    }

    console.log('🔌 Initializing WebSocket connection for user:', user.id);

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: maxReconnectAttempts,
      timeout: 10000,
      autoConnect: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Join the chat with user data
      newSocket.emit('user_join', {
        userId: user.id,
        username: user.name || user.email.split('@')[0],
        role: user.role,
        email: user.email,
      });

      console.log('📤 Sent user_join event:', {
        userId: user.id,
        username: user.name || user.email.split('@')[0],
        role: user.role,
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('⚠️ WebSocket connection error:', error);
      setIsConnected(false);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    // Online users events
    newSocket.on('online_users', (users: OnlineUser[]) => {
      console.log('👥 Received online users:', users);
      setOnlineUsers(users.map(u => ({
        ...u,
        isOnline: true,
        lastSeen: u.lastSeen ? new Date(u.lastSeen) : undefined
      })));
    });

    newSocket.on('user_online', (userData: OnlineUser) => {
      console.log('✅ User came online:', userData);
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== userData.userId);
        return [...filtered, { ...userData, isOnline: true }];
      });
    });

    newSocket.on('user_offline', (userData: OnlineUser) => {
      console.log('❌ User went offline:', userData);
      setOnlineUsers(prev => prev.map(u => 
        u.userId === userData.userId 
          ? { ...u, isOnline: false, lastSeen: new Date() }
          : u
      ));
    });

    // Message events - REAL-TIME UPDATES
    newSocket.on('receive_message', (message: Message) => {
      console.log('📨 Real-time message received:', message);
      
      // Add message with proper formatting
      const formattedMessage = {
        ...message,
        timestamp: new Date(message.timestamp),
        status: 'delivered' as const,
      };
      
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(m => m.id === formattedMessage.id);
        if (exists) return prev;
        return [...prev, formattedMessage];
      });

      // Auto-mark as read after 2 seconds if the chat is open
      if (message.receiverId === user.id) {
        const timeoutId = setTimeout(() => {
          newSocket.emit('mark_as_read', {
            conversationUserId: message.senderId,
          });
          
          // Update message status to read
          setMessages(prev => prev.map(m => 
            m.id === message.id ? { ...m, isRead: true, status: 'read' } : m
          ));
        }, 2000);
        
        messageSeenTimeoutRef.current.set(message.id, timeoutId);
      }

      // Play notification sound (optional)
      if (message.receiverId === user.id) {
        playNotificationSound();
      }
    });

    newSocket.on('message_sent', (message: Message) => {
      console.log('✅ Message sent confirmation:', message);
      
      const formattedMessage = {
        ...message,
        timestamp: new Date(message.timestamp),
        status: 'sent' as const,
      };
      
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(m => m.id === formattedMessage.id);
        if (exists) {
          // Update existing message
          return prev.map(m => m.id === formattedMessage.id ? formattedMessage : m);
        }
        return [...prev, formattedMessage];
      });
    });

    newSocket.on('chat_history', (history: Message[]) => {
      console.log('📜 Chat history received:', history.length, 'messages');
      const formattedHistory = history.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        status: msg.isRead ? 'read' : 'delivered' as const,
      }));
    
    });

    // Message status updates - WhatsApp-style
    newSocket.on('message_read', (data: { messageId: number; readAt: Date }) => {
      console.log('👁️ Message read:', data);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, isRead: true, status: 'read' }
          : msg
      ));
    });

    newSocket.on('message_delivered', (data: { messageId: number }) => {
      console.log('📬 Message delivered:', data);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, status: 'delivered' }
          : msg
      ));
    });

    // Typing events
    newSocket.on('user_typing', (data: TypingUser) => {
      console.log(`⌨️ ${data.username} is ${data.isTyping ? 'typing' : 'stopped typing'}`);
      setTypingUsers(prev => {
        const updated = new Map(prev);
        if (data.isTyping) {
          updated.set(data.userId, true);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('⚠️ Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      
      // Clear all message seen timeouts
      messageSeenTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      messageSeenTimeoutRef.current.clear();
      
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('online_users');
      newSocket.off('user_online');
      newSocket.off('user_offline');
      newSocket.off('receive_message');
      newSocket.off('message_sent');
      newSocket.off('chat_history');
      newSocket.off('message_read');
      newSocket.off('message_delivered');
      newSocket.off('user_typing');
      newSocket.off('error');
      newSocket.close();
      socketRef.current = null;
    };
  }, [user?.id, user?.email, user?.name, user?.role]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); // Add a notification sound file to your public folder
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound error:', error);
    }
  };

  // Send message function
  const sendMessage = useCallback((receiverId: string, message: string, receiverRole: string, assignmentId?: number) => {
    if (!socketRef.current || !user) {
      console.error('❌ Cannot send message: Socket not connected or user not available');
      return;
    }

    if (!message.trim()) {
      console.error('❌ Cannot send empty message');
      return;
    }

    console.log('📤 Sending message to:', receiverId, 'Message:', message);

    socketRef.current.emit('send_message', {
      senderId: user.id,
      receiverId,
      message: message.trim(),
      senderRole: user.role,
      receiverRole,
      assignmentId,
    });
  }, [user]);

  // Get chat history
  const getChatHistory = useCallback((otherUserId: string) => {
    if (!socketRef.current || !user) {
      console.error('❌ Cannot get chat history: Socket not connected or user not available');
      return;
    }

    console.log('📜 Requesting chat history with:', otherUserId);
    setMessages([]); // Clear existing messages
    
    socketRef.current.emit('get_chat_history', {
      userId: user.id,
      otherUserId,
    });
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback((conversationUserId: string) => {
    if (!socketRef.current || !user) {
      console.error('❌ Cannot mark as read: Socket not connected or user not available');
      return;
    }

    console.log('✅ Marking messages as read from:', conversationUserId);

    socketRef.current.emit('mark_as_read', {
      conversationUserId,
    });

    // Update local state immediately
    setMessages(prev => prev.map(msg => 
      msg.senderId === conversationUserId && msg.receiverId === user.id
        ? { ...msg, isRead: true, status: 'read' }
        : msg
    ));

    // Update conversations to clear unread count
    setConversations(prev => 
      prev.map(conv => 
        conv.userId === conversationUserId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  }, [user]);

  // Typing indicators
  const startTyping = useCallback((receiverId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing_start', { receiverId });
  }, []);

  const stopTyping = useCallback((receiverId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing_stop', { receiverId });
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    messages,
    conversations,
    typingUsers,
    sendMessage,
    getChatHistory,
    markAsRead,
    startTyping,
    stopTyping,
    clearMessages,
    getUnreadCount,
    isUserOnline,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
