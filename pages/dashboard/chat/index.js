import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaPaperPlane, FaTimes, FaRobot, FaUser, 
  FaRegLightbulb, FaPlus, FaEllipsisV, FaHistory,
  FaDownload, FaTrash, FaSave, FaInfoCircle, FaRegCopy,
  FaChevronRight, FaChevronDown, FaRegFile, FaMagic,
  FaCog, FaBrain, FaExchangeAlt
} from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';
import { callChatAPI, formatChatMessages, generateChatTitle, getAvailableModels } from '../../../utils/api';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

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
  const [streamingContent, setStreamingContent] = useState('');
  const [thinking, setThinking] = useState('');
  const [provider, setProvider] = useState('deepseek');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [availableModels, setAvailableModels] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const [showSendSettings, setShowSendSettings] = useState(false);
  const [enterToSend, setEnterToSend] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

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

  // 获取可用的模型列表
  useEffect(() => {
    setAvailableModels(getAvailableModels());
  }, []);
  
  // 更新当前选择的模型
  useEffect(() => {
    // 确保当选择提供商变化时，选中该提供商下的第一个模型
    if (availableModels[provider] && (!selectedModel || !availableModels[provider].find(m => m.id === selectedModel))) {
      setSelectedModel(availableModels[provider][0]?.id);
    }
  }, [provider, availableModels]);

  // 尝试从localStorage恢复会话状态
  useEffect(() => {
    try {
      // 恢复选择的提供商和模型
      const savedProvider = localStorage.getItem('selectedProvider');
      const savedModel = localStorage.getItem('selectedModel');
      const savedEnterToSend = localStorage.getItem('enterToSend');
      
      if (savedProvider) setProvider(savedProvider);
      if (savedModel) setSelectedModel(savedModel);
      if (savedEnterToSend !== null) setEnterToSend(savedEnterToSend === 'true');
    } catch (e) {
      console.error('恢复会话状态失败:', e);
    }
  }, []);

  // 保存会话状态到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('selectedProvider', provider);
      localStorage.setItem('selectedModel', selectedModel);
      localStorage.setItem('enterToSend', enterToSend.toString());
    } catch (e) {
      console.error('保存会话状态失败:', e);
    }
  }, [provider, selectedModel, enterToSend]);

  // 加载聊天历史
  const loadChatHistory = async () => {
    try {
      setLoading(true);
      
      // 确保user不为null
      if (!user || !user.id) {
        console.log('用户未登录或user.id不存在，创建新聊天');
        setUseMockData(true);
        loadMockChatHistory();
        setLoading(false);
        return;
      }
      
      // 尝试从Supabase加载用户的聊天历史
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('加载聊天历史时出错:', error);
          
          // 如果是404错误，表示表不存在，切换到模拟数据模式
          if (error.code === '404' || error.message?.includes('does not exist')) {
            console.log('chat_history表不存在，使用本地存储模式');
            setUseMockData(true);
            loadMockChatHistory();
            return;
          }
          
          // 其他错误，创建一个新聊天
          createNewChat();
          return;
        }
        
        // 处理返回的数据
        if (data && data.length > 0) {
          // 确保每个聊天都有有效的title和lastMessage
          const formattedHistory = data.map(chat => ({
            id: chat.id,
            title: chat.title || '',
            lastMessage: chat.last_message || '',
            date: chat.updated_at ? new Date(chat.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            messages: chat.messages || []
          }));
          
          console.log('从数据库加载了', formattedHistory.length, '条聊天记录');
          setChatHistory(formattedHistory);
          
          // 选择最近的一个聊天
          setCurrentChatId(formattedHistory[0].id);
          setMessages(formattedHistory[0].messages.length > 0 
            ? formattedHistory[0].messages 
            : [{
                id: 1,
                role: 'assistant',
                content: '你好！我是HooTool AI助手，有什么可以帮到你的吗？',
                timestamp: new Date(),
                model: selectedModel,
                provider: provider
              }]
          );
        } else {
          // 没有历史记录，创建新聊天
          createNewChat();
        }
      } catch (apiError) {
        console.error('API调用出错:', apiError);
        setUseMockData(true);
        loadMockChatHistory();
      }
    } catch (error) {
      console.error('处理聊天历史时出错:', error);
      // 出错时创建新聊天
      setUseMockData(true);
      loadMockChatHistory();
    } finally {
      setLoading(false);
    }
  };
  
  // 加载模拟聊天历史数据
  const loadMockChatHistory = () => {
    console.log('加载模拟聊天历史数据');
    
    // 从localStorage尝试加载历史数据
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          
          // 确保数据是数组格式
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            console.log('成功从localStorage加载了', parsedHistory.length, '条聊天记录');
            
            // 输出所有聊天的标题，用于调试
            parsedHistory.forEach((chat, index) => {
              console.log(`聊天${index + 1}的标题: "${chat.title || '(空)'}", ID: ${chat.id}`);
            });
            
            setChatHistory(parsedHistory);
            
            // 选择第一个聊天
            setCurrentChatId(parsedHistory[0].id);
            const firstChat = parsedHistory[0];
            
            // 如果有消息，加载消息
            if (firstChat.messages && firstChat.messages.length > 0) {
              console.log('加载聊天消息:', firstChat.messages.length, '条');
              setMessages(firstChat.messages);
            } else {
              // 否则创建初始消息
              const initialMessage = {
                id: 1,
                role: 'assistant',
                content: '你好！我是HooTool AI助手，有什么可以帮到你的吗？',
                timestamp: new Date(),
                model: selectedModel,
                provider: provider
              };
              setMessages([initialMessage]);
              
              // 更新聊天历史中的消息
              const updatedHistory = parsedHistory.map(chat => 
                chat.id === firstChat.id ? {...chat, messages: [initialMessage]} : chat
              );
              setChatHistory(updatedHistory);
              localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
            }
            return;
          } else {
            console.warn('localStorage中的聊天历史格式不是数组或为空');
          }
        } catch (parseError) {
          console.error('解析localStorage中的聊天历史失败:', parseError);
          // 清除可能损坏的数据
          localStorage.removeItem('chatHistory');
        }
      } else {
        console.log('localStorage中没有找到聊天历史');
      }
    } catch (e) {
      console.error('从localStorage加载聊天历史失败:', e);
    }
    
    // 如果没有保存的历史或解析失败，创建模拟数据
    console.log('创建新的模拟聊天历史');
    const mockHistory = [
      { id: 'chat-1', title: '工作效率提升策略', lastMessage: '谢谢你的建议，我会尝试这些方法', date: new Date().toISOString().split('T')[0], messages: [] },
      { id: 'chat-2', title: '写作技巧指导', lastMessage: '这些写作技巧非常有用，感谢分享', date: new Date().toISOString().split('T')[0], messages: [] },
      { id: 'chat-3', title: 'AI技术发展趋势', lastMessage: '你对大模型的解释很清晰，谢谢', date: new Date().toISOString().split('T')[0], messages: [] },
    ];
    
    setChatHistory(mockHistory);
    setCurrentChatId(mockHistory[0].id);
    setMessages([{
      id: 1,
      role: 'assistant',
      content: '你好！我是HooTool AI助手，有什么可以帮到你的吗？',
      timestamp: new Date(),
      model: selectedModel,
      provider: provider
    }]);
    
    // 保存到localStorage
    try {
      localStorage.setItem('chatHistory', JSON.stringify(mockHistory));
      console.log('成功保存模拟聊天历史到localStorage');
    } catch (saveError) {
      console.error('保存模拟聊天历史到localStorage失败:', saveError);
    }
  };

  // 创建新的聊天
  const createNewChat = async () => {
    try {
      const now = new Date().toISOString();
      const newChatId = `chat-${Date.now()}`;
      
      // 创建初始消息
      const initialMessage = {
        id: 1,
        role: 'assistant',
        content: '你好！我是HooTool AI助手，有什么可以帮到你的吗？',
        timestamp: now,
        model: selectedModel,
        provider: provider
      };
      
      // 不再使用标题，初始lastMessage为空
      const newChat = {
        id: newChatId,
        title: '',
        lastMessage: '',
        date: now.split('T')[0],
        messages: [initialMessage]
      };
      
      // 如果使用真实数据库且用户已登录，尝试在数据库中创建
      if (!useMockData && user && user.id) {
        try {
          const { data, error } = await supabase
            .from('chat_history')
            .insert({
              id: newChatId,
              user_id: user.id,
              title: '',
              last_message: '',
              messages: [initialMessage],
              created_at: now,
              updated_at: now
            })
            .select();
          
          if (error) {
            console.error('创建新聊天时出错:', error);
            // 如果是404错误，表示表不存在，切换到模拟数据模式
            if (error.code === '404' || error.message?.includes('does not exist')) {
              setUseMockData(true);
            }
          }
        } catch (dbError) {
          console.error('数据库操作出错:', dbError);
          setUseMockData(true);
        }
      }
      
      // 更新本地状态
      const updatedHistory = [newChat, ...(chatHistory || [])];
      setChatHistory(updatedHistory);
      setCurrentChatId(newChatId);
      setMessages([initialMessage]);
      
      // 如果是模拟模式，保存到localStorage
      if (useMockData) {
        try {
          localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
          console.log('新聊天已保存到localStorage, 聊天ID:', newChatId);
        } catch (saveError) {
          console.error('保存新聊天到localStorage失败:', saveError);
        }
      }
    } catch (error) {
      console.error('创建新聊天时出错:', error);
      // 即使出错，也确保UI可用
      const fallbackChat = {
        id: `fallback-${Date.now()}`,
        title: '',
        lastMessage: '',
        date: new Date().toISOString().split('T')[0],
        messages: [{
          id: 1,
          role: 'assistant',
          content: '你好！我是HooTool AI助手，有什么可以帮到你的吗？',
          timestamp: new Date(),
          model: selectedModel,
          provider: provider
        }]
      };
      
      const updatedHistory = [fallbackChat, ...(chatHistory || [])];
      setChatHistory(updatedHistory);
      setCurrentChatId(fallbackChat.id);
      setMessages([fallbackChat.messages[0]]);
      
      // 模拟模式下保存到localStorage
      if (useMockData) {
        try {
          localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
          console.log('后备聊天已保存到localStorage');
        } catch (saveError) {
          console.error('保存后备聊天到localStorage失败:', saveError);
        }
      }
    }
  };

  // 选择一个聊天
  const selectChat = async (chatId) => {
    setCurrentChatId(chatId);
    
    // 从状态中查找聊天
    const chat = chatHistory.find(c => c.id === chatId);
    
    if (chat) {
      if (chat.messages && chat.messages.length > 0) {
        setMessages(chat.messages);
      } else {
        // 如果没有消息，则添加初始消息
        const initialMessage = {
          id: 1,
          role: 'assistant',
          content: '你好！我是HooTool AI助手，有什么可以帮到你的吗？',
          timestamp: new Date(),
          model: selectedModel,
          provider: provider
        };
        
        setMessages([initialMessage]);
        
        // 更新本地状态中的聊天
        const updatedChat = { ...chat, messages: [initialMessage] };
        const updatedChatHistory = chatHistory.map(c => 
          c.id === chatId ? updatedChat : c
        );
        setChatHistory(updatedChatHistory);
        
        // 如果不是模拟模式且用户已登录，更新数据库中的记录
        if (!useMockData && user && user.id) {
          try {
            await supabase
              .from('chat_history')
              .update({ 
                messages: [initialMessage],
                updated_at: new Date().toISOString()
              })
              .eq('id', chatId);
          } catch (dbError) {
            console.error('更新数据库时出错:', dbError);
          }
        }
        
        // 如果是模拟模式，保存到localStorage
        if (useMockData) {
          try {
            localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));
            console.log('已更新聊天消息并保存到localStorage');
          } catch (saveError) {
            console.error('保存聊天消息到localStorage失败:', saveError);
          }
        }
      }
    }
    
    setShowChatOptions(false);
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
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // 更新聊天历史中的最后一条消息
    if (currentChatId) {
      // 更新本地状态 - 直接使用用户输入作为lastMessage
      const updatedChatHistory = chatHistory.map(chat => 
        chat.id === currentChatId ? { ...chat, lastMessage: input.trim() } : chat
      );
      setChatHistory(updatedChatHistory);
      
      // 保存聊天历史到localStorage (无论是否模拟模式都保存，增加可靠性)
      try {
        localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));
        console.log('已更新聊天历史lastMessage：', input.trim().substring(0, 20));
      } catch (saveError) {
        console.error('保存聊天历史到localStorage失败:', saveError);
      }
      
      // 如果不是模拟模式且用户已登录，尝试更新数据库
      if (!useMockData && user && user.id) {
        try {
          // 更新数据库中的记录 - 只更新lastMessage而不更新title
          await supabase
            .from('chat_history')
            .update({ 
              last_message: input.trim(),
              messages: updatedMessages,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentChatId);
        } catch (dbError) {
          console.error('更新数据库时出错:', dbError);
          // 遇到错误时切换到模拟模式
          setUseMockData(true);
        }
      }
    }
    
    setInput('');
    setSending(true);
    setStreamingContent('');
    setThinking('');
    
    try {
      // 准备消息历史记录，格式化为API所需格式
      const chatMessages = formatChatMessages([
        // 系统提示，定义AI助手的行为
        { 
          role: 'system', 
          content: `你是HooTool AI的智能助手，基于${provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'}技术。你的目标是提供有用、准确和有见解的回答。保持友好和专业的语气，尽量提供具体的建议和信息。如果你不确定，请坦诚地表示，而不是提供错误信息。你的回答将以Markdown格式显示，所以可以使用Markdown语法来格式化你的回答，例如标题、列表、代码块等。`
        },
        // 添加聊天历史记录，不包括系统消息
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        // 添加当前用户消息
        { role: 'user', content: input.trim() }
      ]);
      
      // 设置API选项
      const apiOptions = { stream: true };
      
      // 使用流式处理方式调用模型API
      let finalContent = ''; // 用于存储完整的回复内容
      
      await callChatAPI(
        provider,
        selectedModel,
        chatMessages,
        apiOptions,
        (content, thinking = '') => {
          setStreamingContent(content);
          finalContent = content; // 保存最新的内容
          if (thinking) {
            setThinking(thinking);
          }
          // 保持滚动到底部
          scrollToBottom();
        }
      );
      
      // 流式响应完成后，创建完整消息
      const assistantMessage = {
        id: Date.now(),
        role: 'assistant',
        content: finalContent, // 使用保存的完整内容
        timestamp: new Date(),
        model: selectedModel,
        provider: provider
      };
      
      // 在流式输出完成后等待一小段时间再更新消息列表
      // 这确保了在流式输出结束时正确显示完整消息
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 更新消息列表
      const updatedAllMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedAllMessages);
      
      // 更新聊天历史
      const updatedChatHistory = chatHistory.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat, 
            messages: updatedAllMessages,
            lastMessage: input.trim()
          };
        }
        return chat;
      });
      setChatHistory(updatedChatHistory);
      
      // 保存聊天历史到localStorage (无论是否模拟模式都保存，增加可靠性)
      try {
        localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));
        console.log('已更新聊天历史并保存到localStorage');
      } catch (saveError) {
        console.error('保存聊天历史到localStorage失败:', saveError);
      }
      
      // 如果不是模拟模式且用户已登录，尝试更新数据库
      if (!useMockData && user && user.id) {
        try {
          // 更新数据库中的记录
          await supabase
            .from('chat_history')
            .update({ 
              messages: updatedAllMessages,
              last_message: input.trim(),
              updated_at: new Date().toISOString()
            })
            .eq('id', currentChatId);
        } catch (dbError) {
          console.error('更新消息到数据库时出错:', dbError);
          // 遇到错误时切换到模拟模式
          setUseMockData(true);
        }
      }
    } catch (error) {
      console.error('发送消息时出错:', error);
      
      // 添加错误消息
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `很抱歉，发生了错误: ${error.message}。请稍后再试或联系支持团队。`,
        isError: true,
        timestamp: new Date()
      };
      
      // 更新消息列表
      const updatedAllMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedAllMessages);
      
      // 更新聊天历史
      const updatedChatHistory = chatHistory.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat, 
            messages: updatedAllMessages,
            lastMessage: input.trim()
          };
        }
        return chat;
      });
      setChatHistory(updatedChatHistory);
      
      // 保存聊天历史到localStorage (无论是否模拟模式都保存，增加可靠性)
      try {
        localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));
      } catch (saveError) {
        console.error('保存错误消息到localStorage失败:', saveError);
      }
      
      // 如果不是模拟模式且用户已登录，尝试更新数据库
      if (!useMockData && user && user.id) {
        try {
          // 更新数据库中的记录
          await supabase
            .from('chat_history')
            .update({ 
              messages: updatedAllMessages,
              last_message: input.trim(),
              updated_at: new Date().toISOString()
            })
            .eq('id', currentChatId);
        } catch (dbError) {
          console.error('更新错误消息到数据库时出错:', dbError);
          // 遇到错误时切换到模拟模式
          setUseMockData(true);
        }
      }
    } finally {
      setSending(false);
      // 保留streamingContent的内容，直到新内容完全加载到消息列表中
      // setTimeout(() => {
      //   setStreamingContent('');
      //   setThinking('');
      // }, 500);
    }
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
  const deleteCurrentChat = async () => {
    // 确保有选中的聊天
    if (!currentChatId) return;
    
    try {
      // 从本地状态中移除
      const newChatHistory = chatHistory.filter(chat => chat.id !== currentChatId);
      setChatHistory(newChatHistory);
      
      // 无论是否模拟模式，都更新localStorage
      try {
        localStorage.setItem('chatHistory', JSON.stringify(newChatHistory));
        console.log('删除的聊天已从localStorage中移除');
      } catch (saveError) {
        console.error('从localStorage删除聊天失败:', saveError);
      }
      
      // 如果不是模拟模式且用户已登录，从数据库中删除
      if (!useMockData && user && user.id) {
        try {
          const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('id', currentChatId);
          
          if (error) {
            console.error('删除聊天时出错:', error);
            // 如果出错，切换到模拟模式
            setUseMockData(true);
          }
        } catch (dbError) {
          console.error('删除聊天数据库操作出错:', dbError);
          setUseMockData(true);
        }
      }
      
      // 如果还有其他聊天，选择第一个
      if (newChatHistory.length > 0) {
        selectChat(newChatHistory[0].id);
      } else {
        // 当删除最后一个聊天时，不再自动创建新的聊天
        // 清空当前聊天ID和消息
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('删除聊天时出错:', error);
      // 出错时清空当前聊天状态，而不是强制创建新聊天
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  // 保存当前聊天
  const saveCurrentChat = () => {
    alert('聊天已保存到您的收藏夹');
    setShowChatOptions(false);
  };

  // 渲染消息内容（支持Markdown）
  const renderMessageContent = (content, isError = false) => {
    if (isError) {
      return <div className="text-red-500">{content}</div>;
    }
    
    return (
      <div className="prose prose-sm max-w-none w-full leading-relaxed">
        <ReactMarkdown 
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({node, ...props}) => <p className="mb-5 leading-relaxed" {...props} />,
            li: ({node, ...props}) => <li className="leading-relaxed mb-2" {...props} />,
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-5">
                <table className="min-w-full divide-y divide-gray-200" {...props} />
              </div>
            ),
            pre: ({node, ...props}) => (
              <pre className="bg-gray-50 rounded-md p-5 overflow-x-auto my-5" {...props} />
            ),
            code: ({node, inline, className, children, ...props}) => (
              inline 
                ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>{children}</code>
                : <code className="block bg-gray-50 p-5 rounded-md text-sm overflow-x-auto" {...props}>{children}</code>
            ),
            h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-7 mb-5 leading-relaxed" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-6 mb-4 leading-relaxed" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-md font-bold mt-5 mb-3 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-5 space-y-3" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-5 space-y-3" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 py-1 my-5 text-gray-700 italic" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // 渲染空状态界面
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
          <FaMagic className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">欢迎使用 HooTool AI 助手</h2>
        <p className="text-gray-600 mb-6 max-w-md">创建一个新的聊天，开始与AI助手交流获取帮助。</p>
        <button 
          onClick={createNewChat}
          className="flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <FaPlus className="h-4 w-4 mr-2" />
          新建聊天
        </button>
        
        <div className="mt-10 max-w-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">AI助手能帮您做什么？</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-green-600 mb-2"><FaRegFile className="h-5 w-5" /></div>
              <p className="text-sm text-gray-800">撰写和编辑各类文档、邮件和文案</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-green-600 mb-2"><FaBrain className="h-5 w-5" /></div>
              <p className="text-sm text-gray-800">解答知识问题和提供研究支持</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-green-600 mb-2"><FaRegLightbulb className="h-5 w-5" /></div>
              <p className="text-sm text-gray-800">头脑风暴创意和解决方案</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-green-600 mb-2"><FaExchangeAlt className="h-5 w-5" /></div>
              <p className="text-sm text-gray-800">翻译和语言学习辅助</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 添加键盘事件处理函数
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        if ((enterToSend && !e.ctrlKey) || (!enterToSend && e.ctrlKey)) {
          e.preventDefault();
          if (input.trim()) {
            handleSubmit(e);
          }
        }
      }
    }
  };

  // 渲染聊天标题，如果没有用户消息就显示"新的对话"，否则显示用户第一条消息内容
  const renderChatTitle = (chat) => {
    // 如果没有聊天对象，返回空字符串
    if (!chat) return "";
    
    // 如果聊天有标题，返回标题
    if (chat.title && chat.title !== '') {
      return chat.title;
    }
    
    // 如果聊天没有标题但有lastMessage，使用lastMessage
    if (chat.lastMessage && chat.lastMessage !== '') {
      return chat.lastMessage.length > 20 
        ? chat.lastMessage.substring(0, 20) + '...' 
        : chat.lastMessage;
    }
    
    // 如果什么都没有，这是个新对话
    return "新的对话";
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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden hidden md:flex">
            <div className="p-4 border-b border-gray-200">
              <button 
                onClick={createNewChat}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                新建聊天
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden py-2">
              <div className="px-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                  聊天历史
                </div>
                
                <div className="space-y-1">
                  {chatHistory.map((chat) => (
                    <div 
                      key={chat.id}
                      className={`flex items-start p-2 rounded-lg transition-colors group ${
                        currentChatId === chat.id 
                          ? 'bg-green-50 border-l-2 border-green-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div 
                        className="h-9 w-9 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3"
                        onClick={() => selectChat(chat.id)}
                      >
                        <FaRobot className="h-4 w-4" />
                      </div>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => selectChat(chat.id)}
                      >
                        <div className="flex items-start justify-between">
                          <p className={`text-sm font-medium ${currentChatId === chat.id ? 'text-green-900' : 'text-gray-900'} truncate max-w-[100px]`}>
                            {renderChatTitle(chat)}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                            {formatDate(chat.date)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">{chat.lastMessage}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (chat.id === currentChatId) {
                            deleteCurrentChat();
                          } else {
                            setChatHistory(prev => prev.filter(c => c.id !== chat.id));
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 self-center flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="删除对话"
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                      </button>
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
            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl" 
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
              
              <div className="flex-1 overflow-hidden py-2">
                <div className="px-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                    聊天历史
                  </div>
                  
                  <div className="space-y-1">
                    {chatHistory.map((chat) => (
                      <div 
                        key={chat.id}
                        className={`flex items-start p-2 rounded-lg transition-colors group ${
                          currentChatId === chat.id 
                            ? 'bg-green-50 border-l-2 border-green-600' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div 
                          className="h-9 w-9 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3"
                          onClick={() => {
                            selectChat(chat.id);
                            setShowSidebar(false);
                          }}
                        >
                          <FaRobot className="h-4 w-4" />
                        </div>
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            selectChat(chat.id);
                            setShowSidebar(false);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                              {renderChatTitle(chat)}
                            </p>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                              {formatDate(chat.date)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">{chat.lastMessage}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (chat.id === currentChatId) {
                              deleteCurrentChat();
                            } else {
                              setChatHistory(prev => prev.filter(c => c.id !== chat.id));
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 self-center flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="删除对话"
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
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
                  {currentChatId ? renderChatTitle(chatHistory.find(c => c.id === currentChatId)) : 'AI助手'}
                </h2>
                <p className="text-xs text-gray-500 relative">
                  AI助手 - 基于{provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'} 
                  <button 
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="ml-2 text-green-600 hover:text-green-700 focus:outline-none inline-flex items-center bg-green-50 px-2 py-1 rounded-md border border-green-100"
                  >
                    <span>{availableModels[provider]?.find(m => m.id === selectedModel)?.name || selectedModel}</span>
                    <svg className="ml-1 h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16L6 10H18L12 16Z" fill="currentColor"/>
                    </svg>
                  </button>
                  
                  {/* 模型选择器 */}
                  {showModelSelector && (
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <div className="py-2 px-3 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">选择AI模型</h3>
                      </div>
                      
                      <div className="p-3">
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-gray-700">AI提供商</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setProvider('deepseek')}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
                                provider === 'deepseek' 
                                  ? 'bg-green-100 text-green-800 border border-green-300' 
                                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              <svg className="mr-1.5 h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z" fill="currentColor"/>
                              </svg>
                              DeepSeek
                            </button>
                            <button
                              onClick={() => setProvider('openai')}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
                                provider === 'openai' 
                                  ? 'bg-green-100 text-green-800 border border-green-300' 
                                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              <svg className="mr-1.5 h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 7.5L12 2L3 7.5V16.5L12 22L21 16.5V7.5ZM12 4.2L18 7.9L12 11.6L6 7.9L12 4.2ZM5 9.8L11 13.5V19.8L5 16.1V9.8ZM13 19.8V13.5L19 9.8V16.1L13 19.8Z" fill="currentColor"/>
                              </svg>
                              OpenAI
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-2">可用模型</div>
                          <div className="space-y-2">
                            {availableModels[provider]?.map((model) => (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSelectedModel(model.id);
                                  setShowModelSelector(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                                  selectedModel === model.id
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'hover:bg-gray-50 border border-gray-100'
                                }`}
                              >
                                <div className="font-medium">{model.name}</div>
                                <div className="text-gray-500 text-xs mt-0.5">{model.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </p>
              </div>
            </div>
            
            <div className="relative flex items-center space-x-2">
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 md:hidden"
                aria-label="切换侧边栏"
              >
                <FaHistory className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* 聊天消息区域 */}
          <div className="flex-1 overflow-y-auto py-4 px-4 sm:px-6 lg:px-10 xl:px-16 bg-gray-50">
            {currentChatId ? (
              <div className="max-w-7xl mx-auto space-y-8">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-3xl ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-2xl px-5 py-4 shadow-sm rounded-tr-none' 
                        : 'bg-white text-gray-700 rounded-2xl px-5 py-4 shadow-sm rounded-tl-none'
                    }`}>
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {message.role === 'user' ? (
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <FaUser className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-white border border-green-200 flex items-center justify-center">
                            <FaRobot className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div className={`flex-1 overflow-hidden ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                        {message.role === 'user' ? (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        ) : (
                          renderMessageContent(message.content, message.isError)
                        )}
                        <div className={`flex justify-between items-center mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                          <div className="text-xs">
                            {formatTime(message.timestamp)}
                          </div>
                          {message.role === 'assistant' && message.model && (
                            <div className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {availableModels[message.provider]?.find(m => m.id === message.model)?.name || message.model}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {sending && (
                  <div className="flex justify-start">
                    <div className="flex max-w-3xl bg-white text-gray-700 rounded-2xl px-5 py-4 shadow-sm rounded-tl-none">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        <div className="h-8 w-8 rounded-full bg-white border border-green-200 flex items-center justify-center">
                          <FaRobot className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {!streamingContent && (
                          <div className="flex items-center">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        )}
                        
                        {streamingContent && (
                          <div className="w-full">
                            {renderMessageContent(streamingContent)}
                            {thinking && (
                              <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-100 text-xs text-gray-500">
                                <div className="font-semibold text-gray-600 mb-1">思考过程:</div>
                                {thinking}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            ) : (
              renderEmptyState()
            )}
          </div>
          
          {/* 帮助面板 */}
          {showHelpPanel && (
            <div className="absolute right-0 top-16 w-64 bg-white shadow-xl border-l border-gray-200 h-[calc(100vh-4rem)] z-20 overflow-y-auto">
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
          {currentChatId && (
            <div className="bg-white border-t border-gray-200 p-4 sm:p-5">
              <div className="max-w-7xl mx-auto">
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
                      onKeyDown={handleKeyDown}
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
                    当前使用: {provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'} - {availableModels[provider]?.find(m => m.id === selectedModel)?.name || selectedModel}
                  </p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-3">每次对话消耗1积分</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSendSettings(!showSendSettings)}
                        className="text-xs text-gray-500 hover:text-green-600 flex items-center"
                      >
                        <FaCog className="h-3 w-3 mr-1" />
                        {enterToSend ? 'Enter发送' : 'Ctrl+Enter发送'}
                      </button>
                      
                      {showSendSettings && (
                        <div className="absolute bottom-6 right-0 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="p-2">
                            <div className="text-xs font-medium text-gray-700 mb-2">发送消息方式</div>
                            <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                              <input 
                                type="radio" 
                                checked={enterToSend} 
                                onChange={() => {
                                  setEnterToSend(true);
                                  setShowSendSettings(false);
                                }}
                                className="text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">按Enter发送</span>
                            </label>
                            <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                              <input 
                                type="radio" 
                                checked={!enterToSend} 
                                onChange={() => {
                                  setEnterToSend(false);
                                  setShowSendSettings(false);
                                }}
                                className="text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">按Ctrl+Enter发送</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="mx-2 h-1 w-1 rounded-full bg-gray-300"></span>
                    <Link href="/dashboard/pricing" className="text-xs text-green-600 hover:text-green-700">
                      升级账户
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
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