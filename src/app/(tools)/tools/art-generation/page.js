'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const styleOptions = [
  { id: 'watercolor', name: '水彩风格', description: '轻柔梦幻的水彩艺术效果' },
  { id: 'oil-painting', name: '油画风格', description: '质感丰富的经典油画效果' },
  { id: 'cartoon', name: '卡通风格', description: '可爱生动的卡通插画效果' },
  { id: 'anime', name: '动漫风格', description: '日式动漫插画风格' },
  { id: 'pixel-art', name: '像素艺术', description: '复古游戏像素风格' },
];

const ratioOptions = [
  { id: 'square', name: '正方形 1:1', value: '1:1' },
  { id: 'portrait', name: '竖版 2:3', value: '2:3' },
  { id: 'landscape', name: '横版 3:2', value: '3:2' },
];

const moodOptions = [
  { id: 'happy', name: '欢快的', description: '充满活力和喜悦的情绪' },
  { id: 'peaceful', name: '平静的', description: '宁静、安详的氛围' },
  { id: 'dramatic', name: '戏剧性的', description: '强烈对比和情感表达' },
  { id: 'mysterious', name: '神秘的', description: '带有一丝谜感和好奇' },
  { id: 'romantic', name: '浪漫的', description: '温馨、柔和的氛围' },
];

const lightingOptions = [
  { id: 'natural', name: '自然光', description: '自然柔和的光线' },
  { id: 'sunset', name: '日落', description: '温暖金色的光线' },
  { id: 'dramatic', name: '戏剧性光线', description: '强烈对比的光影效果' },
  { id: 'soft', name: '柔光', description: '柔和散射的光线' },
];

