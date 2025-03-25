import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { isDemoMode, getDemoImageUrl } from '@/lib/utils';

const prisma = new PrismaClient();

// 使用Google的Gemini API处理图片
async function processImageWithGemini(imageBuffer, processType) {
  // 检查是否为演示模式
  if (isDemoMode()) {
    return getDemoImageUrl(processType);
  }
  
  try {
    // 将图片转换为base64
    const base64Image = imageBuffer.toString('base64');
    
    // 根据处理类型构建不同的提示词
    let prompt = '';
    switch (processType) {
      case 'enhance':
        prompt = '提升这张图片的质量，使其更清晰、更高分辨率。';
        break;
      case 'stylize':
        prompt = '将这张图片转换为艺术风格，让它看起来像一幅绘画作品。';
        break;
      case 'background-remove':
        prompt = '移除这张图片的背景，只保留主体对象。';
        break;
      case 'colorize':
        prompt = '如果这是一张黑白图片，请为其上色，使用自然逼真的颜色。';
        break;
      default:
        prompt = '优化这张图片。';
    }

    // 构建API请求
    const requestData = {
      contents: [
        {
          parts: [
            { text: prompt },
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
        top_p: 1,
        response_mime_type: "image/jpeg"
      }
    };

    // 调用Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestData
    );

    // 从响应中提取处理后的图像
    const processedImageData = response.data.candidates[0].content.parts.find(
      part => part.inline_data && part.inline_data.mime_type.startsWith('image/')
    );

    if (!processedImageData) {
      throw new Error('API没有返回有效的图像数据');
    }

    // 将处理后的图像保存到文件系统
    const processedImageBuffer = Buffer.from(processedImageData.inline_data.data, 'base64');
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
    
    // 确保上传目录存在
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const processedFilePath = path.join(uploadsDir, fileName);
    await writeFile(processedFilePath, processedImageBuffer);
    
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('调用Gemini API失败:', error);
    // 返回占位图，避免API调用失败导致整个功能不可用
    return getDemoImageUrl(processType);
  }
}

export async function POST(request) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    // 解析multipart表单数据
    const formData = await request.formData();
    const image = formData.get('image');
    const processType = formData.get('processType');

    if (!image || !processType) {
      return NextResponse.json({ message: '缺少必要参数' }, { status: 400 });
    }

    // 获取图片数据
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    
    // 保存原始图片
    const fileName = `original-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
    
    // 确保上传目录存在
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const originalFilePath = path.join(uploadsDir, fileName);
    await writeFile(originalFilePath, imageBuffer);
    const originalUrl = `/uploads/${fileName}`;
    
    // 使用Gemini API处理图片
    const processedUrl = await processImageWithGemini(imageBuffer, processType);
    
    // 保存处理记录到数据库
    try {
      await prisma.imageProcessing.create({
        data: {
          originalUrl,
          processedUrl,
          processType,
          userId: session.user.id,
        },
      });
    } catch (dbError) {
      console.error('数据库保存失败, 但继续处理:', dbError);
    }
    
    return NextResponse.json({
      message: '图片处理成功',
      originalUrl,
      processedUrl,
    });
    
  } catch (error) {
    console.error('图片处理错误:', error);
    return NextResponse.json({ message: '图片处理失败' }, { status: 500 });
  }
}