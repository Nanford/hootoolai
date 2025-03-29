# HooTool AI 智能工具平台

HooTool AI是一个集成了多种人工智能功能的工具平台，旨在提供便捷高效的AI辅助创作和处理服务。平台包括图像处理、艺术卡片生成、封面生成和AI助手等功能模块。

## 技术栈

- **前端框架**: Next.js
- **样式**: Tailwind CSS
- **后端/认证**: Supabase
- **开发语言**: JavaScript/React

## 功能特点

- 🖼️ **图像处理**: 智能图像增强、风格转换和编辑
- 🎨 **艺术卡片生成**: 根据文本提示生成精美的艺术卡片
- 📱 **封面生成**: 为微信公众号和小红书创建专业封面
- 💬 **AI聊天助手**: 智能对话和内容创作辅助

## 快速开始

### 安装依赖

```bash
npm install
```

### 环境配置

创建`.env.local`文件（已有）并配置Supabase凭证:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

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

## 项目结构

```
hootoolai/
├── components/       # 可复用UI组件
├── pages/            # 页面和API路由
│   ├── api/          # API端点
│   ├── auth/         # 认证相关页面
│   ├── dashboard/    # 功能模块页面
├── public/           # 静态资源
├── styles/           # CSS和样式文件
├── utils/            # 工具函数和服务
```

## 部署

本项目可以部署到Vercel或其他支持Next.js的平台：

```bash
# 使用Vercel CLI
vercel
```

## 贡献

欢迎提交问题和拉取请求，共同改进项目。 