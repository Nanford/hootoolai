-- 创建用户积分表
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 100,  -- 默认给新用户100积分
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建索引用于加速按用户查询
CREATE INDEX IF NOT EXISTS user_credits_user_id_idx ON user_credits(user_id);

-- 创建RLS策略，确保用户只能访问自己的积分记录
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_credits_select_policy ON user_credits 
  FOR SELECT USING (auth.uid() = user_id);

-- 管理员可以插入和更新任何用户的积分
CREATE POLICY user_credits_insert_policy ON user_credits 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_credits_update_policy ON user_credits 
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建积分记录表，用于记录积分变动历史
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- 正数为增加，负数为减少
  balance INTEGER NOT NULL, -- 交易后的余额
  description TEXT NOT NULL,
  source VARCHAR(50) NOT NULL, -- 例如: 'image_processing', 'art_card', 'cover_generator', 'chat'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON credit_transactions(user_id);

-- 创建RLS策略
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY credit_transactions_select_policy ON credit_transactions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY credit_transactions_insert_policy ON credit_transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 触发器函数，自动更新user_credits表的updated_at字段
CREATE OR REPLACE FUNCTION update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_user_credits_timestamp
BEFORE UPDATE ON user_credits
FOR EACH ROW
EXECUTE FUNCTION update_user_credits_updated_at(); 