# HooTool AI - 智能AI工具平台

HooTool AI是一个综合性的AI工具平台，提供多种AI驱动的服务，包括图片处理和艺术卡片生成。项目使用Next.js开发，结合了最先进的AI API来提供高质量的AI生成内容。

## 主要功能

- **用户认证系统**
  - 邮箱注册和登录
  - 邮箱验证
  - 密码重置
  - 个人资料管理

- **AI图片处理**（由Google Gemini提供支持）
  - 画质增强
  - 风格转换
  - 背景移除
  - 黑白图片上色

- **AI艺术卡片生成**（由Anthropic Claude 3.7 Sonnet提供支持）
  - 多种艺术风格选择
  - 可自定义氛围和光线
  - 支持详细的提示词定制
  - 多种输出尺寸比例

## 技术栈

- **前端**：Next.js, React, TailwindCSS
- **后端**：Next.js API Routes
- **数据库**：SQLite (Prisma ORM)
- **认证**：NextAuth.js
- **AI API**：
  - Anthropic Claude 3.7 Sonnet API (艺术卡片生成)
  - Google Gemini API (图片处理)

## 本地开发

### 准备工作

1. 克隆仓库:
```bash
git clone https://your-repository-url.git
cd hootoolai
```

2. 安装依赖:
```bash
npm install
```

3. 配置环境变量:
重命名`.env.example`为`.env.local`并填写相关API密钥和配置信息。

4. 初始化数据库:
```bash
npx prisma migrate dev
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 环境变量配置

项目需要以下环境变量:

- `DATABASE_URL`: 数据库连接URL
- `NEXTAUTH_URL`: NextAuth URL (开发环境为http://localhost:3000)
- `NEXTAUTH_SECRET`: NextAuth密钥
- `EMAIL_SERVER_*`: 邮件服务器配置
- `ANTHROPIC_API_KEY`: Anthropic Claude API密钥
- `GEMINI_API_KEY`: Google Gemini API密钥

## 部署

项目可以部署到Vercel等支持Next.js的平台:

```bash
npm run build
```

## 许可证

本项目使用MIT许可证
