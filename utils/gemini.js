import { GoogleGenerativeAI } from "@google/generative-ai";

// 初始化GoogleGenerativeAI实例
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

// 懒加载Gemini API实例
const getGenAI = () => {
  if (!genAI) {
    if (!apiKey) {
      throw new Error('Gemini API密钥未配置');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * 实现重试机制的通用函数
 * @param {Function} fn - 要重试的异步函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} initialDelay - 初始延迟时间（毫秒）
 * @param {number} backoffFactor - 延迟时间增长因子
 * @returns {Promise} 执行结果
 */
async function executeWithRetry(fn, maxRetries = 3, initialDelay = 2000, backoffFactor = 1.5) {
  let lastError;
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 检查是否是可重试的错误
      const isRetryable = 
        error.message.includes('overloaded') || 
        error.message.includes('503') ||
        error.message.includes('Service Unavailable') ||
        error.message.includes('rate limit') ||
        error.message.includes('timeout');
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Gemini API 请求失败（尝试 ${attempt}/${maxRetries}）: ${error.message}`);
      console.log(`等待 ${delay}ms 后重试...`);
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 增加延迟时间（指数退避）
      delay = delay * backoffFactor;
    }
  }
  
  throw lastError;
}

/**
 * 获取支持的图像处理模型
 * @returns {Array} 支持的模型列表
 */
export function getGeminiImageModels() {
  return [
    {
      id: "gemini-2.0-flash-exp-image-generation",
      name: "Gemini 2.0 Flash (图像生成)",
      provider: "google",
      description: "适用于图像处理和生成的高性能模型"
    }
  ];
}

/**
 * 使用Gemini生成图片
 * @param {string} prompt - 图片生成的提示词
 * @param {Object} options - 附加选项
 * @returns {Promise} 包含处理结果的Promise
 */
export async function generateImageWithGemini(prompt, options = {}) {
  return executeWithRetry(async () => {
    try {
      const genAI = getGenAI();
      
      // 设置模型和配置
      const model = genAI.getGenerativeModel({
        model: options.model || "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ["Text", "Image"]
        }
      });
      
      console.log(`发送图像生成请求: 提示词=${prompt}`);
      
      // 生成内容
      const response = await model.generateContent(prompt);
      
      console.log('收到响应，状态 = ', response ? 'success' : 'failed');
      
      // 处理响应
      if (response && response.response && response.response.candidates && 
          response.response.candidates.length > 0) {
        
        const parts = response.response.candidates[0].content.parts;
        let imageData = null;
        let textContent = '';
        
        for (const part of parts) {
          // 处理文本部分
          if (part.text) {
            textContent += part.text;
          }
          
          // 处理图像部分
          if (part.inlineData) {
            imageData = part.inlineData.data;
          }
        }
        
        return {
          success: true,
          imageData,
          textContent
        };
      } else {
        console.error("无效的响应格式");
        throw new Error("无效的图像生成响应");
      }
    } catch (error) {
      console.error('生成图像出错:', error);
      throw new Error(`图像生成失败: ${error.message || '未知错误'}`);
    }
  }, options.maxRetries || 3, options.initialDelay || 2000);
}

/**
 * 使用Gemini修改图片
 * @param {string} imageBase64 - Base64编码的图像数据
 * @param {string} editPrompt - 修改指令
 * @param {Object} options - 附加选项
 * @returns {Promise} 包含处理结果的Promise
 */
export async function editImageWithGemini(imageBase64, editPrompt, options = {}) {
  return executeWithRetry(async () => {
    try {
      const genAI = getGenAI();
      
      // 设置模型和配置
      const model = genAI.getGenerativeModel({ 
        model: options.model || "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ["Text", "Image"]
        }
      });
      
      // 准备图像数据并确保格式正确
      let imageData = imageBase64;
      if (!imageBase64.startsWith('data:')) {
        // 假设是JPEG格式，根据实际情况调整
        imageData = `data:image/jpeg;base64,${imageBase64}`;
      }
      
      // 创建会话以保持上下文
      const chat = model.startChat();
      
      // 创建多模态输入 - 图片和修改指令
      const imageObject = {
        inlineData: {
          data: imageData.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: "image/jpeg" // 或 "image/png" 等，根据实际图片类型
        }
      };
      
      console.log(`发送图像修改请求: 提示词=${editPrompt}`);
      
      // 发送图片和修改指令
      const response = await chat.sendMessage([imageObject, editPrompt]);
      
      console.log('收到响应，状态 = ', response ? 'success' : 'failed');
      
      // 处理响应
      if (response && response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content.parts;
        let imageData = null;
        let textContent = '';
        
        for (const part of parts) {
          // 处理文本部分
          if (part.text) {
            textContent += part.text;
          }
          
          // 处理图像部分
          if (part.inlineData) {
            imageData = part.inlineData.data;
          }
        }
        
        return {
          success: true,
          imageData,
          textContent
        };
      } else {
        console.error("无效的响应格式");
        throw new Error("无效的图像修改响应");
      }
    } catch (error) {
      console.error('修改图像出错:', error);
      throw new Error(`图像修改失败: ${error.message || '未知错误'}`);
    }
  }, options.maxRetries || 3, options.initialDelay || 2000);
}

/**
 * 处理图像
 * @param {string} imageBase64 - Base64编码的图像数据
 * @param {string} prompt - 处理指令
 * @param {Object} options - 附加选项
 * @returns {Promise} 包含处理结果的Promise
 */
export async function processImageWithGemini(imageBase64, prompt, options = {}) {
  return executeWithRetry(async () => {
    try {
      const genAI = getGenAI();
      
      // 设置模型和配置
      const model = genAI.getGenerativeModel({
        model: options.model || "gemini-2.0-flash-exp-image-generation",
      });
      
      const generationConfig = {
        temperature: options.temperature || 1,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        maxOutputTokens: options.maxOutputTokens || 8192,
        responseModalities: ["image", "text"],
        responseMimeType: "text/plain",
      };
      
      // 创建聊天会话
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });
      
      // 准备图像数据并确保格式正确
      let imageData = imageBase64;
      if (!imageBase64.startsWith('data:')) {
        imageData = `data:image/jpeg;base64,${imageBase64}`;
      }
      
      // 图像可能太大，尝试压缩或截断
      if (imageData.length > 8000000) {
        console.warn('图像太大，可能导致处理失败');
      }
      
      console.log(`发送处理请求: 提示词=${prompt}`);
      
      // 发送处理请求
      const result = await chatSession.sendMessage(prompt);
      
      console.log('收到响应，状态 = ', result ? 'success' : 'failed');
      
      return {
        success: true,
        result,
        text: result.response?.text() || '',
        candidates: result.response?.candidates || []
      };
    } catch (error) {
      console.error('处理图像出错:', error);
      throw new Error(`图像处理失败: ${error.message || '未知错误'}`);
    }
  }, options.maxRetries || 3, options.initialDelay || 2000);
}

/**
 * 获取处理类型的提示词
 * @param {string} processType - 处理类型
 * @param {object} options - 处理选项
 * @returns {string} 生成的提示词
 */
export function getImageProcessingPrompt(processType, options = {}) {
  switch (processType) {
    case 'generate':
      return options.instructions || options.generatePrompt || "生成一张图片";
    case 'edit':
      return options.instructions || "修改这张图片";
    default:
      return options.instructions || "处理这张图片";
  }
} 