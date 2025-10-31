import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { User } from '../types';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  senderName?: string;
  senderRole?: string;
  assignmentId?: string;
  assignmentTitle?: string;
  isRead?: boolean;
}

interface Conversation {
  userId: string;
  username: string;
  role: string;
  email: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isOnline?: boolean;
}

interface WebSocketContextType {
  socket: any | null;
  messages: Message[];
  conversations: Conversation[];
  onlineUsers: string[];
  sendMessage: (receiverId: string, message: string, assignmentId?: string) => void;
  markAsRead: (conversationUserId: string) => void;
  fetchConversations: () => void;
  fetchMessages: (userId: string) => void;
  isConnected: boolean;
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
  
  const [socket, setSocket] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const socketRef = useRef<any>(null);

  const connectWebSocket = () => {
    if (!user?.id) return;

    try {
      console.log('🔌 Connecting to Socket.IO...');
      
      // Use Socket.IO client
      const io = require('socket.io-client');
      const ws = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      
      socketRef.current = ws;

      ws.on('connect', () => {
        console.log('✅ Socket.IO connected:', ws.id);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send user join event
        ws.emit('user_join', {
          userId: user.id,
          username: user.name || 'Unknown',
          role: user.role || 'student',
          email: user.email || ''
        });
      });

      // Receive message
      ws.on('receive_message', (data: any) => {
        console.log('📨 Received message:', data);
        
        const newMessage: Message = {
          id: data.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
          timestamp: new Date(data.timestamp),
          senderName: data.senderName,
          senderRole: data.senderRole,
          assignmentId: data.assignmentId,
          isRead: data.isRead || false
        };

        setMessages(prev => [...prev, newMessage]);
        
        // Update conversation with new message
        setConversations(prev => prev.map(conv => 
          conv.userId === data.senderId 
            ? { 
                ...conv, 
                lastMessage: data.message,
                lastMessageTime: new Date(data.timestamp),
                unreadCount: (conv.unreadCount || 0) + 1
              }
            : conv
        ));
      });

      // Message sent confirmation
      ws.on('message_sent', (data: any) => {
        console.log('✅ Message sent:', data);
        
        const newMessage: Message = {
          id: data.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
          timestamp: new Date(data.timestamp),
          senderName: data.senderName,
          senderRole: data.senderRole,
          assignmentId: data.assignmentId,
          isRead: data.isRead || false
        };

        // Avoid duplicates
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
        
        // Update conversation
        setConversations(prev => prev.map(conv => 
          conv.userId === data.receiverId 
            ? { 
                ...conv, 
                lastMessage: data.message,
                lastMessageTime: new Date(data.timestamp)
              }
            : conv
        ));
      });

      // User online
      ws.on('user_online', (data: any) => {
        console.log('🟢 User online:', data.username);
        setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
        setConversations(prev => prev.map(conv => 
          conv.userId === data.userId ? { ...conv, isOnline: true } : conv
        ));
      });

      // User offline
      ws.on('user_offline', (data: any) => {
        console.log('🔴 User offline:', data.username);
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        setConversations(prev => prev.map(conv => 
          conv.userId === data.userId ? { ...conv, isOnline: false } : conv
        ));
      });

      // Online users list
      ws.on('online_users', (users: any[]) => {
        console.log('👥 Online users:', users.length);
        const userIds = users.map(u => u.userId);
        setOnlineUsers(userIds);
        setConversations(prev => prev.map(conv => ({
          ...conv,
          isOnline: userIds.includes(conv.userId)
        })));
      });

      // Chat history
      ws.on('chat_history', (history: any[]) => {
        console.log('📜 Chat history loaded:', history.length, 'messages');
        
        const formattedMessages = history.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          message: msg.message,
          timestamp: new Date(msg.timestamp),
          senderName: msg.sender_name,
          senderRole: msg.sender_role,
          assignmentId: msg.assignment_id,
          isRead: msg.is_read || false
        }));
        
        setMessages(formattedMessages);
      });

      // Disconnect
      ws.on('disconnect', (reason: string) => {
        console.log('❌ Socket.IO disconnected:', reason);
        setIsConnected(false);
      });

      // Errors
      ws.on('error', (error: any) => {
        console.error('⚠️ Socket.IO error:', error);
      });

      setSocket(ws);
    } catch (error) {
      console.error('❌ Failed to connect Socket.IO:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      connectWebSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        console.log('🔌 Disconnecting socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  const sendMessage = (receiverId: string, message: string, assignmentId?: string) => {
    if (socketRef.current && isConnected && user) {
      console.log('📤 Sending message to:', receiverId);
      
      socketRef.current.emit('send_message', {
        senderId: user.id,
        receiverId,
        message,
        senderRole: user.role || 'student',
        receiverRole: conversations.find(c => c.userId === receiverId)?.role,
        assignmentId
      });
    } else {
      console.warn('⚠️ Cannot send message: Socket not connected');
    }
  };

  const markAsRead = (conversationUserId: string) => {
    if (socketRef.current && isConnected) {
      console.log('✅ Marking messages as read:', conversationUserId);
      
      socketRef.current.emit('mark_as_read', {
        conversationUserId
      });
    }
    
    // Update local state
    setConversations(prev => prev.map(conv => 
      conv.userId === conversationUserId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const fetchConversations = async () => {
    if (!user?.id) return;
    
    try {
      console.log('📋 Fetching conversations...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/websocketschat/conversations/${user.id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Conversations loaded:', data.conversations.length);
        
        setConversations(data.conversations.map((conv: any) => ({
          ...conv,
          lastMessageTime: conv.lastMessageTime ? new Date(conv.lastMessageTime) : undefined,
          isOnline: onlineUsers.includes(conv.userId)
        })));
      } else {
        console.error('❌ Failed to load conversations:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
    }
  };

  const fetchMessages = (userId: string) => {
    if (socketRef.current && isConnected && user?.id) {
      console.log('📨 Fetching messages with:', userId);
      
      socketRef.current.emit('get_chat_history', {
        userId: user.id,
        otherUserId: userId
      });
    } else {
      console.warn('⚠️ Cannot fetch messages: Socket not connected');
    }
  };

  return (
    <WebSocketContext.Provider value={{
      socket,
      messages,
      conversations,
      onlineUsers,
      sendMessage,
      markAsRead,
      fetchConversations,
      fetchMessages,
      isConnected
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};