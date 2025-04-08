-- 创建图像处理历史记录表
CREATE TABLE IF NOT EXISTS image_processing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image TEXT,  -- 原始图像的路径或URL（可以为空）
  result_image TEXT NOT NULL,  -- 处理后图像的路径或URL
  process_type VARCHAR(50) NOT NULL,  -- 处理类型：enhance, style, remove-bg, etc.
  style_option VARCHAR(50),  -- 风格选项（对于风格转换）
  intensity INTEGER,  -- 处理强度（百分比）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS image_processing_history_user_id_idx ON image_processing_history(user_id);
CREATE INDEX IF NOT EXISTS image_processing_history_process_type_idx ON image_processing_history(process_type);
CREATE INDEX IF NOT EXISTS image_processing_history_created_at_idx ON image_processing_history(created_at);

-- 设置RLS策略
ALTER TABLE image_processing_history ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的处理记录
CREATE POLICY image_processing_history_select_policy ON image_processing_history 
  FOR SELECT USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的处理记录
CREATE POLICY image_processing_history_insert_policy ON image_processing_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建触发器函数：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_image_processing_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_image_processing_history_timestamp
BEFORE UPDATE ON image_processing_history
FOR EACH ROW
EXECUTE FUNCTION update_image_processing_history_updated_at(); 