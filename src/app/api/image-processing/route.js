import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const prisma = new PrismaClient();

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

    // 处理表单数据
    const formData = await request.formData();
    const image = formData.get('image');
    const processType = formData.get('processType');
    const customPrompt = formData.get('customPrompt');

    if (!image) {
      return NextResponse.json(
        { message: '请提供图片' }, 
        { status: 400 }
      );
    }

    // 获取图片缓冲区
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 使用sharp处理图片（准备发送到API）
    const processedBuffer = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    // 将图片转为Base64格式，以便发送到Gemini API
    const base64Image = processedBuffer.toString('base64');

    // 处理图片的函数
    let result;
    if (processType === 'description') {
      // 图片描述功能使用Gemini的Vision API
      result = await generateImageDescription(base64Image);
    } else if (processType === 'custom' && customPrompt) {
      // 使用自定义提示词处理图片
      result = await processImageWithCustomPrompt(base64Image, customPrompt);
    } else {
      // 其他处理类型
      result = await processImageWithGemini(base64Image, processType);
    }

    // 保存处理记录到数据库
    let processedImageUrl = '';
    
    if (result.processedImageBase64) {
      // 如果返回了处理后的图片，保存到本地
      const outputDir = path.join(process.cwd(), 'public', 'processed-images');
      
      // 确保目录存在
      if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // 生成唯一的文件名
      const timestamp = Date.now();
      const filename = `${session.user.id}_${timestamp}.png`;
      const outputPath = path.join(outputDir, filename);
      
      // 解码Base64并保存为文件
      fs.writeFileSync(outputPath, Buffer.from(result.processedImageBase64, 'base64'));
      
      // 生成URL
      processedImageUrl = `/processed-images/${filename}`;
      
      // 保存处理记录到数据库
      await prisma.imageProcessing.create({
        data: {
          originalUrl: `/temp/${image.name}`, // 这里简化处理，实际应存储原图
          processedUrl: processedImageUrl,
          processType: processType === 'custom' ? `custom-${customPrompt.substring(0, 30)}...` : processType,
          userId: session.user.id
        }
      });
    }

    return NextResponse.json({
      processedImageUrl: processedImageUrl || null,
      description: result.description || null
    });
    
  } catch (error) {
    console.error('处理图片时出错:', error);
    return NextResponse.json(
      { message: '处理图片失败: ' + error.message }, 
      { status: 500 }
    );
  }
}

// 使用Gemini API进行图片描述
async function generateImageDescription(base64Image) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
    
    const response = await axios.post(
      `${apiEndpoint}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: "请详细描述这张图片中的内容，用中文回答。"
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.4,
          top_p: 0.95,
          max_output_tokens: 1024
        }
      }
    );

    // 获取响应文本
    const description = response.data.candidates[0].content.parts[0].text;
    
    return {
      description,
      processedImageBase64: null // 描述模式不返回处理后的图片
    };
  } catch (error) {
    console.error('调用Gemini API生成描述时出错:', error);
    throw new Error('生成图片描述失败');
  }
}

// 使用自定义提示词处理图片
async function processImageWithCustomPrompt(base64Image, customPrompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
    
    const promptText = `请根据以下指令处理这张图片：${customPrompt}。
只返回一张处理后的完整图片，不要返回任何文字说明或边框。确保图片质量高，细节清晰。`;
    
    const response = await axios.post(
      `${apiEndpoint}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: promptText
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.2,
          top_p: 0.95,
          max_output_tokens: 2048
        }
      }
    );

    // 解析响应
    // 注意：此处假设Gemini返回一个base64编码的图片
    // 实际上，需要根据API的真实返回内容进行调整
    const responseData = response.data;
    
    // 模拟处理后的图片返回，根据实际API调整
    // 在实际情况下，可能需要从响应中提取base64图片
    return {
      processedImageBase64: base64Image, // 这里暂时返回原图，实际情况下应返回处理后的图片
      description: null
    };
  } catch (error) {
    console.error('调用Gemini API处理图片时出错:', error);
    throw new Error('处理图片失败');
  }
}

// 使用Gemini API进行图片处理
async function processImageWithGemini(base64Image, processType) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
    
    // 根据处理类型确定提示词
    let promptText = '';
    switch(processType) {
      case 'enhance':
        promptText = "请增强这张图片的质量，提高清晰度、对比度和色彩。返回一个经过处理的高质量图片。输出结果仅包含一张完整的处理后图片，不要有任何文字说明。";
        break;
      case 'style':
        promptText = "请将这张图片转换为油画风格。返回一个艺术效果的图片。输出结果仅包含一张完整的风格化后的图片，不要有任何文字说明。";
        break;
      case 'remove-bg':
        promptText = "请去除这张图片的背景，只保留主体。返回一个透明背景的图片。输出结果仅包含一张完整的去背景后的图片，不要有任何文字说明。";
        break;
      case 'colorize':
        promptText = "如果这是一张黑白图片，请为它上色。返回一个彩色版本的图片。输出结果仅包含一张完整的上色后的图片，不要有任何文字说明。";
        break;
      default:
        promptText = "请增强这张图片的质量。返回一个经过处理的高质量图片。输出结果仅包含一张完整的处理后图片，不要有任何文字说明。";
    }
    
    const response = await axios.post(
      `${apiEndpoint}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: promptText
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.2,
          top_p: 0.95,
          max_output_tokens: 2048
        }
      }
    );

    // 解析响应
    // 注意：此处假设Gemini返回一个base64编码的图片
    // 实际上，需要根据API的真实返回内容进行调整
    const responseData = response.data;
    
    // 模拟处理后的图片返回，根据实际API调整
    // 在实际情况下，可能需要从响应中提取base64图片
    return {
      processedImageBase64: base64Image, // 这里暂时返回原图，实际情况下应返回处理后的图片
      description: null
    };
  } catch (error) {
    console.error('调用Gemini API处理图片时出错:', error);
    throw new Error('处理图片失败');
  }
} 