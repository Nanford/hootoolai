import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaPaperPlane, FaTimes, FaRobot, FaUser, 
  FaRegLightbulb, FaPlus, FaEllipsisV, FaHistory,
  FaDownload, FaTrash, FaSave, FaInfoCircle, FaRegCopy,
  FaChevronRight, FaChevronDown, FaRegFile, FaMagic
} from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';

export default function Chat() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
      
      // 加载聊天历史
      loadChatHistory();
    };

    checkUser();
  }, [router]);

  // 模拟加载聊天历史
  const loadChatHistory = () => {
    // 这里应该从数据库加载，现在用模拟数据
    const mockHistory = [
      { id: 'chat-1', title: '工作效率提升策略', lastMessage: '谢谢你的建议，我会尝试这些方法', date: '2025-03-20', messages: [] },
      { id: 'chat-2', title: '写作技巧指导', lastMessage: '这些写作技巧非常有用，感谢分享', date: '2025-03-19', messages: [] },
      { id: 'chat-3', title: '营销策略分析', lastMessage: '我明白了，这些策略对目标受众很有效', date: '2025-03-18', messages: [] },
      { id: 'chat-4', title: 'AI技术发展趋势', lastMessage: '你对大模型的解释很清晰，谢谢', date: '2025-03-17', messages: [] },
    ];
    
    setChatHistory(mockHistory);
    // 新用户，创建一个新的聊天
    createNewChat();
  };

  // 创建新的聊天
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: '新的对话',
      lastMessage: '',
      date: new Date().toISOString().split('T')[0],
      messages: []
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([{
      id: 1,
      role: 'assistant',
      content: '你好！我是HooTool AI助手，有什么可以帮到你的吗？',
      timestamp: new Date()
    }]);
  };

  // 选择一个聊天
  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
    // 这里应该从数据库加载聊天内容，现在用模拟数据
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat.messages && chat.messages.length > 0) {
      setMessages(chat.messages);
    } else {
      setMessages([{
        id: 1,
        role: 'assistant',
        content: '你好！我是HooTool AI助手，有什么可以帮到你的吗？',
        timestamp: new Date()
      }]);
    }
    setShowChatOptions(false);
  };

  // 根据最新消息更新聊天标题
  const updateChatTitle = (chatId, userMessage) => {
    // 实际应用中应该使用AI生成标题，这里简化处理
    if (userMessage.length > 20) {
      const shortTitle = userMessage.substring(0, 20) + '...';
      setChatHistory(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: shortTitle, lastMessage: userMessage } : chat
      ));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // 添加用户消息
    const userMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    // 更新聊天历史中的最后一条消息
    if (currentChatId) {
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId ? { ...chat, lastMessage: input.trim() } : chat
      ));
      
      // 如果是新聊天的第一条消息，更新标题
      const currentChat = chatHistory.find(c => c.id === currentChatId);
      if (currentChat && currentChat.title === '新的对话') {
        updateChatTitle(currentChatId, input.trim());
      }
    }
    
    setInput('');
    setSending(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成助手回复（在实际应用中会调用DeepSeek API）
      const response = generateMockResponse(input.trim());
      
      // 添加助手消息
      const assistantMessage = { role: 'assistant', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('聊天错误:', error);
      
      // 添加错误消息
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，我遇到了一些问题。请稍后再试。', 
        timestamp: new Date(),
        isError: true 
      }]);
    } finally {
      setSending(false);
      // 聚焦输入框
      inputRef.current?.focus();
    }
  };

  // 模拟响应生成，实际应用会替换为API调用
  const generateMockResponse = (query) => {
    const responses = [
      '我理解您的问题。根据我的知识，这个问题有多个角度可以探讨...',
      '这是一个很好的问题！让我为您分析一下...',
      '根据最新的研究和数据，我可以告诉您...',
      '这个问题很有趣。从技术角度来看...',
      '我可以提供一些有用的建议。首先，考虑...'
    ];
    
    // 返回随机响应 + 查询内容的回显
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return `${randomResponse}\n\n关于"${query}"，我建议您可以考虑以下几点：\n1. 深入研究相关领域的基础知识\n2. 尝试实践并记录结果\n3. 与专业人士交流获取反馈`;
  };

  // 建议提示
  const suggestions = [
    '如何使用AI提高工作效率？',
    '帮我写一篇关于数字营销的文章大纲',
    '解释一下大语言模型是如何工作的',
    '给我推荐一些学习人工智能的资源',
    '如何使用AI进行内容创作？'
  ];

  const formatTime = (date) => {
    if (!date) return '';
    
    // 确保date是Date对象
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // 检查dateObj是否是有效的Date对象
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  // 删除当前聊天
  const deleteCurrentChat = () => {
    setChatHistory(prev => prev.filter(chat => chat.id !== currentChatId));
    if (chatHistory.length > 1) {
      const nextChat = chatHistory.find(chat => chat.id !== currentChatId);
      if (nextChat) {
        selectChat(nextChat.id);
      }
    } else {
      createNewChat();
    }
    setShowChatOptions(false);
  };

  // 保存当前聊天
  const saveCurrentChat = () => {
    alert('聊天已保存到您的收藏夹');
    setShowChatOptions(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 relative">
            <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-green-600 border-solid rounded-full"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-green-100 border-solid rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Head>
        <title>AI助手 - HooTool AI</title>
        <meta name="description" content="与DeepSeek AI助手聊天，获取帮助和建议" />
      </Head>

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-500 hover:text-green-600 mr-3">
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <FaMagic className="h-6 w-6 text-green-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">AI助手</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowHelpPanel(!showHelpPanel)}
                className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50"
                aria-label="帮助"
              >
                <FaInfoCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 md:hidden"
                aria-label="切换侧边栏"
              >
                <FaHistory className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏：聊天历史 */}
        {showSidebar && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden hidden md:flex">
            <div className="p-4 border-b border-gray-200">
              <button 
                onClick={createNewChat}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                新建聊天
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                  聊天历史
                </div>
                
                <div className="space-y-1">
                  {chatHistory.map((chat) => (
                    <div 
                      key={chat.id}
                      className={`flex items-start p-2 rounded-lg cursor-pointer transition-colors ${
                        currentChatId === chat.id 
                          ? 'bg-green-50 border-l-2 border-green-600' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => selectChat(chat.id)}
                    >
                      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <FaRobot className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={`text-sm font-medium ${currentChatId === chat.id ? 'text-green-900' : 'text-gray-900'} truncate`}>
                            {chat.title}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                            {formatDate(chat.date)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{chat.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-white">
                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || <FaUser className="h-4 w-4" />}
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    剩余积分: 85
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 移动端侧边栏 */}
        {showSidebar && (
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden" 
               onClick={() => setShowSidebar(false)}>
            <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl" 
                 onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <button 
                  onClick={createNewChat}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  新建聊天
                </button>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-500 p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-2 h-[calc(100vh-8rem)]">
                <div className="px-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                    聊天历史
                  </div>
                  
                  <div className="space-y-1">
                    {chatHistory.map((chat) => (
                      <div 
                        key={chat.id}
                        className={`flex items-start p-2 rounded-lg cursor-pointer transition-colors ${
                          currentChatId === chat.id 
                            ? 'bg-green-50 border-l-2 border-green-600' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          selectChat(chat.id);
                          setShowSidebar(false);
                        }}
                      >
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <FaRobot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {chat.title}
                            </p>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                              {formatDate(chat.date)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 absolute bottom-0 w-full">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-white">
                      {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || <FaUser className="h-4 w-4" />}
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      剩余积分: 85
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 聊天头部 */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                <FaRobot className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  {chatHistory.find(c => c.id === currentChatId)?.title || '新的对话'}
                </h2>
                <p className="text-xs text-gray-500">
                  AI助手 - 基于DeepSeek
                </p>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowChatOptions(!showChatOptions)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <FaEllipsisV className="h-5 w-5" />
              </button>
              
              {showChatOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={createNewChat}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaPlus className="h-4 w-4 mr-3 text-gray-500" />
                      新建聊天
                    </button>
                    <button
                      onClick={saveCurrentChat}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaSave className="h-4 w-4 mr-3 text-gray-500" />
                      保存聊天
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaDownload className="h-4 w-4 mr-3 text-gray-500" />
                      导出聊天记录
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaRegCopy className="h-4 w-4 mr-3 text-gray-500" />
                      复制对话
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={deleteCurrentChat}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <FaTrash className="h-4 w-4 mr-3 text-red-500" />
                      删除聊天
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 聊天消息区域 */}
          <div className="flex-1 overflow-y-auto py-4 px-4 sm:px-6 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    flex max-w-md ${message.role === 'user' 
                      ? 'bg-green-600 text-white' 
                      : message.isError 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white text-gray-700'
                    } rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}
                  `}>
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {message.role === 'user' ? (
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                          <FaUser className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-white border border-green-200 flex items-center justify-center">
                          <FaRobot className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 text-right ${message.role === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="flex max-w-md bg-white text-gray-700 rounded-2xl px-4 py-3 shadow-sm rounded-tl-none">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="h-8 w-8 rounded-full bg-white border border-green-200 flex items-center justify-center">
                        <FaRobot className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* 帮助面板 */}
          {showHelpPanel && (
            <div className="absolute right-0 top-16 w-80 bg-white shadow-xl border-l border-gray-200 h-[calc(100vh-4rem)] z-20 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-gray-900">AI助手使用指南</h3>
                <button
                  onClick={() => setShowHelpPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <FaRegLightbulb className="text-green-600 mr-2 h-4 w-4" />
                    如何有效提问
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      提供具体和详细的问题，避免模糊描述
                    </li>
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      一次只问一个问题，获得更精准的回答
                    </li>
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      明确指出您需要的深度和格式
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <FaRegFile className="text-green-600 mr-2 h-4 w-4" />
                    AI助手能力
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      撰写和编辑各类文档、邮件和文案
                    </li>
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      解答知识问题和提供研究支持
                    </li>
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      头脑风暴创意和解决方案
                    </li>
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      翻译和语言学习辅助
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <FaInfoCircle className="text-green-600 mr-2 h-4 w-4" />
                    使用限制
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    AI助手基于DeepSeek大语言模型，在以下方面可能有限制：
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      知识截止日期为2024年3月，可能不了解最新信息
                    </li>
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      不能访问互联网或实时数据
                    </li>
                    <li className="flex items-start">
                      <FaChevronRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      不能运行代码或与其他系统交互
                    </li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2">积分使用说明</h4>
                  <p className="text-xs text-green-700">
                    每次对话消耗1积分，约1000字。专业版和团队版用户可享受更高的使用限额和更快的响应速度。
                  </p>
                  <div className="mt-2">
                    <Link 
                      href="/dashboard/pricing" 
                      className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center"
                    >
                      了解更多
                      <FaChevronRight className="ml-1 h-2 w-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 输入区域 */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-3xl mx-auto">
              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <FaRegLightbulb className="text-green-600 mr-2 h-4 w-4" />
                    <span>尝试以下提问：</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-full transition-colors"
                        onClick={() => setInput(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="block w-full rounded-xl pl-4 pr-10 py-3 border border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="输入消息..."
                    disabled={sending}
                    ref={inputRef}
                  />
                  {input && (
                    <button
                      type="button"
                      onClick={() => setInput('')}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="inline-flex items-center justify-center p-3 rounded-full bg-green-600 text-white disabled:opacity-50 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors"
                >
                  <FaPaperPlane className="h-5 w-5" />
                </button>
              </form>
              
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  该AI助手基于DeepSeek大语言模型
                </p>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">每次对话消耗1积分</span>
                  <span className="mx-2 h-1 w-1 rounded-full bg-gray-300"></span>
                  <Link href="/dashboard/pricing" className="text-xs text-green-600 hover:text-green-700">
                    升级账户
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          float: left;
          margin: 0 1px;
          background-color: #9880ff;
          display: block;
          border-radius: 50%;
          opacity: 0.4;
        }
        
        .typing-indicator span:nth-of-type(1) {
          animation: 1s blink infinite 0.3333s;
        }
        
        .typing-indicator span:nth-of-type(2) {
          animation: 1s blink infinite 0.6666s;
        }
        
        .typing-indicator span:nth-of-type(3) {
          animation: 1s blink infinite 0.9999s;
        }
        
        @keyframes blink {
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}