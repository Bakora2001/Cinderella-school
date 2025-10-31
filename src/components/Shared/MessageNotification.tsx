import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, X, User } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';

export default function MessageNotification() {
  const { user } = useAuth();
  const { conversations } = useWebSocket();
  const [showNotification, setShowNotification] = useState(false);
  const [lastNotification, setLastNotification] = useState<any>(null);

  useEffect(() => {
    // Check for unread messages
    const unreadConversations = conversations.filter(c => c.unreadCount && c.unreadCount > 0);
    
    if (unreadConversations.length > 0) {
      const latestUnread = unreadConversations.reduce((latest, current) => 
        !latest || (current.lastMessageTime && latest.lastMessageTime && 
        current.lastMessageTime > latest.lastMessageTime) ? current : latest
      );
      
      if (latestUnread && (!lastNotification || latestUnread.userId !== lastNotification.userId)) {
        setLastNotification(latestUnread);
        setShowNotification(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    }
  }, [conversations, lastNotification]);

  const totalUnread = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

  if (!showNotification || !lastNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Card className="w-80 shadow-lg border-l-4 border-l-blue-600">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">New Message</p>
                <p className="text-sm text-gray-600">
                  From {lastNotification.username}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {lastNotification.lastMessage}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowNotification(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {totalUnread > 1 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-500">
                +{totalUnread - 1} more unread message{totalUnread - 1 > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}