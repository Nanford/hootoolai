# HooTool AI 智能工具平台

HooTool AI是一个集成了多种人工智能功能的工具平台，旨在提供便捷高效的AI辅助创作和处理服务。平台包括AI聊天助手、图像处理、艺术卡片生成和封面生成等功能模块，帮助用户提高工作效率和创意表达能力。

## 🚀 主要功能

- **💬 AI聊天助手**: 
  - 基于DeepSeek和OpenAI大语言模型的智能对话系统
  - 支持多轮对话及上下文理解
  - 可选择不同AI模型
  - 对话历史记录保存和管理
  - 自定义消息发送方式（Enter/Ctrl+Enter）

- **🖼️ 图像处理**: 
  - 智能图像增强
  - 风格转换
  - 图像编辑和优化

- **🎨 艺术卡片生成**: 
  - 根据文本提示生成精美的艺术卡片
  - 多种风格和主题选择

- **📱 封面生成**: 
  - 为微信公众号创建专业封面
  - 小红书风格封面设计工具

## 🛠️ 技术栈

- **前端框架**: Next.js (v14.0.3)
- **UI组件**: React.js (v18.2.0)
- **样式**: Tailwind CSS (v4.0.17)
- **后端/认证**: Supabase
- **AI模型集成**: DeepSeek API, OpenAI API
- **Markdown渲染**: React Markdown
- **图标**: React Icons

## 🔧 安装与设置

### 前提条件

- Node.js 16.x 或更高版本
- npm 8.x 或更高版本
- Supabase账户
- DeepSeek和OpenAI API密钥

### 安装依赖

```bash
npm install
```

### 环境配置

创建或编辑`.env.local`文件并配置以下环境变量:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_DEEPSEEK_API_KEY=your-deepseek-api-key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
```

### 数据库设置

在Supabase中创建以下表结构：

```sql
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

-- 启用行级安全策略
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 应用行级安全策略
CREATE POLICY chat_history_select_policy ON chat_history 
  FOR SELECT USING (auth.uid() = user_id);
```

也可以运行`supabase/migrations/create_chat_history_table.sql`脚本创建表结构。

### 开发环境

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
hootoolai/
├── components/       # 可复用UI组件
├── pages/            # 页面和API路由
│   ├── api/          # API端点
│   ├── auth/         # 认证相关页面
│   ├── dashboard/    # 功能模块页面
│       ├── chat/     # AI聊天助手
│       ├── image-processing/ # 图像处理
│       ├── art-cards/ # 艺术卡片生成
│       ├── cover-generator/ # 封面生成工具
├── public/           # 静态资源
├── styles/           # CSS和样式文件
├── utils/            # 工具函数和服务
│   ├── api.js        # API调用函数
│   ├── supabase.js   # Supabase客户端配置
├── app/              # Next.js App Router (如果使用)
```

## 📱 功能亮点

### AI聊天助手

- 基于先进的大语言模型
- 支持Markdown格式输出
- 实时响应和流式输出
- 对话历史管理（创建、切换、删除）
- 持久化存储聊天记录，登录后可访问历史对话
- 模型切换功能
- 自定义消息发送设置

### 图像处理工具

- 多种处理选项
- 简洁直观的用户界面
- 高质量输出结果

## 🌐 部署

本项目可以部署到Vercel、Netlify或其他支持Next.js的平台：

```bash
# 使用Vercel CLI
vercel

# 或使用Netlify CLI
netlify deploy --prod
```

## 🔒 安全注意事项

- 环境变量中包含敏感API密钥，请确保`.env.local`文件不被提交到版本控制系统
- 在生产环境中使用适当的API密钥权限管理
- 实施适当的用户认证和授权机制

## 📝 许可证

MIT

## 👥 贡献

欢迎提交问题和拉取请求，共同改进项目。请务必遵循项目的代码风格和贡献指南。 