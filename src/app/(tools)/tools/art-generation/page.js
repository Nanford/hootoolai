'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

// 设计风格选项
const designStyles = [
  { id: 'minimalist', name: '极简主义风格' },
  { id: 'bold_modern', name: '大胆现代风格' },
  { id: 'elegant_vintage', name: '优雅复古风格' },
  { id: 'futuristic', name: '极致未来主义风格' },
  { id: 'contemporary_art', name: '当代艺术风格' },
  { id: 'luxury_baroque', name: '奢华巴洛克风格' },
  { id: 'organic_natural', name: '有机自然风格' },
  { id: 'art_nouveau', name: '新艺术主义风格' }
];

export default function ArtGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('contemporary_art');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('input'); // input 或 result

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('请输入创作提示词');
      return;
    }

    try {
      setIsGenerating(true);
      setTab('result');
      
      const response = await fetch('/api/art-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, style }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '生成失败');
      }

      setResult(data);
      toast.success('艺术卡片生成成功!');
    } catch (error) {
      console.error('生成失败:', error);
      toast.error(error.message || '生成艺术卡片失败');
      setTab('input');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">AI艺术卡片生成</h1>
        <p className="text-gray-600 dark:text-gray-300">
          输入您的创意提示词，选择风格，创建精美的艺术卡片
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              tab === 'input'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setTab('input')}
          >
            创作输入
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              tab === 'result'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setTab('result')}
            disabled={!result}
          >
            生成结果
          </button>
        </div>

        <div className="p-6">
          {tab === 'input' ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="style" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择设计风格
                </label>
                <select
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  {designStyles.map((designStyle) => (
                    <option key={designStyle.id} value={designStyle.id}>
                      {designStyle.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  创作提示词
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述您想要创建的艺术卡片内容，例如：春日花园下午茶指南，介绍5种最适合春季的花茶及其搭配点心..."
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white 
                ${
                  isGenerating || !prompt.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {isGenerating ? '生成中...' : '生成艺术卡片'}
              </button>
            </div>
          ) : (
            <div className="result-container">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">正在创作您的艺术卡片...</p>
                </div>
              ) : result ? (
                <div className="flex flex-col items-center">
                  <div className="mx-auto w-[400px] max-h-[960px] overflow-auto mb-4">
                    <iframe
                      srcDoc={result.htmlContent}
                      className="w-full h-[960px] border-0 rounded-lg shadow-md"
                      title="Generated Art Card"
                    ></iframe>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <a
                      href={result.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <span className="mr-2">在新窗口打开</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                        <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                      </svg>
                    </a>
                    <button
                      onClick={() => {
                        setPrompt('');
                        setTab('input');
                      }}
                      className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
                    >
                      创建新的艺术卡片
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">请先生成艺术卡片</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">使用提示</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>提供详细而具体的描述，例如主题、情感、色彩偏好等</li>
          <li>尝试不同的设计风格，每种风格会带来截然不同的视觉效果</li>
          <li>生成的艺术卡片可用于社交媒体内容、文章插图、个人收藏等</li>
          <li>输入内容越具体，生成的效果就越符合您的预期</li>
        </ul>
      </div>
    </div>
  );
} 