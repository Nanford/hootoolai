import { supabase } from '../../utils/supabase';
import { deductCredits } from '../../utils/credits';
import { Anthropic } from '@anthropic-ai/sdk';

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
    
    // 从请求体中获取封面生成参数
    const { title, platform, style, mood } = req.body;
    
    if (!title || !platform) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 尝试扣除积分
    try {
      await deductCredits(userId, 'cover_generator');
    } catch (error) {
      // 如果积分不足，返回错误
      if (error.message === '积分不足') {
        return res.status(402).json({ 
          error: '积分不足',
          message: '您的积分余额不足以使用封面生成服务',
          code: 'INSUFFICIENT_CREDITS'
        });
      }
      
      throw error; // 其他错误继续抛出
    }
    
    // 获取Anthropic API密钥
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicApiKey) {
      return res.status(500).json({ error: 'Anthropic API密钥未配置' });
    }
    
    // 初始化Anthropic客户端
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });
    
    // 准备提示词
    const platformText = platform === 'wechat' ? '微信公众号' : '小红书';
    const styleText = style || '现代简约';
    const moodText = mood || '专业';
    
    // 构建用户提示
    const userPrompt = `请帮我设计一个吸引人的${platformText}封面HTML。

标题: "${title}"
风格: ${styleText}
情感基调: ${moodText}

要求:
1. 使用HTML和CSS设计
2. 使用中文字体，包括serif和sans-serif两种风格
3. 响应式设计，适合移动设备查看
4. 根据平台特点优化设计:
   - ${platform === 'wechat' ? '微信公众号: 适合方形设计，标题突出，简洁大方' : '小红书: 鲜艳色彩，吸引眼球，标题文字大且清晰'}
5. 使用Font Awesome图标和Tailwind CSS样式

请提供一个完整的HTML文件，只返回HTML代码，不要有任何解释或说明。`;

    // 调用Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });
    
    // 从响应中提取HTML代码
    const htmlContent = message.content && message.content[0] && message.content[0].text 
      ? message.content[0].text 
      : '<div>无法生成HTML内容</div>';
    
    return res.status(200).json({ html: htmlContent });
  } catch (error) {
    console.error('生成封面时出错:', error);
    return res.status(500).json({ 
      error: '生成封面请求失败', 
      message: error.message 
    });
  }
} 