import { supabase } from '../../../utils/supabase';
import { updateUserCredits } from '../../../utils/credits';

export default async function handler(req, res) {
  // 设置CORS响应头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
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
    
    // 从请求体中获取购买的积分数量和支付信息
    const { amount, paymentId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: '积分数量必须大于0' });
    }
    
    // 这里应该有支付验证逻辑
    // 在实际应用中，此处应该验证paymentId是否有效，是否已支付成功
    // 例如调用支付服务商的API验证支付状态
    
    // 假设支付已验证成功，为用户添加积分
    const newCredits = await updateUserCredits(
      userId, 
      amount, 
      `购买${amount}积分`, 
      'purchase'
    );
    
    return res.status(200).json({ 
      success: true, 
      message: '积分购买成功',
      credits: newCredits
    });
  } catch (error) {
    console.error('购买积分错误:', error);
    return res.status(500).json({ error: '购买积分失败', message: error.message });
  }
} 