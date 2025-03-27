import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { Anthropic } from '@anthropic-ai/sdk';

const prisma = new PrismaClient();

// 从prompt文件提取的设计风格
const designStyles = [
  { 
    id: 'minimalist', 
    name: '极简主义风格',
    description: '采用极简主义风格设计，遵循"少即是多"的理念。使用大量留白创造呼吸空间，仅保留最必要的元素。配色方案限制在2-3种中性色，主要为白色背景配以黑色或深灰色文字。排版应精确到像素级别，使用精心设计的网格系统和黄金比例。字体选择无衬线字体如Helvetica或Noto Sans，字重变化作为主要层次手段。装饰元素几乎为零，仅使用极细的分隔线和微妙的阴影。整体设计应呈现出克制、优雅且永恒的美学，让内容本身成为焦点。'
  },
  { 
    id: 'bold_modern', 
    name: '大胆现代风格',
    description: '采用大胆现代风格设计，打破传统排版规则，创造强烈视觉冲击。使用鲜艳对比色如荧光粉、电子蓝、亮黄等，背景可使用深色或鲜艳色块。排版应不对称且动态，标题文字极大（至少60px），可使用极粗字重或压缩字体，甚至允许文字重叠和溢出。图形元素应用几何形状，边缘锐利，可添加不规则裁切效果。层次感通过大小、颜色和位置的极端对比创造。整体设计应充满张力和活力，像一张视觉宣言。'
  },
  { 
    id: 'elegant_vintage', 
    name: '优雅复古风格',
    description: '采用优雅复古风格设计，重现20世纪初期印刷品的精致美学。使用米色或淡黄色纸张质感背景，配以深棕、暗红等老式印刷色。字体必须使用衬线字体如Baskerville或Noto Serif，标题可使用装饰性字体。排版应对称且庄重，遵循传统书籍设计原则。装饰元素包括精致的花纹边框、古典分隔线和角落装饰，可添加轻微做旧效果如纸张纹理和微妙污点。图像应用复古滤镜处理，呈现褪色照片效果。整体设计应散发出典雅、成熟且历经时间考验的气质。'
  },
  { 
    id: 'futuristic', 
    name: '极致未来主义风格',
    description: '采用极致未来主义风格设计，灵感源于科幻电影与赛博朋克美学。配色选择金属质感的银灰色、荧光紫、霓虹绿与深邃的黑色背景形成强烈对比。字体应使用几何感强烈的无衬线字体，如Orbitron或Exo，搭配科技感十足的数字装饰元素。排版偏向非线性，文字和图片可采用悬浮式错落布局，添加立体效果或全息感的视觉元素。细节处融入发光边框或渐变镭射背景效果。整体设计应传递一种尖端科技与未来奢华相结合的视觉张力。'
  },
  { 
    id: 'contemporary_art', 
    name: '当代艺术风格',
    description: '采用当代艺术风格设计，以现代艺术展览般的形式呈现内容。版面大量运用白色背景和明亮、纯净的艺术配色如柠檬黄、天蓝、橘色等作为点缀。排版自由、开放，图片位置不规则却平衡感十足。字体以艺术感明显的无衬线或装饰字体为主，如Futura或Playfair Display，允许文字巧妙融入图像或艺术作品之中。装饰元素选用抽象几何图案、泼墨效果或手绘线条增强艺术氛围。整体设计应体现出对现代艺术的致敬，创造出如同逛画廊一般高端而富有艺术性的视觉体验。'
  },
  { 
    id: 'luxury_baroque', 
    name: '奢华巴洛克风格',
    description: '采用奢华巴洛克风格设计，以17世纪欧洲宫廷风格为灵感，表现极致华丽与戏剧感。配色以皇家深紫、翡翠绿、宝石蓝和浓郁的金色为主，背景可添加丝绒或绸缎般的纹理质感。字体选择经典繁复的衬线或装饰字体，如Great Vibes或Italianno，文字间距宽松，展现优雅气质。装饰元素大量使用富丽堂皇的镶边、金箔纹理、宫廷风花卉图案以及精致的卷草纹饰，创造奢华层次感。图片采用精美的古典油画效果或高贵质感的摄影大片。整体设计必须传达出高贵、繁复而不失品味的贵族气息。'
  },
  { 
    id: 'organic_natural', 
    name: '有机自然风格',
    description: '采用有机自然风格设计，强调与自然亲密接触的奢华体验。整体配色基于大地色系，如奶油色、卡其色、橄榄绿和浅棕色，背景可融入木材纹理或亚麻布料质感。字体选择细致优雅的无衬线字体或手写风格字体，如Lora或Montserrat，排版应松散自由，文字留出充分的呼吸空间，给人放松感。装饰元素包括自然线条图案、手绘植物插画、树叶或水墨式的图案装饰。图片运用大量柔和的自然光影、胶片质感或微妙的暖色滤镜。整体设计应传达安静、平和而高级的自然奢华感受。'
  },
  { 
    id: 'art_nouveau', 
    name: '新艺术主义风格',
    description: '采用新艺术主义风格设计，致敬19世纪末至20世纪初欧洲经典风潮。配色选择柔和的粉色、淡绿色、丁香紫与金色或铜色等柔和而浪漫的组合，背景运用淡雅渐变或轻微褪色效果。字体以装饰性曲线明显的衬线字体为主，如Metamorphous或Cinzel Decorative，排版曲线流畅，整体感觉柔美且富有韵律感。装饰元素大量采用优美弧线、植物藤蔓、花卉与昆虫图案，创造和谐且华丽的视觉印象。图片应采用柔焦、柔光效果或插画形式呈现出梦幻般的视觉效果。整体设计应体现出浪漫、柔美与艺术气息。'
  }
];

