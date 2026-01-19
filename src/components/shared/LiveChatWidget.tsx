import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, User, Shield, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LiveChatWidgetProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: Date;
  read: boolean;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatKey = `kvpass_live_chat_${user?.id}`;

  // Load existing messages
  useEffect(() => {
    const stored = localStorage.getItem(chatKey);
    if (stored) {
      const loadedMessages = JSON.parse(stored).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(loadedMessages);
    } else {
      // Welcome message
      const welcomeMessage: ChatMessage = {
        id: '1',
        sender: 'admin',
        message: `Selamat datang ${user?.name}! Saya Admin KVB-PASS. Bagaimana saya boleh membantu anda hari ini?`,
        timestamp: new Date(),
        read: false
      };
      setMessages([welcomeMessage]);
      localStorage.setItem(chatKey, JSON.stringify([welcomeMessage]));
    }
  }, [user?.id, chatKey]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for admin responses
  useEffect(() => {
    const checkForNewMessages = () => {
      const stored = localStorage.getItem(chatKey);
      if (stored) {
        const storedMessages = JSON.parse(stored).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        if (storedMessages.length > messages.length) {
          setMessages(storedMessages);
          
          // Show typing indicator for new admin messages
          const lastMessage = storedMessages[storedMessages.length - 1];
          if (lastMessage.sender === 'admin') {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 1000);
          }
        }
      }
    };

    const interval = setInterval(checkForNewMessages, 2000);
    return () => clearInterval(interval);
  }, [messages.length, chatKey]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date(),
      read: false
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    
    // Update admin notification count
    const adminNotifications = JSON.parse(localStorage.getItem('kvpass_admin_chat_notifications') || '{}');
    adminNotifications[user?.id || ''] = (adminNotifications[user?.id || ''] || 0) + 1;
    localStorage.setItem('kvpass_admin_chat_notifications', JSON.stringify(adminNotifications));

    setNewMessage('');

    // Pengguna tunggu admin balas - tiada auto response
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

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
        >
          <MessageCircle className="w-6 h-6" />
          {messages.filter(msg => msg.sender === 'admin' && !msg.read).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {messages.filter(msg => msg.sender === 'admin' && !msg.read).length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-80 h-96 flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Live Chat Admin</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-blue-100">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{user?.name} ({getRoleDisplay(user?.role || '')})</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p>{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.timestamp.toLocaleTimeString('ms-MY', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Taip mesej anda..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isTyping}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiveChatWidget;