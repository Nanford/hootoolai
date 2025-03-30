import { supabase } from '../../../utils/supabase';

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
  const { id } = req.query;
  
  // 验证聊天ID
  if (!id) {
    return res.status(400).json({ error: '无效请求', message: '缺少聊天ID' });
  }
  
  switch (method) {
    // 获取单个聊天详情
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ error: '未找到', message: '聊天记录不存在' });
          }
          throw error;
        }
        
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: '服务器错误', message: error.message });
      }
    
    // 更新聊天记录
    case 'PUT':
      try {
        const { title, last_message, messages } = req.body;
        const updateData = {};
        
        // 只更新提供的字段
        if (title !== undefined) updateData.title = title;
        if (last_message !== undefined) updateData.last_message = last_message;
        if (messages !== undefined) updateData.messages = messages;
        
        // 始终更新时间戳
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('chat_history')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', userId)
          .select();
        
        if (error) throw error;
        
        if (data.length === 0) {
          return res.status(404).json({ error: '未找到', message: '聊天记录不存在或无权限修改' });
        }
        
        return res.status(200).json(data[0]);
      } catch (error) {
        return res.status(500).json({ error: '服务器错误', message: error.message });
      }
    
    // 删除聊天记录
    case 'DELETE':
      try {
        const { error } = await supabase
          .from('chat_history')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        
        if (error) throw error;
        
        return res.status(200).json({ success: true, message: '聊天记录已删除' });
      } catch (error) {
        return res.status(500).json({ error: '服务器错误', message: error.message });
      }
    
    // 不支持的方法
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: '方法不允许', message: `${method} 方法不支持` });
  }
};

// 导出包装了认证的处理程序
export default withAuth(handler); 