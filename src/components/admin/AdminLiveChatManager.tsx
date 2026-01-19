import React, { useState, useEffect } from 'react';
import { X, MessageCircle, User, Clock, Send, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface UserChat {
  userId: string;
  userName: string;
  userRole: string;
  userIc: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: ChatMessage[];
  isOnline: boolean;
}

interface AdminLiveChatManagerProps {
  onClose: () => void;
}

const AdminLiveChatManager: React.FC<AdminLiveChatManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [userChats, setUserChats] = useState<UserChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    loadUserChats();
    const interval = setInterval(loadUserChats, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadUserChats = () => {
    const allUsers = JSON.parse(localStorage.getItem('kvpass_all_users') || '[]');
    const chatData: UserChat[] = [];

    allUsers.forEach((userData: any) => {
      if (userData.role !== 'admin') {
        const userChatKey = `kvpass_live_chat_${userData.id}`;
        const messages = JSON.parse(localStorage.getItem(userChatKey) || '[]');
        
        if (messages.length > 0) {
          const chatMessages = messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          const userMessages = chatMessages.filter((msg: any) => msg.sender === 'user');
          const lastUserMessage = userMessages[userMessages.length - 1];
          
          if (lastUserMessage) {
            const unreadCount = userMessages.filter((msg: any) => !msg.read).length;
            
            chatData.push({
              userId: userData.id,
              userName: userData.name,
              userRole: userData.role,
              userIc: userData.icNumber,
              lastMessage: lastUserMessage.message,
              lastMessageTime: lastUserMessage.timestamp,
              unreadCount,
              messages: chatMessages,
              isOnline: isUserOnline(userData.id)
            });
          }
        }
      }
    });

    // Sort by last message time (newest first)
    chatData.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    setUserChats(chatData);
  };

  const isUserOnline = (userId: string): boolean => {
    // Simple online detection - check if user has sent message in last 5 minutes
    const userChatKey = `kvpass_live_chat_${userId}`;
    const messages = JSON.parse(localStorage.getItem(userChatKey) || '[]');
    
    if (messages.length === 0) return false;
    
    const lastMessage = messages[messages.length - 1];
    const lastMessageTime = new Date(lastMessage.timestamp);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return lastMessageTime > fiveMinutesAgo;
  };

  const handleReply = async (userId: string) => {
    if (!replyMessage.trim()) return;

    setIsReplying(true);

    const userChatKey = `kvpass_live_chat_${userId}`;
    const existingMessages = JSON.parse(localStorage.getItem(userChatKey) || '[]');
    
    const adminReply = {
      id: Date.now().toString(),
      sender: 'admin',
      message: replyMessage,
      timestamp: new Date(),
      read: false
    };

    const updatedMessages = [...existingMessages, adminReply];
    localStorage.setItem(userChatKey, JSON.stringify(updatedMessages));

    // Mark user messages as read
    const readMessages = updatedMessages.map((msg: any) => ({
      ...msg,
      read: msg.sender === 'user' ? true : msg.read
    }));
    localStorage.setItem(userChatKey, JSON.stringify(readMessages));

    // Clear admin notification for this user
    const adminNotifications = JSON.parse(localStorage.getItem('kvpass_admin_chat_notifications') || '{}');
    delete adminNotifications[userId];
    localStorage.setItem('kvpass_admin_chat_notifications', JSON.stringify(adminNotifications));

    setReplyMessage('');
    setIsReplying(false);
    loadUserChats(); // Refresh the chat list
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'student': return 'Pelajar';
      case 'hep': return 'Ketua HEP';
      case 'warden': return 'Ketua Warden';
      case 'security': return 'Pengawal Keselamatan';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'hep': return 'bg-green-100 text-green-800';
      case 'warden': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedChatData = selectedChat ? userChats.find(chat => chat.userId === selectedChat) : null;
  const totalUnread = userChats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Live Chat Pengguna</h2>
                  <p className="text-sm text-gray-600">
                    {userChats.length} perbualan • {totalUnread} belum dibaca
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {userChats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tiada chat dari pengguna</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {userChats.map((chat) => (
                  <div
                    key={chat.userId}
                    onClick={() => setSelectedChat(chat.userId)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat === chat.userId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 relative">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        {chat.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{chat.userName}</h3>
                          {chat.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded ${getRoleColor(chat.userRole)}`}>
                            {getRoleDisplay(chat.userRole)}
                          </span>
                          <span className={`text-xs ${chat.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                            {chat.isOnline ? '🟢 Online' : '⚫ Offline'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {chat.lastMessageTime.toLocaleString('ms-MY')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Detail */}
        <div className="flex-1 flex flex-col">
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    {selectedChatData.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedChatData.userName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded ${getRoleColor(selectedChatData.userRole)}`}>
                        {getRoleDisplay(selectedChatData.userRole)}
                      </span>
                      <span>K/P: {selectedChatData.userIc}</span>
                      <span className={selectedChatData.isOnline ? 'text-green-600' : 'text-gray-500'}>
                        {selectedChatData.isOnline ? '🟢 Online' : '⚫ Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedChatData.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'admin' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === 'admin' ? (
                          <Shield className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.sender === 'admin' ? 'Admin KVB-PASS' : selectedChatData.userName}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('ms-MY', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-6 border-t border-gray-100">
                <form onSubmit={(e) => { e.preventDefault(); handleReply(selectedChatData.userId); }} className="flex space-x-4">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Taip balasan anda..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isReplying}
                  />
                  <button
                    type="submit"
                    disabled={!replyMessage.trim() || isReplying}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isReplying ? 'Menghantar...' : 'Hantar'}</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Chat</h3>
                <p className="text-gray-600">Klik pada chat pengguna untuk melihat perbualan</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLiveChatManager;