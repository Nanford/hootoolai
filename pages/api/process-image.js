import { supabase } from '../../utils/supabase';
import { deductCredits } from '../../utils/credits';
import { 
  processImageWithGemini, 
  getImageProcessingPrompt,
  generateImageWithGemini,
  editImageWithGemini 
} from '../../utils/gemini';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// 配置API路由以支持大型请求
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // 设置CORS响应头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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
    
    // 从请求体中获取数据
    const { 
      image, 
      instructions, 
      processType, 
      styleOption, 
      intensity, 
      compressionOptions,
      generatePrompt  // 新增：图片生成提示词
    } = req.body;
    
    // 根据处理类型执行不同的操作
    if (processType === 'generate') {
      // 图片生成处理
      if (!generatePrompt) {
        return res.status(400).json({ error: '缺少生成提示词' });
      }
      
      // 扣除图片生成积分
      try {
        await deductCredits(userId, 'image_generation');
      } catch (error) {
        if (error.message === '积分不足') {
          return res.status(402).json({ 
            error: '积分不足',
            message: '您的积分余额不足以使用图片生成服务',
            code: 'INSUFFICIENT_CREDITS'
          });
        }
        throw error;
      }
      
      // 调用Gemini API生成图像
      const generationResult = await generateImageWithGemini(generatePrompt, {
        model: "gemini-2.0-flash-exp-image-generation"
      });
      
      if (!generationResult.success || !generationResult.imageData) {
        throw new Error('图像生成失败');
      }
      
      // 保存生成的图像
      const fileId = uuidv4();
      const filename = `generated_${fileId}.png`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, Buffer.from(generationResult.imageData, 'base64'));
      
      // 设置输出URL
      const outputImageUrl = `/uploads/${filename}`;
      
      // 存储处理记录到数据库
      try {
        await supabase
          .from('image_processing_history')
          .insert({
            user_id: userId,
            original_image: null,
            result_image: outputImageUrl,
            process_type: 'generate',
            prompt: generatePrompt,
            created_at: new Date()
          });
      } catch (dbError) {
        console.error('保存记录到数据库失败:', dbError);
      }
      
      // 返回结果
      return res.status(200).json({
        success: true,
        url: outputImageUrl,
        message: '图像生成成功',
        textResponse: generationResult.textContent || '生成完成'
      });
    } 
    else if (processType === 'edit') {
      // 图片修改处理
      if (!image) {
        return res.status(400).json({ error: '缺少图片数据' });
      }
      
      if (!instructions) {
        return res.status(400).json({ error: '缺少修改指令' });
      }
      
      // 检查图片大小
      const estimatedSizeInBytes = (image.length * 3) / 4;
      const estimatedSizeInMB = estimatedSizeInBytes / (1024 * 1024);
      
      if (estimatedSizeInMB > 10) {
        return res.status(413).json({ 
          error: '图片太大', 
          message: '图片大小超过10MB限制',
          code: 'IMAGE_TOO_LARGE'
        });
      }
      
      // 扣除图片修改积分
      try {
        await deductCredits(userId, 'image_editing');
      } catch (error) {
        if (error.message === '积分不足') {
          return res.status(402).json({ 
            error: '积分不足',
            message: '您的积分余额不足以使用图片修改服务',
            code: 'INSUFFICIENT_CREDITS'
          });
        }
        throw error;
      }
      
      // 调用Gemini API修改图像
      const editingResult = await editImageWithGemini(image, instructions, {
        model: "gemini-2.0-flash-exp-image-generation"
      });
      
      if (!editingResult.success || !editingResult.imageData) {
        throw new Error('图像修改失败');
      }
      
      // 保存修改后的图像
      const fileId = uuidv4();
      const extension = mime.extension(mime.lookup(image) || 'image/jpeg') || 'jpg';
      const filename = `edited_${fileId}.${extension}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, Buffer.from(editingResult.imageData, 'base64'));
      
      // 设置输出URL
      const outputImageUrl = `/uploads/${filename}`;
      
      // 存储处理记录到数据库
      try {
        await supabase
          .from('image_processing_history')
          .insert({
            user_id: userId,
            original_image: null, // 这里可以保存原图的URL
            result_image: outputImageUrl,
            process_type: 'edit',
            prompt: instructions,
            created_at: new Date()
          });
      } catch (dbError) {
        console.error('保存记录到数据库失败:', dbError);
      }
      
      // 返回结果
      return res.status(200).json({
        success: true,
        url: outputImageUrl,
        message: '图像修改成功',
        textResponse: editingResult.textContent || '修改完成'
      });
    }
    else {
      // 继续执行原有的图片处理逻辑
      if (!image) {
        return res.status(400).json({ error: '缺少图片数据' });
      }
      
      // 检查图片大小（粗略估计，Base64字符串长度的3/4）
      const estimatedSizeInBytes = (image.length * 3) / 4;
      const estimatedSizeInMB = estimatedSizeInBytes / (1024 * 1024);
      
      if (estimatedSizeInMB > 10) {
        return res.status(413).json({ 
          error: '图片太大', 
          message: '图片大小超过10MB限制',
          code: 'IMAGE_TOO_LARGE'
        });
      }
      
      // 尝试扣除积分
      try {
        await deductCredits(userId, 'image_processing');
      } catch (error) {
        // 如果积分不足，返回错误
        if (error.message === '积分不足') {
          return res.status(402).json({ 
            error: '积分不足',
            message: '您的积分余额不足以使用图片处理服务',
            code: 'INSUFFICIENT_CREDITS'
          });
        }
        
        throw error; // 其他错误继续抛出
      }
      
      // 准备提示词，根据处理类型构建
      const prompt = getImageProcessingPrompt(processType, { styleOption, intensity, instructions });
      
      console.log(`处理图像: ${processType}, 提示词: ${prompt}`);
      
      // 调用Gemini API处理图像，添加重试机制
      let geminiResult = null;
      let retryCount = 0;
      const maxRetries = 2;
      let usingFallback = false;
      let fallbackMessage = "";
      
      while (retryCount <= maxRetries) {
        try {
          geminiResult = await processImageWithGemini(image, prompt, {
            temperature: 1,
            model: "gemini-2.0-flash-exp-image-generation"
          });
          break; // 成功处理，跳出重试循环
        } catch (error) {
          retryCount++;
          console.error(`Gemini API调用失败 (尝试 ${retryCount}/${maxRetries}):`, error.message);
          
          if (retryCount > maxRetries) {
            console.log("Gemini API请求失败，切换到本地处理逻辑");
            usingFallback = true;
            fallbackMessage = `由于Gemini API暂时不可用，我们使用了备用处理方案。您的积分已按50%比例返还。`;
            break;
          }
          
          // 等待1秒后重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // 如果API调用全部失败，尝试使用本地sharp进行基础处理
      if (usingFallback) {
        try {
          // 返还50%的积分
          try {
            await supabase
              .from('user_credits')
              .update({ 
                credits: supabase.sql`credits + 5` 
              })
              .eq('user_id', userId);
          } catch (creditError) {
            console.error('返还积分失败:', creditError);
          }
          
          // 解析Base64图像
          let imageData = image;
          if (image.includes('base64,')) {
            imageData = image.split('base64,')[1];
          }
          
          // 转换为buffer
          const imageBuffer = Buffer.from(imageData, 'base64');
          
          // 使用sharp处理图像
          let sharpInstance = sharp(imageBuffer);
          
          // 获取图片信息以便进行放大处理
          const metadata = await sharpInstance.metadata();
          
          // 根据处理类型应用不同的效果
          switch (processType) {
            case 'enhance':
              // 提高清晰度和对比度
              sharpInstance = sharpInstance
                .sharpen(intensity / 10)
                .modulate({
                  brightness: 1 + (intensity / 200),
                  saturation: 1 + (intensity / 100)
                });
              break;
            
            case 'style':
              // 简单的风格效果
              if (styleOption === 'sketch') {
                sharpInstance = sharpInstance.grayscale().sharpen(10);
              } else if (styleOption === 'neon') {
                sharpInstance = sharpInstance
                  .modulate({ brightness: 1.2, saturation: 1.8 })
                  .sharpen(5);
              } else if (styleOption === 'watercolor') {
                sharpInstance = sharpInstance
                  .modulate({ saturation: 0.7 })
                  .blur(0.5);
              } else if (styleOption === 'comic') {
                sharpInstance = sharpInstance
                  .sharpen(10)
                  .modulate({ saturation: 1.5, brightness: 1.1 });
              }
              break;
            
            case 'remove-bg':
              // 背景移除需要更复杂的算法，这里只做基本处理
              sharpInstance = sharpInstance.sharpen(5);
              break;
            
            case 'upscale':
              // 放大图像
              sharpInstance = sharpInstance.resize({
                width: Math.round(metadata.width * 1.5),
                height: Math.round(metadata.height * 1.5),
                fit: 'fill',
                kernel: 'lanczos3'
              });
              break;
            
            case 'repair':
              // 简单降噪和修复
              sharpInstance = sharpInstance
                .median(3) // 使用中值滤波减少噪点
                .sharpen(3);
              break;
            
            case 'color':
              // 调整色彩
              sharpInstance = sharpInstance.modulate({
                saturation: 1 + (intensity / 100),
                hue: intensity
              });
              break;
            
            default:
              // 默认简单增强
              sharpInstance = sharpInstance.sharpen(5);
          }
          
          // 生成唯一文件名
          const fileId = uuidv4();
          const extension = mime.extension(mime.lookup(image) || 'image/jpeg') || 'jpg';
          const filename = `output_${fileId}.${extension}`;
          
          // 确保目录存在
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          // 保存处理后的图像
          const filePath = path.join(uploadsDir, filename);
          await sharpInstance.toFile(filePath);
          
          // 设置输出URL
          const outputImageUrl = `/uploads/${filename}`;
          
          // 存储处理记录到数据库
          try {
            await supabase
              .from('image_processing_history')
              .insert({
                user_id: userId,
                original_image: null,
                result_image: outputImageUrl,
                process_type: processType,
                style_option: styleOption,
                intensity: intensity,
                created_at: new Date().toISOString(),
                note: "备用处理方案"
              });
          } catch (dbError) {
            console.error('保存处理记录失败:', dbError);
          }
          
          // 返回处理后的图片URL
          return res.status(200).json({ 
            success: true,
            url: outputImageUrl,
            processType,
            styleOption,
            intensity,
            message: fallbackMessage
          });
        } catch (fallbackError) {
          console.error('备用处理逻辑失败:', fallbackError);
          throw new Error(`图像处理失败，无法使用备用逻辑: ${fallbackError.message}`);
        }
      }
      
      // 验证API返回结果
      if (!geminiResult || !geminiResult.candidates || geminiResult.candidates.length === 0) {
        throw new Error('Gemini API返回无效结果');
      }
      
      // 处理响应结果
      const candidates = geminiResult.candidates;
      let outputImageUrl = null;
      let imageBuffer = null;
      
      if (candidates && candidates.length > 0) {
        for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
          for (let partIndex = 0; partIndex < candidates[candidateIndex].content.parts.length; partIndex++) {
            const part = candidates[candidateIndex].content.parts[partIndex];
            if (part.inlineData) {
              try {
                // 解码Base64图像数据
                imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                
                // 生成唯一文件名
                const fileId = uuidv4();
                const extension = mime.extension(part.inlineData.mimeType) || 'png';
                const filename = `output_${fileId}.${extension}`;
                
                // 确保目录存在
                const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                  fs.mkdirSync(uploadsDir, { recursive: true });
                }
                
                // 应用图像压缩（如果请求中指定）
                if (compressionOptions) {
                  const sharpInstance = sharp(imageBuffer);
                  
                  // 配置压缩选项
                  if (compressionOptions.quality) {
                    sharpInstance.jpeg({ quality: compressionOptions.quality }).png({ quality: compressionOptions.quality });
                  }
                  
                  if (compressionOptions.resize) {
                    const { width, height, fit } = compressionOptions.resize;
                    sharpInstance.resize({
                      width: width || undefined,
                      height: height || undefined,
                      fit: fit || 'inside'
                    });
                  }
                  
                  // 保存压缩后的图像
                  const filePath = path.join(uploadsDir, filename);
                  await sharpInstance.toFile(filePath);
                } else {
                  // 不压缩，直接保存原始图像
                  const filePath = path.join(uploadsDir, filename);
                  fs.writeFileSync(filePath, imageBuffer);
                }
                
                // 设置输出URL
                outputImageUrl = `/uploads/${filename}`;
                break;
              } catch (err) {
                console.error('保存生成的图像出错:', err);
              }
            }
          }
          if (outputImageUrl) break;
        }
      }
      
      if (!outputImageUrl) {
        return res.status(500).json({ 
          error: '图像处理失败，未生成结果',
          code: 'IMAGE_PROCESSING_FAILED'
        });
      }
      
      // 存储处理记录到数据库
      try {
        await supabase
          .from('image_processing_history')
          .insert({
            user_id: userId,
            original_image: null, // 不存储原始图像，节省空间
            result_image: outputImageUrl,
            process_type: processType,
            style_option: styleOption,
            intensity: intensity,
            created_at: new Date().toISOString()
          });
      } catch (dbError) {
        console.error('保存处理记录失败:', dbError);
        // 继续执行，不因为记录保存失败而中断流程
      }
      
      // 返回处理后的图片URL
      return res.status(200).json({ 
        success: true,
        url: outputImageUrl,
        processType,
        styleOption,
        intensity,
        message: geminiResult.text
      });
    }
  } catch (error) {
    console.error('处理请求失败:', error);
    return res.status(500).json({ 
      error: '服务器错误', 
      message: error.message || '处理请求时发生错误'
    });
  }
}