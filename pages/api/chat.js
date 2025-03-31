import { supabase } from '../../utils/supabase';
import { callDeepseekChat } from '../../utils/api';
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
    // 从请求头获取令牌
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未授权，缺少令牌' });
    }
    
    // 使用令牌验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: '未授权，无效令牌' });
    }
    
    const userId = user.id;
    
    // 从请求体中获取聊天消息和chat_id
    const { messages, chat_id, model, options, deductOnly } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '缺少聊天消息' });
    }
    
    console.log('收到聊天请求，用户ID:', userId);
    console.log('尝试扣除积分...');
    try {
      await deductCredits(userId, 'chat');
      console.log('积分扣除成功!');
      
      // 如果请求只是扣除积分，则直接返回成功
      if (deductOnly) {
        return res.status(200).json({ success: true, message: '积分扣除成功' });
      }
    } catch (error) {
      console.error('扣除积分失败:', error);
      if (error.message === '积分不足') {
        return res.status(402).json({ 
          error: '积分不足',
          message: '您的积分余额不足以使用聊天服务'
        });
      }
    }
    
    // 调用DeepSeek API
    const deepseekResponse = await callDeepseekChat(messages, {
      model: model || 'deepseek-chat',
      ...options
    });
    
    // 如果有chat_id，则更新聊天历史
    if (chat_id) {
      try {
        // 获取现有聊天记录
        const { data: chatData, error: chatError } = await supabase
          .from('chat_history')
          .select('messages, title')
          .eq('id', chat_id)
          .eq('user_id', userId)
          .single();
        
        if (!chatError && chatData) {
          // 更新聊天记录
          const updatedMessages = [
            ...chatData.messages,
            messages[messages.length - 1], // 添加用户的最新消息
            deepseekResponse // 添加AI的回复
          ];
          
          // 更新数据库中的聊天记录
          await supabase
            .from('chat_history')
            .update({
              messages: updatedMessages,
              last_message: deepseekResponse.content.substring(0, 100), // 保存部分回复内容作为预览
              updated_at: new Date().toISOString()
            })
            .eq('id', chat_id)
            .eq('user_id', userId);
        }
      } catch (error) {
        console.error('更新聊天历史出错:', error);
        // 不阻止响应，继续返回AI回复
      }
    }
    
    return res.status(200).json({ message: deepseekResponse });
  } catch (error) {
    console.error('处理聊天请求时出错:', error);
    return res.status(500).json({ 
      error: '处理聊天请求失败', 
      message: error.message 
    });
  }
} 