// 初始化Anthropic客户端
// 在服务器组件级别创建，避免每次请求都初始化
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: '请先登录再使用此功能' }, 
        { status: 401 }
      );
    }

    // 解析请求数据
    const body = await request.json();
    const { prompt, style } = body;

    if (!prompt) {
      return NextResponse.json(
        { message: '请提供创作提示词' }, 
        { status: 400 }
      );
    }

    // 调用Claude API生成艺术卡片HTML
    const htmlContent = await generateArtCardHtml(prompt, style);
    
    if (!htmlContent) {
      return NextResponse.json(
        { message: '生成艺术卡片失败' }, 
        { status: 500 }
      );
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const filename = `${session.user.id}_${timestamp}.html`;
    
    // 保存HTML文件到本地文件系统
    const outputDir = path.join(process.cwd(), 'public', 'generated-art');
    
    // 确保目录存在
    if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, htmlContent);
    
    // 生成URL
    const htmlUrl = `/generated-art/${filename}`;
    
    // 保存记录到数据库
    await prisma.artwork.create({
      data: {
        title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
        prompt: prompt,
        imageUrl: htmlUrl, // 使用同一字段但存储HTML URL
        userId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      imageUrl: htmlUrl, // 为保持前端兼容性，仍使用imageUrl字段
      htmlContent: htmlContent // 同时返回HTML内容供前端直接显示
    });
    
  } catch (error) {
    console.error('生成艺术卡片时出错:', error);
    return NextResponse.json(
      { message: `生成艺术卡片失败: ${error.message || '未知错误'}` }, 
      { status: 500 }
    );
  }
}

// 使用Claude API生成艺术卡片HTML
async function generateArtCardHtml(prompt, style) {
  try {
    console.log('开始生成艺术卡片HTML...');
    
    // 找到匹配的设计风格描述
    const styleInfo = designStyles.find(s => s.id === style) 
      || designStyles.find(s => s.id === 'contemporary_art'); // 默认使用当代艺术风格
    
    // 构建更丰富的提示词
    const currentDate = new Date().toISOString().split('T')[0]; // 格式：YYYY-MM-DD
    
    // 基于prompt文件模板构建完整提示词
    const fullPrompt = `
你是一名国际顶尖的数字杂志艺术总监和前端开发专家，曾为Vogue、Elle等时尚杂志设计过数字版面，擅长将奢华杂志美学与现代网页设计完美融合，创造出令人惊艳的视觉体验。

请根据以下设计风格和主题内容，创建一个HTML格式的精美艺术卡片：

**设计风格描述：**
${styleInfo.description}

**设计元素要求：**
- 日期区域：以风格特有的方式呈现日期 ${currentDate}
- 标题和副标题：根据风格调整字体、大小、排版方式
- 引用区块：设计独特的引用样式，体现风格特点
- 核心要点列表：以符合风格的方式呈现内容
- 二维码区域：将二维码融入整体设计，使用此图片URL：https://img.picui.cn/free/2025/03/25/67e1a631794da.jpg
- 编辑笔记/小贴士：设计成符合风格的边栏或注释

**技术规范：**
- 使用HTML5、Tailwind CSS和必要的JavaScript
- 引入Tailwind CSS: https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css
- 引入Font Awesome: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css
- 中文字体: https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap
- 可以添加微妙的动效，如页面载入时的淡入效果或悬停反馈
- 使用CSS变量管理颜色和间距，便于风格统一
- 设计宽度为400px，高度不超过960px
- 确保代码简洁高效，注重性能和可维护性

**主题内容：**
${prompt}

请创建一个高质量的${styleInfo.name}艺术卡片HTML，确保设计符合上述风格描述，并传达出"这不是普通的信息卡片，而是一件可收藏的数字艺术品"的感觉。只返回有效的、完整的HTML代码，不要包含markdown代码块标记或其他说明内容。`;

    console.log('发送请求到Claude API...');
    console.time('Claude API响应时间');
    
    // 使用Anthropic SDK发送请求
    // 确保完全匹配testclaude.js中的模型名称
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: fullPrompt
        }
      ],
      temperature: 0.7
    });
    
    console.timeEnd('Claude API响应时间');
    console.log('Claude API响应成功，处理结果...');
    
    // 检查响应
    if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
      console.error('错误: API返回了空响应');
      throw new Error('API返回了空响应');
    }
    
    // 从响应中提取HTML内容
    let htmlContent = '';
    for (const part of response.content) {
      if (part.type === 'text') {
        htmlContent += part.text;
        break;
      }
    }
    
    // 清理HTML内容，移除可能的Markdown代码块
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '').trim();
    
    // 如果没有找到HTML内容，抛出错误
    if (!htmlContent) {
      console.error('Claude API响应中找不到HTML内容');
      throw new Error('API返回中没有找到HTML内容');
    }
    
    console.log('生成艺术卡片成功, HTML长度:', htmlContent.length);
    console.log('使用的tokens数量:', 
      response.usage ? `${response.usage.input_tokens + response.usage.output_tokens} (输入: ${response.usage.input_tokens}, 输出: ${response.usage.output_tokens})` : '未知');
    
    return htmlContent;
  } catch (error) {
    console.error('调用Claude API生成艺术卡片HTML时出错:', error);
    
    // 提供更详细的错误信息
    if (error.status) console.error('HTTP状态码:', error.status);
    if (error.error) console.error('错误详情:', JSON.stringify(error.error, null, 2));
    
    // 构建更具体的错误消息
    let errorMessage = '调用AI生成艺术卡片失败';
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    if (error.status) {
      errorMessage += ` (状态码: ${error.status})`;
    }
    
    throw new Error(errorMessage);
  }
} 