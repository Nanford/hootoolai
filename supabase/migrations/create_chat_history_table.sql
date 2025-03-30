-- 创建chat_history表用于存储用户聊天历史
CREATE TABLE IF NOT EXISTS chat_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '新的对话',
  last_message TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建索引用于加速按用户查询
CREATE INDEX IF NOT EXISTS chat_history_user_id_idx ON chat_history(user_id);

-- 创建RLS策略，确保用户只能访问自己的聊天记录
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_history_select_policy ON chat_history 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY chat_history_insert_policy ON chat_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY chat_history_update_policy ON chat_history 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY chat_history_delete_policy ON chat_history 
  FOR DELETE USING (auth.uid() = user_id); 