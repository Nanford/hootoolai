import { supabase } from '../../utils/supabase';
import { deductCredits } from '../../utils/credits';

export default async function handler(req, res) {
  // 设置CORS响应头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    // 获取当前认证的用户
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return res.status(401).json({ error: '未授权, 请先登录' });
    }

    const userId = session.user.id;
    
    // 从请求体中获取图片数据和处理指令
    const { image, instructions } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: '缺少图片数据' });
    }
    
    // 尝试扣除积分
    try {
      await deductCredits(userId, 'image_processing');
    } catch (error) {
      // 如果积分不足，返回错误
      if (error.message === '积分不足') {
        return res.status(402).json({ 
          error: '积分不足',
          message: '您的积分余额不足以使用图片处理服务',
          code: 'INSUFFICIENT_CREDITS'
        });
      }
      
      throw error; // 其他错误继续抛出
    }
    
    // 调用OpenAI API处理图片（示例实现）
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API密钥未配置' });
    }
    
    // 准备OpenAI API请求
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: image,
        prompt: instructions || '优化这张图片',
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API错误: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // 返回处理后的图片URL
    return res.status(200).json({ 
      success: true,
      url: data.data[0].url 
    });
  } catch (error) {
    console.error('处理图片请求时出错:', error);
    return res.status(500).json({ 
      error: '处理图片请求失败', 
      message: error.message 
    });
  }
} 