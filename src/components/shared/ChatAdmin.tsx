import React, { useState } from 'react';
import { X, MessageCircle, Send, User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ChatAdminProps {
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: Date;
  category?: 'login' | 'system' | 'question' | 'other';
}

const ChatAdmin: React.FC<ChatAdminProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load existing messages from localStorage
    const stored = localStorage.getItem(`kvpass_chat_${user?.id}`);
    return stored ? JSON.parse(stored).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })) : [
      {
        id: '1',
        sender: 'admin',
        message: 'Assalamualaikum dan selamat datang ke Chat Admin KV-PASS. Bagaimana saya boleh membantu anda?',
        timestamp: new Date(),
        category: 'other'
      }
    ];
  });
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'login' | 'system' | 'question' | 'other'>('other');
  const [isTyping, setIsTyping] = useState(false);

  const categories = [
    { value: 'login', label: 'Masalah Log Masuk', icon: '🔐' },
    { value: 'system', label: 'Ralat Sistem', icon: '⚠️' },
    { value: 'question', label: 'Pertanyaan Am', icon: '❓' },
    { value: 'other', label: 'Lain-lain', icon: '💬' }
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date(),
      category: selectedCategory
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage('');
    setIsTyping(true);

    // Save to localStorage
    localStorage.setItem(`kvpass_chat_${user?.id}`, JSON.stringify(updatedMessages));

    // Pengguna tunggu admin balas - tiada auto response
    setIsTyping(false);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'student': return 'Pelajar';
      case 'hep': return 'Ketua HEP';
      case 'warden': return 'Ketua Warden';
      case 'security': return 'Pengawal Keselamatan';
      case 'admin': return 'Pentadbir Sistem';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sokongan Teknikal KV-PASS</h2>
                <p className="text-sm text-gray-600">Bantuan dan sokongan sistem</p>
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

        {/* User Info */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{user?.name} ({getRoleDisplay(user?.role || '')})</span>
            <span>•</span>
            <span>{user?.icNumber}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  {msg.sender === 'admin' ? (
                    <Shield className="w-4 h-4 text-blue-600" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">
                    {msg.sender === 'admin' ? 'Admin KV-PASS' : user?.name}
                  </span>
                </div>
                <p className="text-sm">{msg.message}</p>
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
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium">Admin KV-PASS</span>
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-100">
          {/* Category Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Mesej
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value as any)}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    selectedCategory === cat.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Taip mesej anda di sini..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isTyping}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Hantar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatAdmin;