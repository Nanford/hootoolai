// test-claude-api.js
require('dotenv').config(); // 加载.env文件中的环境变量
const { Anthropic } = require('@anthropic-ai/sdk');

async function testClaudeApi() {
  try {
    // 检查API密钥是否存在
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('错误: 找不到ANTHROPIC_API_KEY环境变量');
      console.error('请确保您已创建.env文件并包含ANTHROPIC_API_KEY=您的密钥');
      return;
    }

    console.log('初始化Anthropic客户端...');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // 测试用的提示词 - 使用简单的内容生成任务
    const testStyle = {
      name: '极简主义风格',
      description: '采用极简主义风格设计，遵循"少即是多"的理念。使用大量留白创造呼吸空间，仅保留最必要的元素。'
    };
    
    const testPrompt = `
你是一名国际顶尖的数字杂志艺术总监和前端开发专家。

请根据以下设计风格和主题内容，创建一个HTML格式的精美艺术卡片：

**设计风格描述：**
${testStyle.description}

**主题内容：**
测试内容 - 春天的樱花

请创建一个高质量的${testStyle.name}艺术卡片HTML。只返回有效的、完整的HTML代码，不要包含markdown代码块标记或其他说明内容。`;

    console.log('开始测试Claude API...');
    console.log('发送提示词...');
    console.time('API响应时间');

    // 调用Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: testPrompt
        }
      ],
      temperature: 0.7
    });

    console.timeEnd('API响应时间');
    
    // 检查响应
    if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
      console.error('错误: API返回了空响应');
      console.log('完整响应:', JSON.stringify(response, null, 2));
      return;
    }

    // 提取HTML内容
    let htmlContent = '';
    for (const part of response.content) {
      if (part.type === 'text') {
        htmlContent += part.text;
        break;
      }
    }

    // 清理HTML内容，移除可能的Markdown代码块
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '').trim();

    // 检查是否成功提取到HTML内容
    if (!htmlContent) {
      console.error('错误: 无法从API响应中提取HTML内容');
      console.log('完整响应:', JSON.stringify(response, null, 2));
      return;
    }

    // 显示响应摘要
    console.log('\n===== 测试成功 =====');
    console.log('响应ID:', response.id);
    console.log('模型:', response.model);
    console.log('使用的tokens数量:', response.usage.input_tokens + response.usage.output_tokens);
    console.log('输入tokens:', response.usage.input_tokens);
    console.log('输出tokens:', response.usage.output_tokens);
    
    // 显示HTML内容的前200个字符
    console.log('\nHTML内容预览 (前200个字符):');
    console.log(htmlContent.substring(0, 200) + '...');
    
    // 如果需要，可以将HTML内容保存到文件
    const fs = require('fs');
    const outputPath = './claude-test-output.html';
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`\nHTML内容已保存到: ${outputPath}`);
    
    // 提供打开文件的建议
    console.log('您可以在浏览器中打开此文件以查看生成的艺术卡片');
    
  } catch (error) {
    console.error('测试Claude API时出错:');
    
    if (error.status) {
      console.error('HTTP状态码:', error.status);
    }
    
    if (error.error) {
      console.error('错误详情:', JSON.stringify(error.error, null, 2));
    } else {
      console.error(error);
    }
  }
}

// 运行测试
testClaudeApi();