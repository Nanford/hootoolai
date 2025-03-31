import { supabase } from '../../../utils/supabase';
import { getUserCredits } from '../../../utils/credits';

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
    // 从查询参数中获取userId
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID参数' });
    }
    
    // 获取用户积分
    const credits = await getUserCredits(userId);
    
    return res.status(200).json({ credits });
  } catch (error) {
    console.error('获取用户积分错误:', error);
    return res.status(500).json({ error: '获取用户积分失败', message: error.message });
  }
} 