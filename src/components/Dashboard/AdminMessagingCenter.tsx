// import React, { useState, useEffect, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { 
//   MessageSquare, 
//   Send, 
//   Search, 
//   Users, 
//   FileText,
//   Clock,
//   CheckCircle2,
//   Circle,
//   X,
//   Shield,
//   GraduationCap
// } from 'lucide-react';
// import { useWebSocket } from '../../contexts/WebSocketContext';
// import { useAuth } from '../../contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';

// export default function AdminMessagingCenter() {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const {
//     conversations,
//     messages,
//     onlineUsers,
//     sendMessage,
//     markAsRead,
//     fetchConversations,
//     fetchMessages,
//     isConnected
//   } = useWebSocket();

//   const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
//   const [messageInput, setMessageInput] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
//   const [availableUsers, setAvailableUsers] = useState<any[]>([]);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (user?.id) {
//       fetchConversations();
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     fetchAvailableUsers();
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const fetchAvailableUsers = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/users/getallusers');
//       const data = await response.json();
      
//       if (data.success) {
//         const users = data.users.filter((u: any) => u.id?.toString() !== user?.id);
//         setAvailableUsers(users.map((userItem: any) => ({
//           ...userItem,
//           username: `${userItem.firstname || ''} ${userItem.sirname || ''}`.trim() || userItem.email.split('@')[0],
//           isOnline: onlineUsers.includes(userItem.id?.toString())
//         })));
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSendMessage = () => {
//     if (!messageInput.trim() || !selectedConversation) return;

//     sendMessage(selectedConversation, messageInput);
//     setMessageInput('');
//   };

//   const handleSelectConversation = (userId: string) => {
//     setSelectedConversation(userId);
//     fetchMessages(userId);
//     markAsRead(userId);
//   };

//   const handleStartNewConversation = (userId: string) => {
//     setSelectedConversation(userId);
//     fetchMessages(userId);
//     setIsNewMessageOpen(false);
//   };

//   const getInitials = (name: string) => {
//     return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
//   };

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString('en-US', { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: true 
//     });
//   };

//   const formatDate = (date: Date) => {
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     if (date.toDateString() === today.toDateString()) {
//       return 'Today';
//     } else if (date.toDateString() === yesterday.toDateString()) {
//       return 'Yesterday';
//     } else {
//       return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//     }
//   };

//   const filteredConversations = conversations.filter(conv =>
//     conv.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     conv.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const selectedConversationData = conversations.find(c => c.userId === selectedConversation);
//   const conversationMessages = messages.filter(m => 
//     (m.senderId === selectedConversation && m.receiverId === user?.id) ||
//     (m.senderId === user?.id && m.receiverId === selectedConversation)
//   );

//   const getRoleIcon = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return <Shield className="h-3 w-3" />;
//       case 'teacher':
//         return <GraduationCap className="h-3 w-3" />;
//       default:
//         return <Users className="h-3 w-3" />;
//     }
//   };

//   const getRoleColor = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-red-600';
//       case 'teacher':
//         return 'bg-green-600';
//       default:
//         return 'bg-blue-600';
//     }
//   };

//   return (
//     <div className="h-[600px] border rounded-lg bg-white shadow-sm">
//       <div className="flex h-full">
//         {/* Conversations List */}
//         <div className="w-1/3 border-r flex flex-col">
//           <div className="p-4 border-b">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-semibold text-lg">Admin Messages</h3>
//               <div className="flex items-center gap-2">
//                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//                 <Button
//                   size="sm"
//                   onClick={() => setIsNewMessageOpen(true)}
//                   className="bg-red-600 hover:bg-red-700"
//                 >
//                   <MessageSquare className="h-4 w-4 mr-1" />
//                   New
//                 </Button>
//               </div>
//             </div>
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search conversations..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>
          
//           <ScrollArea className="flex-1">
//             {filteredConversations.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">
//                 <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
//                 <p className="text-sm">No conversations yet</p>
//                 <p className="text-xs">Start messaging with users</p>
//               </div>
//             ) : (
//               filteredConversations.map((conversation) => (
//                 <div
//                   key={conversation.userId}
//                   onClick={() => handleSelectConversation(conversation.userId)}
//                   className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
//                     selectedConversation === conversation.userId ? 'bg-red-50 border-red-200' : ''
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="relative">
//                       <Avatar className="h-10 w-10">
//                         <AvatarFallback className={`text-white ${getRoleColor(conversation.role)}`}>
//                           {getInitials(conversation.username)}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
//                         conversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
//                       }`} />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between">
//                         <p className="font-medium text-sm truncate">{conversation.username}</p>
//                         {conversation.unreadCount && conversation.unreadCount > 0 && (
//                           <Badge className="bg-red-600 text-xs px-1.5 py-0.5">
//                             {conversation.unreadCount}
//                           </Badge>
//                         )}
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <p className="text-xs text-gray-600 truncate">
//                           {conversation.lastMessage || 'No messages yet'}
//                         </p>
//                         {conversation.lastMessageTime && (
//                           <p className="text-xs text-gray-400">
//                             {formatDate(conversation.lastMessageTime)}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-1 mt-1">
//                         {getRoleIcon(conversation.role)}
//                         <Badge variant="outline" className={`text-xs ${
//                           conversation.role === 'teacher' ? 'text-green-700 border-green-300' :
//                           conversation.role === 'student' ? 'text-blue-700 border-blue-300' :
//                           'text-red-700 border-red-300'
//                         }`}>
//                           {conversation.role}
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </ScrollArea>
//         </div>

//         {/* Chat Area */}
//         <div className="flex-1 flex flex-col">
//           {selectedConversation ? (
//             <>
//               {/* Chat Header */}
//               <div className="p-4 border-b bg-gray-50">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <Avatar className="h-10 w-10">
//                       <AvatarFallback className={`text-white ${getRoleColor(selectedConversationData?.role || 'student')}`}>
//                         {selectedConversationData && getInitials(selectedConversationData.username)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="font-medium">{selectedConversationData?.username}</p>
//                       <div className="flex items-center gap-2">
//                         <div className={`w-2 h-2 rounded-full ${
//                           selectedConversationData?.isOnline ? 'bg-green-500' : 'bg-gray-400'
//                         }`} />
//                         <p className="text-xs text-gray-600">
//                           {selectedConversationData?.isOnline ? 'Online' : 'Offline'}
//                         </p>
//                         <div className="flex items-center gap-1">
//                           {selectedConversationData && getRoleIcon(selectedConversationData.role)}
//                           <Badge variant="outline" className="text-xs">
//                             {selectedConversationData?.role}
//                           </Badge>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <Badge className="bg-red-600">
//                     Admin Chat
//                   </Badge>
//                 </div>
//               </div>

//               {/* Messages */}
//               <ScrollArea className="flex-1 p-4">
//                 <div className="space-y-4">
//                   {conversationMessages.map((message) => (
//                     <div
//                       key={message.id}
//                       className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
//                     >
//                       <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                         message.senderId === user?.id
//                           ? 'bg-red-600 text-white'
//                           : 'bg-gray-100 text-gray-900'
//                       }`}>
//                         {message.assignmentTitle && (
//                           <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
//                             <FileText className="h-3 w-3" />
//                             Re: {message.assignmentTitle}
//                           </div>
//                         )}
//                         <p className="text-sm">{message.message}</p>
//                         <div className="flex items-center justify-between mt-1">
//                           <p className="text-xs opacity-75">
//                             {formatTime(message.timestamp)}
//                           </p>
//                           {message.senderId === user?.id && (
//                             <div className="ml-2">
//                               {message.isRead ? (
//                                 <CheckCircle2 className="h-3 w-3 opacity-75" />
//                               ) : (
//                                 <Circle className="h-3 w-3 opacity-75" />
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   <div ref={messagesEndRef} />
//                 </div>
//               </ScrollArea>

//               {/* Message Input */}
//               <div className="p-4 border-t">
//                 <div className="flex gap-2">
//                   <Input
//                     value={messageInput}
//                     onChange={(e) => setMessageInput(e.target.value)}
//                     placeholder="Type your message..."
//                     onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                     className="flex-1"
//                   />
//                   <Button 
//                     onClick={handleSendMessage}
//                     disabled={!messageInput.trim()}
//                     className="bg-red-600 hover:bg-red-700"
//                   >
//                     <Send className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center text-gray-500">
//               <div className="text-center">
//                 <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//                 <p className="text-lg font-medium">Select a conversation</p>
//                 <p className="text-sm">Choose a conversation to start messaging</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* New Message Dialog */}
//       <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Start New Conversation</DialogTitle>
//           </DialogHeader>
//           <Tabs defaultValue="all" className="w-full">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="all">All Users</TabsTrigger>
//               <TabsTrigger value="teachers">Teachers</TabsTrigger>
//               <TabsTrigger value="students">Students</TabsTrigger>
//             </TabsList>
            
//             <TabsContent value="all" className="space-y-4">
//               <ScrollArea className="h-64">
//                 {availableUsers.map((userItem) => (
//                   <div
//                     key={userItem.id}
//                     onClick={() => handleStartNewConversation(userItem.id.toString())}
//                     className="flex items-center justify-between p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="relative">
//                         <Avatar className="h-10 w-10">
//                           <AvatarFallback className={`text-white ${getRoleColor(userItem.role)}`}>
//                             {getInitials(userItem.username)}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
//                           userItem.isOnline ? 'bg-green-500' : 'bg-gray-400'
//                         }`} />
//                       </div>
//                       <div>
//                         <p className="font-medium">{userItem.username}</p>
//                         <p className="text-sm text-gray-600">{userItem.email}</p>
//                         {userItem.class_name && (
//                           <p className="text-xs text-gray-500">{userItem.class_name}</p>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="flex items-center gap-1">
//                         {getRoleIcon(userItem.role)}
//                         <Badge variant="outline" className={
//                           userItem.role === 'teacher' ? 'text-green-700 border-green-300' :
//                           userItem.role === 'student' ? 'text-blue-700 border-blue-300' :
//                           'text-red-700 border-red-300'
//                         }>
//                           {userItem.role}
//                         </Badge>
//                       </div>
//                       <Badge variant={userItem.isOnline ? "default" : "secondary"} className={userItem.isOnline ? "bg-green-600" : ""}>
//                         {userItem.isOnline ? "Online" : "Offline"}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//               </ScrollArea>
//             </TabsContent>
            
//             <TabsContent value="teachers" className="space-y-4">
//               <ScrollArea className="h-64">
//                 {availableUsers.filter(u => u.role === 'teacher').map((teacher) => (
//                   <div
//                     key={teacher.id}
//                     onClick={() => handleStartNewConversation(teacher.id.toString())}
//                     className="flex items-center justify-between p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="relative">
//                         <Avatar className="h-10 w-10">
//                           <AvatarFallback className="text-white bg-green-600">
//                             {getInitials(teacher.username)}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
//                           teacher.isOnline ? 'bg-green-500' : 'bg-gray-400'
//                         }`} />
//                       </div>
//                       <div>
//                         <p className="font-medium">{teacher.username}</p>
//                         <p className="text-sm text-gray-600">{teacher.email}</p>
//                       </div>
//                     </div>
//                     <Badge variant={teacher.isOnline ? "default" : "secondary"} className={teacher.isOnline ? "bg-green-600" : ""}>
//                       {teacher.isOnline ? "Online" : "Offline"}
//                     </Badge>
//                   </div>
//                 ))}
//               </ScrollArea>
//             </TabsContent>
            
//             <TabsContent value="students" className="space-y-4">
//               <ScrollArea className="h-64">
//                 {availableUsers.filter(u => u.role === 'student').map((student) => (
//                   <div
//                     key={student.id}
//                     onClick={() => handleStartNewConversation(student.id.toString())}
//                     className="flex items-center justify-between p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="relative">
//                         <Avatar className="h-10 w-10">
//                           <AvatarFallback className="text-white bg-blue-600">
//                             {getInitials(student.username)}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
//                           student.isOnline ? 'bg-green-500' : 'bg-gray-400'
//                         }`} />
//                       </div>
//                       <div>
//                         <p className="font-medium">{student.username}</p>
//                         <p className="text-sm text-gray-600">{student.email}</p>
//                         {student.class_name && (
//                           <p className="text-xs text-gray-500">{student.class_name}</p>
//                         )}
//                       </div>
//                     </div>
//                     <Badge variant={student.isOnline ? "default" : "secondary"} className={student.isOnline ? "bg-green-600" : ""}>
//                       {student.isOnline ? "Online" : "Offline"}
//                     </Badge>
//                   </div>
//                 ))}
//               </ScrollArea>
//             </TabsContent>
//           </Tabs>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }