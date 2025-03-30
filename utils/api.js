// API工具类，用于处理与各种AI API的交互

// DeepSeek API调用
export async function callDeepseekChat(messages, options = {}) {
  try {
    // DeepSeek API请求URL
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    
    // 默认参数
    const defaultOptions = {
      model: 'deepseek-chat', // DeepSeek默认模型
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.95,
      stream: false
    };
    
    // 合并选项
    const requestOptions = {
      ...defaultOptions,
      ...options,
      messages
    };
    
    // 发送请求到DeepSeek API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API错误: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message;
  } catch (error) {
    console.error('调用DeepSeek API时出错:', error);
    throw error;
  }
}

// DeepSeek API流式调用
export async function streamDeepseekChat(messages, options = {}, onUpdate = () => {}) {
  try {
    // DeepSeek API请求URL
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    
    // 默认参数，启用流式输出
    const defaultOptions = {
      model: 'deepseek-chat', // DeepSeek默认模型
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.95,
      stream: true
    };
    
    // 合并选项
    const requestOptions = {
      ...defaultOptions,
      ...options,
      messages
    };
    
    // 发送请求到DeepSeek API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API错误: ${errorData.error?.message || response.statusText}`);
    }
    
    if (!response.body) {
      throw new Error('浏览器不支持Streams API');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let content = '';
    
    // 处理流式数据
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // 解码收到的数据块
      const chunk = decoder.decode(value, { stream: true });
      
      // 处理数据块（格式通常为 data: {json} 行）
      const lines = chunk.trim().split('\n\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          
          // 如果收到[DONE]，说明流结束了
          if (jsonStr === '[DONE]') {
            break;
          }
          
          try {
            const json = JSON.parse(jsonStr);
            if (json.choices && json.choices.length > 0) {
              const delta = json.choices[0].delta;
              
              // 处理增量内容
              if (delta && delta.content) {
                content += delta.content;
                onUpdate(content);
              }
              
              // 显示思考过程
              if (delta && delta.thinking) {
                onUpdate(content, delta.thinking);
              }
            }
          } catch (e) {
            console.error('解析API响应时出错:', e);
          }
        }
      }
    }
    
    // 返回完整内容
    return { role: 'assistant', content };
  } catch (error) {
    console.error('调用DeepSeek流式API时出错:', error);
    throw error;
  }
}

// 消息历史记录工具函数
export function formatChatMessages(messages) {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

// 生成聊天标题
export async function generateChatTitle(messages) {
  if (!messages || messages.length < 2) return '新的对话';
  
  try {
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
    
    // 提取最多50个字符作为标题
    if (firstUserMessage.length <= 50) {
      return firstUserMessage;
    }
    
    // 使用DeepSeek API生成更好的标题
    const titleRequest = [
      { 
        role: 'system', 
        content: '你是一个帮助提取对话主题的助手。请根据用户消息生成一个简短的标题（不超过20个字）。只返回标题文本，不要有任何其他内容。' 
      },
      { role: 'user', content: firstUserMessage }
    ];
    
    const titleResponse = await callDeepseekChat(titleRequest, {
      max_tokens: 50,
      temperature: 0.3
    });
    
    return titleResponse.content.trim() || firstUserMessage.substring(0, 50) + '...';
  } catch (error) {
    console.error('生成标题时出错:', error);
    return '新的对话';
  }
} 