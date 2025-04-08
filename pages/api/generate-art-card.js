// API端点：调用Anthropic API生成艺术卡片HTML
import { Anthropic } from '@anthropic-ai/sdk';
import { supabase } from '../../utils/supabase';
import { deductCredits } from '../../utils/credits';

export default async function handler(req, res) {
  // 设置CORS响应头，允许前端调用这个API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    // 从请求头获取令牌
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未授权，缺少令牌' });
    }
    
    // 使用令牌验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: '未授权，无效令牌' });
    }

    const userId = user.id;
    
    const { topic, style } = req.body;

    if (!topic || !style) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 尝试扣除积分
    try {
      await deductCredits(userId, 'art_card');
    } catch (error) {
      // 如果积分不足，返回错误
      if (error.message === '积分不足') {
        return res.status(402).json({ 
          error: '积分不足',
          message: '您的积分余额不足以使用艺术卡片生成服务',
          code: 'INSUFFICIENT_CREDITS'
        });
      }
      
      throw error; // 其他错误继续抛出
    }

    // Anthropic API密钥应从环境变量获取
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    
    // 添加调试日志
    console.log('API Key 可用:', !!anthropicApiKey);
    console.log('API Key 长度:', anthropicApiKey ? anthropicApiKey.length : 0);
    
    if (!anthropicApiKey) {
      return res.status(500).json({ error: 'Anthropic API密钥未配置' });
    }

    // 风格描述映射
    const styleDescriptions = {
      'minimalist': '极简主义风格 (Minimalist): 采用极简主义风格设计，遵循"少即是多"的理念。使用大量留白创造呼吸空间，仅保留最必要的元素。配色方案限制在2-3种中性色，主要为白色背景配以黑色或深灰色文字。',
      'bold-modern': '大胆现代风格 (Bold Modern): 采用大胆现代风格设计，打破传统排版规则，创造强烈视觉冲击。使用鲜艳对比色如荧光粉、电子蓝、亮黄等，背景可使用深色或鲜艳色块。',
      'elegant-vintage': '优雅复古风格 (Elegant Vintage): 采用优雅复古风格设计，重现20世纪初期印刷品的精致美学。使用米色或淡黄色纸张质感背景，配以深棕、暗红等老式印刷色。',
      'futuristic-glam': '极致未来主义风格 (Futuristic Glam): 采用极致未来主义风格设计，灵感源于科幻电影与赛博朋克美学。配色选择金属质感的银灰色、荧光紫、霓虹绿与深邃的黑色背景形成强烈对比。',
      'contemporary-art': '当代艺术风格 (Contemporary Art): 采用当代艺术风格设计，以现代艺术展览般的形式呈现内容。版面大量运用白色背景和明亮、纯净的艺术配色如柠檬黄、天蓝、橘色等作为点缀。',
      'luxury-baroque': '奢华巴洛克风格 (Luxury Baroque): 采用奢华巴洛克风格设计，以17世纪欧洲宫廷风格为灵感，表现极致华丽与戏剧感。配色以皇家深紫、翡翠绿、宝石蓝和浓郁的金色为主。',
      'organic-natural': '有机自然风格 (Organic Natural): 采用有机自然风格设计，强调与自然亲密接触的奢华体验。整体配色基于大地色系，如奶油色、卡其色、橄榄绿和浅棕色。',
      'art-nouveau': '新艺术主义风格 (Art Nouveau): 采用新艺术主义风格设计，致敬19世纪末至20世纪初欧洲经典风潮。配色选择柔和的粉色、淡绿色、丁香紫与金色或铜色等柔和而浪漫的组合。'
    };

    // 获取当前风格的描述
    const styleDescription = styleDescriptions[style] || `自定义风格: ${style}`;

    // 构建用户提示而非系统提示
    const userPrompt = `我需要你扮演一位国际顶尖的数字杂志艺术总监和前端开发专家，为我创建一个"${topic}"主题的精美杂志卡片HTML。

请使用以下设计风格：${styleDescription}

设计必须包含以下元素，但视觉表现与风格相符：
* 日期区域：以所选风格特有的方式呈现日期（2025-03-23）
* 标题和副标题：根据风格调整字体、大小、排版方式，主标题为"${topic}"
* 引用区块：设计独特的引用样式，体现风格特点
* 核心要点列表：以符合风格的方式呈现列表内容（至少4点）
* 二维码区域：将二维码融入整体设计，图片链接：https://img.picui.cn/free/2025/03/25/67e1a631794da.jpg
* 编辑笔记/小贴士：设计成符合风格的边栏或注释

技术规范：
* 使用HTML5和CSS
* 添加以下外部资源：
  * Font Awesome: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css
  * Tailwind CSS: https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css
  * 中文字体: https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap

请提供一个完整的HTML文件，宽度为400px，高度不超过1280px。永远用中文输出，装饰元素可用法语、英语等其他语言显得有品位。只返回完整的HTML代码，不要有任何解释或说明。`;

    // 初始化Anthropic客户端
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    console.log('正在调用Anthropic API生成艺术卡片...');
    
    try {
      // 构建请求结构
      const requestData = {
        model: 'claude-3-7-sonnet-20250219', // 使用经过验证可用的模型
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      };
      
      // 输出请求结构到日志
      console.log('发送到Anthropic API的请求结构:', JSON.stringify(requestData, null, 2));
      
      // 使用官方SDK调用API
      const message = await anthropic.messages.create(requestData);
      
      // 输出API响应内容
      console.log('API响应状态: 成功');
      console.log('API响应内容摘要:', JSON.stringify({
        id: message.id,
        model: message.model,
        type: message.type,
        role: message.role,
        content_length: message.content ? message.content.length : 0,
        stop_reason: message.stop_reason,
        usage: message.usage
      }, null, 2));
      
      // 从响应中提取HTML代码
      const htmlContent = message.content && message.content[0] && message.content[0].text 
        ? message.content[0].text 
        : '<div>无法生成HTML内容</div>';
      
      return res.status(200).json({ html: htmlContent });
    } catch (error) {
      console.error('Anthropic API错误:', error.message, error.status);
      
      // 返回更友好的错误信息
      return res.status(error.status || 500).json({ 
        error: '调用Anthropic API失败',
        message: error.message,
        status: error.status,
        type: error.type,
        details: error.response
      });
    }
  } catch (error) {
    console.error('生成艺术卡片错误:', error);
    return res.status(500).json({ 
      error: '处理请求时出错', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}