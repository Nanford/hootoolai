import { supabase } from '../../../utils/supabase';
import { getUserCreditTransactions } from '../../../utils/credits';

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
    
    // 获取分页参数
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    
    // 获取用户积分交易历史
    const { transactions, count } = await getUserCreditTransactions(userId, limit, page);
    
    return res.status(200).json({ 
      transactions, 
      count,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户积分交易历史错误:', error);
    return res.status(500).json({ error: '获取用户积分交易历史失败', message: error.message });
  }
} 