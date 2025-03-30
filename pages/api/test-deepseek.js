// API路由，用于测试DeepSeek API连接

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许POST请求' });
  }

  try {
    // 从环境变量获取API密钥
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: '未找到DeepSeek API密钥。请在.env.local文件中设置NEXT_PUBLIC_DEEPSEEK_API_KEY。' });
    }

    // 设置简单的消息来测试API
    const messages = [
      { role: 'system', content: '你是一个测试连接的助手。请简短回复。' },
      { role: 'user', content: '测试连接，请回复"连接成功"。' }
    ];

    // 准备请求参数
    const requestOptions = {
      model: 'deepseek-chat',
      messages,
      max_tokens: 50,
      temperature: 0.5
    };

    // 发送请求到DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });

    // 解析响应
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`DeepSeek API错误: ${data.error?.message || response.statusText}`);
    }

    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '连接成功',
      data: data
    });
  } catch (error) {
    console.error('测试DeepSeek API连接时出错:', error);
    
    return res.status(500).json({
      success: false,
      message: '连接失败',
      error: error.message
    });
  }
} 