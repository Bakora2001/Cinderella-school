import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Bot,
  User,
  Loader2,
  Sparkles,
  Send,
  Trash2,
  BarChart3,
  X
} from 'lucide-react';

interface AITutorChatProps {
  user: {
    id: string | number;
    name?: string;
    firstname?: string;
    sirname?: string;
    email?: string;
    class?: string;
  };
  toast: any;
}

const AITutorChat: React.FC<AITutorChatProps> = ({ user, toast }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && user?.id) {
      // Add delay to ensure token is ready
      const timer = setTimeout(() => {
        loadChatHistory();
        loadChatStats();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, user?.id]);

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token available yet');
        return;
      }
      
      const studentId = user.id;
      const response = await fetch(`http://localhost:5000/api/chatbot/history/${studentId}?limit=20`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          console.error('Authentication failed - token may be invalid');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.history) {
        const formattedMessages = data.history.flatMap((item: any) => [
          { 
            id: `user-${item.id}`, 
            text: item.user_message, 
            sender: 'user', 
            timestamp: new Date(item.created_at) 
          },
          { 
            id: `ai-${item.id}`, 
            text: item.ai_response, 
            sender: 'ai', 
            timestamp: new Date(item.created_at) 
          }
        ]);
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Don't show error to user, just log it
    }
  };

  const loadChatStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const studentId = user.id;
      const response = await fetch(`http://localhost:5000/api/chatbot/stats/${studentId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const studentId = user.id;
      const response = await fetch('http://localhost:5000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          studentId: studentId,
          conversationHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'ai',
          timestamp: new Date(),
          model: data.model
        };
        setMessages(prev => [...prev, aiMessage]);
        loadChatStats();
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const studentId = user.id;
      const response = await fetch(`http://localhost:5000/api/chatbot/history/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setMessages([]);
        setStats(null);
        toast({
          title: "Success",
          description: "Chat history cleared successfully",
        });
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getUserName = () => {
    return user?.name || user?.firstname || 'Student';
  };

  return (
    <>
      {/* Floating Button with Curved Text */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Curved Text Around Button */}
          <div className="absolute inset-0 w-32 h-32 -translate-x-8 -translate-y-8">
            <svg className="w-full h-full animate-spin" style={{ animationDuration: '20s' }}>
              <defs>
                <path
                  id="circle-path"
                  d="M 64,64 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
                />
              </defs>
              <text className="text-xs font-bold fill-black">
                <textPath href="#circle-path" startOffset="0%">
                  NC AI Assignment Helper • NC AI Assignment Helper • 
                </textPath>
              </text>
            </svg>
          </div>
          
          {/* Main Button */}
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full shadow-2xl bg-black hover:bg-gray-800 border-2 border-white relative z-10"
            size="icon"
          >
            <MessageSquare className="h-8 w-8 text-white" />
            <span className="absolute -top-1 -right-1 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-gray-600 items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
            </span>
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[500px] p-0 gap-0 bg-white border-4 border-black">
          <DialogHeader className="p-5 pb-4 border-b border-gray-300 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-black">
                    <AvatarFallback className="bg-black text-white">
                      <Bot className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-black">
                    New Cinderella AI Assignment Helper
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    Hello {getUserName()}! Ask me anything about your assignments and studies!
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stats && (
                  <Badge variant="outline" className="bg-white border-gray-400 text-gray-700">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    {stats.total_messages} messages
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearHistory}
                  className="hover:bg-gray-100 hover:text-gray-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gray-100 rounded-full p-6 mb-4 border-2 border-black">
                  <Sparkles className="h-12 w-12 text-black" />
                </div>
                <h3 className="text-2xl font-semibold text-black mb-3">
                  👋 Hello {getUserName()}!
                </h3>
                <p className="text-gray-700 max-w-lg mb-8 text-lg">
                  I'm your NC AI Assignment Helper. I can help you understand your assignments, 
                  explain concepts, and guide you through your studies. What would you like to learn about today?
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                  <Button 
                    variant="outline" 
                    className="text-left justify-start border-black hover:bg-gray-100 hover:border-gray-600 h-16 text-base" 
                    onClick={() => setInputMessage("Can you explain how to solve quadratic equations?")}
                  >
                    📐 Math Help
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-left justify-start border-black hover:bg-gray-100 hover:border-gray-600 h-16 text-base" 
                    onClick={() => setInputMessage("What's the difference between photosynthesis and respiration?")}
                  >
                    🧪 Science Questions
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-left justify-start border-black hover:bg-gray-100 hover:border-gray-600 h-16 text-base" 
                    onClick={() => setInputMessage("How do I write a good essay?")}
                  >
                    ✍️ Writing Tips
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-left justify-start border-black hover:bg-gray-100 hover:border-gray-600 h-16 text-base" 
                    onClick={() => setInputMessage("Can you help me with my assignment?")}
                  >
                    📚 Assignment Help
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.sender === 'ai' && (
                      <Avatar className="h-10 w-10 border-2 border-gray-400">
                        <AvatarFallback className="bg-black text-white">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-5 py-4 ${
                      message.sender === 'user'
                        ? 'bg-black text-white'
                        : message.isError
                        ? 'bg-gray-100 border-2 border-gray-300 text-gray-800'
                        : 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                    }`}>
                      <p className="text-base whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      <div className={`flex items-center gap-2 mt-2 text-sm ${
                        message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.model && (
                          <Badge variant="outline" className="text-xs h-5 px-2 bg-white/20 border-white/30">
                            {message.model}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="h-10 w-10 border-2 border-gray-400">
                        <AvatarFallback className="bg-gray-600 text-white">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <Avatar className="h-10 w-10 border-2 border-gray-400">
                      <AvatarFallback className="bg-black text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-2xl px-5 py-4 border-2 border-gray-300">
                      <div className="flex gap-1 text-black">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce" style={{animationDelay: '0.1s'}}>●</span>
                        <span className="animate-bounce" style={{animationDelay: '0.2s'}}>●</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-6 border-t border-gray-300 bg-white">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  className="min-h-[60px] py-4 px-5 text-base rounded-xl border-2 border-gray-400 focus:border-black focus:ring-black resize-none"
                  disabled={isLoading}
                  style={{ 
                    minHeight: '60px',
                    lineHeight: '1.5'
                  }}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="h-[60px] px-8 bg-black hover:bg-gray-800 border-2 border-black rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Send className="h-6 w-6" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              💡 Tip: Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AITutorChat;