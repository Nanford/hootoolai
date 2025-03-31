-- 创建订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_credits INTEGER NOT NULL DEFAULT 100,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 插入基础计划数据
INSERT INTO subscription_plans (id, name, description, monthly_credits, price, features)
VALUES 
  ('free', '免费计划', '基础功能，适合体验和轻度使用', 100, 0, '[
    "每月100积分",
    "基础AI功能",
    "标准客户支持"
  ]'::jsonb),
  ('basic', '基础计划', '更多积分，适合个人创作者', 500, 39, '[
    "每月500积分",
    "全部AI功能",
    "优先客户支持",
    "API访问"
  ]'::jsonb),
  ('pro', '专业计划', '大量积分，适合专业创作者和小型团队', 2000, 99, '[
    "每月2000积分",
    "全部AI功能",
    "高级客户支持",
    "API访问",
    "批量处理",
    "高级统计分析"
  ]'::jsonb),
  ('enterprise', '企业计划', '无限可能，适合企业和大型团队', 5000, 299, '[
    "每月5000积分",
    "全部AI功能",
    "专属客户经理",
    "API访问",
    "批量处理",
    "高级统计分析",
    "自定义功能开发",
    "团队协作"
  ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_credits = EXCLUDED.monthly_credits,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = now();

-- 创建用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  payment_id VARCHAR(100),
  payment_provider VARCHAR(20),
  payment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_plan_id_idx ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON user_subscriptions(status);

-- 创建RLS策略
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_subscriptions_select_policy ON user_subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

-- 创建触发器函数，自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_subscription_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_subscription_plans_timestamp
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_subscription_plans_updated_at();

-- 创建触发器
CREATE TRIGGER update_user_subscriptions_timestamp
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_plans_updated_at(); 