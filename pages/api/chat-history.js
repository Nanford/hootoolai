import { supabase } from '../../utils/supabase';

// 处理认证中间件
const withAuth = (handler) => async (req, res) => {
  // 从请求头中获取访问令牌
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权', message: '缺少认证令牌' });
  }
  
  // 验证令牌
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: '未授权', message: '无效的认证令牌' });
  }
  
  // 在请求对象上设置用户ID
  req.userId = user.id;
  
  // 调用实际的处理程序
  return handler(req, res);
};

// API路由处理程序
const handler = async (req, res) => {
  const { method } = req;
  const userId = req.userId;
  
  switch (method) {
    // 获取聊天历史列表
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: '服务器错误', message: error.message });
      }
    
    // 创建新的聊天
    case 'POST':
      try {
        const { title, messages } = req.body;
        const now = new Date().toISOString();
        const id = `chat-${Date.now()}`;
        
        const { data, error } = await supabase
          .from('chat_history')
          .insert({
            id,
            user_id: userId,
            title: title || '新的对话',
            messages: messages || [],
            created_at: now,
            updated_at: now
          })
          .select();
        
        if (error) throw error;
        
        return res.status(201).json(data[0]);
      } catch (error) {
        return res.status(500).json({ error: '服务器错误', message: error.message });
      }
    
    // 不支持的方法
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: '方法不允许', message: `${method} 方法不支持` });
  }
};

// 导出包装了认证的处理程序
export default withAuth(handler); 