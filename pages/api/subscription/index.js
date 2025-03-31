import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  // 设置CORS响应头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只支持GET请求' });
  }

  try {
    // 获取当前认证的用户
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return res.status(401).json({ error: '未授权, 请先登录' });
    }

    const userId = session.user.id;
    
    // 查询用户的订阅信息
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        plan_id,
        status,
        starts_at,
        expires_at,
        auto_renew,
        subscription_plans (
          id,
          name,
          description,
          monthly_credits,
          price,
          currency,
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116是找不到记录的错误
      throw new Error(`获取订阅信息失败: ${subscriptionError.message}`);
    }
    
    // 如果没有找到订阅记录，则用户为免费用户
    const userPlan = subscription 
      ? subscription 
      : {
          plan_id: 'free',
          subscription_plans: {
            id: 'free',
            name: '免费计划',
            description: '基础功能，适合体验和轻度使用',
            monthly_credits: 100,
            price: 0,
            currency: 'CNY',
            features: ['每月100积分', '基础AI功能', '标准客户支持']
          }
        };
    
    return res.status(200).json(userPlan);
  } catch (error) {
    console.error('获取订阅信息错误:', error);
    return res.status(500).json({ error: '获取订阅信息失败', message: error.message });
  }
} 