export default function ArtGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(styleOptions[0].id);
  const [selectedRatio, setSelectedRatio] = useState(ratioOptions[0].id);
  const [selectedMood, setSelectedMood] = useState(moodOptions[0].id);
  const [selectedLighting, setSelectedLighting] = useState(lightingOptions[0].id);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const buildCompletePrompt = () => {
    const styleText = styleOptions.find(s => s.id === selectedStyle)?.name || '';
    const moodText = moodOptions.find(m => m.id === selectedMood)?.name || '';
    const lightingText = lightingOptions.find(l => l.id === selectedLighting)?.name || '';
    
    let completePrompt = prompt;
    
    if (moodText) {
      completePrompt += `\n氛围: ${moodText}`;
    }
    
    if (lightingText) {
      completePrompt += `\n光线: ${lightingText}`;
    }
    
    if (additionalDetails) {
      completePrompt += `\n额外细节: ${additionalDetails}`;
    }
    
    return completePrompt;
  };

  const handleGenerate = async () => {
    if (!prompt || prompt.trim().length < 3) {
      toast.error('请输入至少3个字符的提示词');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    
    try {
      const completePrompt = buildCompletePrompt();
      
      try {
        const response = await axios.post('/api/art-generation/generate', {
          prompt: completePrompt,
          style: selectedStyle,
          ratio: ratioOptions.find(r => r.id === selectedRatio).value,
        });
        
        setGeneratedUrl(response.data.imageUrl);
        toast.success('艺术卡片生成成功！');
        setIsDemo(false);
      } catch (apiError) {
        console.error('API调用失败，启用演示模式:', apiError);
        // 启用演示模式，使用示例图片
        const demoImages = {
          'watercolor': '/img/AI生成艺术卡片展示.png',
          'oil-painting': '/img/AI图片展示.png', 
          'cartoon': '/img/展示图片.png',
          'anime': '/img/展示图片1.png',
          'pixel-art': '/img/展示.png'
        };
        
        setGeneratedUrl(demoImages[selectedStyle] || '/img/AI生成艺术卡片展示.png');
        setIsDemo(true);
        toast.success('演示模式：显示示例图片');
      }
    } catch (error) {
      console.error('艺术卡片生成失败:', error);
      setErrorMessage('艺术卡片生成失败，请稍后再试或联系客服');
      toast.error(error.response?.data?.message || '生成失败，请稍后再试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedUrl) {
      const link = document.createElement('a');
      link.href = generatedUrl;
      link.download = `art-${selectedStyle}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI艺术卡片生成</h1>
        <p className="mt-2 text-gray-600">使用Claude 3.7 Sonnet AI创建精美的艺术卡片，只需输入您想要的内容即可。</p>
        {isDemo && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">当前为演示模式，实际生成功能需要正确配置API密钥。</p>
          </div>
        )}
        {errorMessage && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">创作设置</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                  主要内容描述
                </label>
                <div className="mt-1">
                  <textarea
                    id="prompt"
                    name="prompt"
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="描述您想要生成的图像，例如：一只猫坐在窗台上看日落"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">详细的描述会得到更好的结果</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">艺术风格</label>
                <div className="mt-2 space-y-3">
                  {styleOptions.map((style) => (
                    <div key={style.id} className="flex items-start">
                      <input
                        id={style.id}
                        name="art-style"
                        type="radio"
                        className="h-4 w-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                        checked={selectedStyle === style.id}
                        onChange={() => setSelectedStyle(style.id)}
                      />
                      <label htmlFor={style.id} className="ml-3 block text-sm">
                        <span className="font-medium text-gray-900">{style.name}</span>
                        <span className="text-gray-500 block">{style.description}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">氛围</label>
                <div className="mt-2 space-y-2">
                  <select
                    id="mood"
                    name="mood"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                  >
                    {moodOptions.map((mood) => (
                      <option key={mood.id} value={mood.id}>
                        {mood.name} - {mood.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">光线</label>
                <div className="mt-2 space-y-2">
                  <select
                    id="lighting"
                    name="lighting"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={selectedLighting}
                    onChange={(e) => setSelectedLighting(e.target.value)}
                  >
                    {lightingOptions.map((lighting) => (
                      <option key={lighting.id} value={lighting.id}>
                        {lighting.name} - {lighting.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700">
                  额外细节（可选）
                </label>
                <div className="mt-1">
                  <textarea
                    id="additionalDetails"
                    name="additionalDetails"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="添加更多细节，如颜色偏好、物体特征等"
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">比例</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {ratioOptions.map((ratio) => (
                    <div
                      key={ratio.id}
                      className={`
                        flex items-center justify-center py-2 px-3 rounded-md border cursor-pointer text-sm
                        ${selectedRatio === ratio.id 
                          ? 'bg-blue-100 border-blue-600 text-blue-700 font-medium' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
                      `}
                      onClick={() => setSelectedRatio(ratio.id)}
                    >
                      {ratio.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    生成中...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="-ml-1 mr-2 h-5 w-5 text-white" />
                    生成艺术卡片
                  </>
                )}
              </button>
            </div>
          </div>

          {generatedUrl && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">保存作品</h2>
              <button
                type="button"
                onClick={handleDownload}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                下载图片
              </button>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">生成结果</h2>
            
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <ArrowPathIcon className="animate-spin h-12 w-12 text-blue-500 mb-4" />
                <p className="text-gray-500 text-center">
                  AI正在创作您的艺术卡片，请稍候...
                  <br />
                  <span className="text-sm">这可能需要10-30秒</span>
                </p>
              </div>
            ) : generatedUrl ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative max-w-full max-h-full">
                  <Image
                    src={generatedUrl}
                    alt="生成的艺术卡片"
                    width={600}
                    height={600}
                    className="object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
                <SparklesIcon className="h-16 w-16 text-gray-200 mb-4" />
                <p className="text-gray-400 text-center">
                  填写左侧表单并点击"生成艺术卡片"按钮
                  <br />
                  <span className="text-sm">生成的图片将显示在这里</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
        <h2 className="text-lg font-medium text-blue-800 mb-2">提示技巧</h2>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>使用具体详细的描述会获得更好的结果</li>
          <li>尝试指定场景、背景、光线、氛围等元素</li>
          <li>如果结果不理想，尝试调整描述或选择不同的艺术风格</li>
          <li>避免生成不适当内容，系统会自动过滤违规请求</li>
        </ul>
      </div>
    </div>
  );
} 