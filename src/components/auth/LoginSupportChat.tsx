import React, { useState } from 'react';
import { X, MessageCircle, Send, User, Shield, AlertCircle, CheckCircle, Key } from 'lucide-react';

interface LoginSupportChatProps {
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: Date;
  category?: 'login' | 'password' | 'account' | 'general';
}

const LoginSupportChat: React.FC<LoginSupportChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'admin',
      message: 'Assalamualaikum dan selamat datang ke Sokongan Log Masuk KV-PASS. Bagaimana saya boleh membantu anda?',
      timestamp: new Date(),
      category: 'general'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'login' | 'password' | 'account' | 'general'>('general');
  const [isTyping, setIsTyping] = useState(false);

  const categories = [
    { value: 'login', label: 'Masalah Log Masuk', icon: '🔐' },
    { value: 'password', label: 'Lupa Kata Laluan', icon: '🔑' },
    { value: 'account', label: 'Akaun Belum Disahkan', icon: '⚠️' },
    { value: 'general', label: 'Pertanyaan Lain', icon: '💬' }
  ];

  const quickHelp = [
    { text: 'Tidak dapat log masuk', category: 'login' },
    { text: 'Lupa kata laluan', category: 'password' },
    { text: 'Akaun belum aktif', category: 'account' },
    { text: 'Cara reset kata laluan', category: 'password' }
  ];

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || newMessage;
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: messageToSend,
      timestamp: new Date(),
      category: selectedCategory
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage('');
    setIsTyping(true);

    // Simulate admin response
    setTimeout(() => {
      const adminResponse = getAdminResponse(messageToSend, selectedCategory);
      const adminMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'admin',
        message: adminResponse,
        timestamp: new Date(),
        category: selectedCategory
      };

      setMessages([...updatedMessages, adminMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAdminResponse = (message: string, category: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (category === 'login' || lowerMessage.includes('tidak dapat log masuk')) {
      return 'Untuk masalah log masuk, sila pastikan:\n\n1. Nombor K/P (12 digit) adalah betul\n2. Kata laluan (6 digit) adalah betul\n3. Akaun telah diaktifkan\n\nJika masih bermasalah, sila klik butang "Lupa Kata Laluan?" untuk reset.';
    }
    
    if (category === 'password' || lowerMessage.includes('lupa kata laluan')) {
      return 'Untuk reset kata laluan:\n\n1. Klik butang "Lupa Kata Laluan?" di halaman log masuk\n2. Masukkan No K/P dan alamat e-mel anda\n3. Kod verifikasi akan dihantar ke e-mel\n4. Ikut arahan untuk tetapkan kata laluan baru\n\nJika tidak menerima e-mel, semak folder spam.';
    }
    
    if (category === 'account' || lowerMessage.includes('akaun belum')) {
      return 'Jika akaun belum disahkan:\n\n1. Semak e-mel untuk pautan pengesahan\n2. Klik pautan dalam e-mel untuk aktifkan akaun\n3. Jika tidak menerima e-mel, hubungi admin\n\nUntuk pelajar baru, akaun akan diaktifkan oleh admin dalam masa 24 jam.';
    }
    
    return 'Terima kasih atas pertanyaan anda. Jika masalah berterusan, sila hubungi pejabat admin secara terus atau cuba langkah-langkah berikut:\n\n1. Pastikan maklumat log masuk betul\n2. Gunakan fungsi "Lupa Kata Laluan"\n3. Semak status akaun dengan admin\n\nSaya sentiasa sedia membantu!';
  };

  const handleQuickHelp = (helpText: string, category: string) => {
    setSelectedCategory(category as any);
    handleSendMessage(helpText);
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
                <h2 className="text-xl font-semibold text-gray-900">Sokongan Log Masuk</h2>
                <p className="text-sm text-gray-600">Bantuan untuk masalah log masuk dan akaun</p>
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

        {/* Quick Help Section */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Bantuan Pantas:</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickHelp.map((help, index) => (
              <button
                key={index}
                onClick={() => handleQuickHelp(help.text, help.category)}
                className="text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {help.text}
              </button>
            ))}
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
                    {msg.sender === 'admin' ? 'Admin Sokongan' : 'Anda'}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-line">{msg.message}</p>
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
                  <span className="text-xs font-medium">Admin Sokongan</span>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Masalah
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

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Taip masalah atau pertanyaan anda..."
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

export default LoginSupportChat;