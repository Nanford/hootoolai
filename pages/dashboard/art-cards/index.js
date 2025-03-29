import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaImage, FaDownload, FaPalette, FaRandom, 
  FaHistory, FaBookmark, FaShareAlt, FaLightbulb, FaMagic,
  FaInfoCircle, FaCrown, FaChevronDown, FaChevronRight
} from 'react-icons/fa';

export default function ArtCards() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [ratio, setRatio] = useState('1:1');
  const [mode, setMode] = useState('normal'); // normal or magazine
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStyleInfo, setShowStyleInfo] = useState(false);
  
  // Magazine card specific
  const [topic, setTopic] = useState('');
  const [magStyle, setMagStyle] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    // Load saved templates
    setSavedTemplates([
      { id: 1, name: "抽象艺术", prompt: "抽象艺术风格的山水画，用鲜艳的颜色和大胆的笔触", style: "abstract" },
      { id: 2, name: "城市夜景", prompt: "未来城市的夜景，霓虹灯和高楼大厦，赛博朋克风格", style: "digital-art" },
      { id: 3, name: "花卉特写", prompt: "一束盛开的百合花，柔和的自然光线，水彩风格", style: "watercolor" }
    ]);
  }, []);

  const styles = [
    { id: 'realistic', name: '写实风格', desc: '逼真的细节和光影效果，如同照片般的表现力' },
    { id: 'abstract', name: '抽象风格', desc: '注重形状、色彩和线条的表达，不拘泥于具象再现' },
    { id: 'cartoon', name: '卡通风格', desc: '简化的轮廓和明亮的色彩，充满趣味性和活力' },
    { id: 'watercolor', name: '水彩风格', desc: '柔和的色彩过渡和透明感，带有水彩画的自然韵味' },
    { id: 'oil-painting', name: '油画风格', desc: '丰富的质感和色彩层次，展现经典油画的艺术特性' },
    { id: 'digital-art', name: '数字艺术', desc: '现代数字绘画技术创作的视觉效果，色彩鲜明' },
    { id: 'minimalist', name: '极简主义', desc: '简洁、克制的表达，减少不必要的元素，突出主题' },
  ];

  const ratios = [
    { id: '1:1', name: '正方形 (1:1)', desc: '适合Instagram等社交媒体平台' },
    { id: '4:3', name: '标准 (4:3)', desc: '经典显示器比例，适合桌面壁纸' },
    { id: '16:9', name: '宽屏 (16:9)', desc: '现代显示器和手机横屏模式的标准比例' },
    { id: '9:16', name: '手机屏幕 (9:16)', desc: '竖屏手机和故事(Stories)格式' },
    { id: '3:4', name: '肖像 (3:4)', desc: '传统肖像照片比例，适合人像创作' },
  ];

  // 杂志风格列表
  const magazineStyles = [
    { id: 'minimalist', name: '极简主义风格', desc: '简约、精致、留白，让内容成为焦点' },
    { id: 'bold-modern', name: '大胆现代风格', desc: '强烈对比色、不对称布局，充满视觉冲击力' },
    { id: 'elegant-vintage', name: '优雅复古风格', desc: '怀旧色调、古典排版，散发典雅气息' },
    { id: 'futuristic-glam', name: '极致未来主义风格', desc: '科技感十足，霓虹色彩与金属质感' },
    { id: 'contemporary-art', name: '当代艺术风格', desc: '艺术展览般的布局，强调创意与艺术性' },
    { id: 'luxury-baroque', name: '奢华巴洛克风格', desc: '华丽装饰、金色点缀，极致奢华' },
    { id: 'organic-natural', name: '有机自然风格', desc: '大地色系、自然纹理，散发宁静高级感' },
    { id: 'art-nouveau', name: '新艺术主义风格', desc: '流畅曲线、植物图案，浪漫优雅' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'normal' && !prompt.trim()) return;
    if (mode === 'magazine' && !topic.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (mode === 'normal') {
        // 设置正常模式的模拟结果
        setResult({
          url: '/hero-image.svg',
          prompt,
          style,
          ratio
        });
      } else {
        // 生成杂志卡片的HTML预览 (示例)
        const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Magazine Card</title>
  <link rel="stylesheet" href="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css">
  <link rel="stylesheet" href="https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap">
  <style>
    .magazine-card {
      font-family: 'Noto Sans SC', sans-serif;
      width: 400px;
      max-height: 1280px;
      overflow: hidden;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      background: linear-gradient(to right, #f8f9fa, #e9ecef);
      padding: 2rem;
      position: relative;
    }
    .date-badge {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: #212529;
      color: white;
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 1px;
    }
    .title {
      font-family: 'Noto Serif SC', serif;
      font-size: 2.5rem;
      line-height: 1.2;
      font-weight: 700;
      color: #212529;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    .subtitle {
      font-size: 1.2rem;
      color: #495057;
      margin-bottom: 2rem;
      font-weight: 400;
    }
    .quote-block {
      border-left: 4px solid #212529;
      padding-left: 1.5rem;
      margin: 2rem 0;
      color: #495057;
      font-style: italic;
    }
    .key-points {
      margin: 2rem 0;
    }
    .point-item {
      display: flex;
      align-items: baseline;
      margin-bottom: 1rem;
    }
    .point-marker {
      width: 1.5rem;
      height: 1.5rem;
      background: #212529;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      flex-shrink: 0;
      font-size: 0.8rem;
      font-weight: bold;
    }
    .qr-section {
      margin-top: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.5rem;
    }
    .qr-image {
      width: 120px;
      margin-bottom: 1rem;
    }
    .editor-note {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #e9ecef;
      font-size: 0.9rem;
      position: relative;
    }
    .editor-note:before {
      content: 'EDITOR\'S NOTE';
      position: absolute;
      top: -0.8rem;
      left: 1rem;
      background: #212529;
      color: white;
      padding: 0.2rem 0.8rem;
      font-size: 0.7rem;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="magazine-card">
    <div class="date-badge">2025-03-23</div>
    
    <h1 class="title">${topic}</h1>
    <p class="subtitle">探索思想的深度与广度</p>
    
    <div class="quote-block">
      "真正的知识不仅需要我们去学习，更需要我们去思考、质疑和探索。"
    </div>
    
    <div class="key-points">
      <div class="point-item">
        <div class="point-marker">1</div>
        <div>知识不仅是信息的累积，更是思维框架的构建与完善</div>
      </div>
      <div class="point-item">
        <div class="point-marker">2</div>
        <div>批判性思维能力是现代社会最重要的核心竞争力之一</div>
      </div>
      <div class="point-item">
        <div class="point-marker">3</div>
        <div>跨学科学习有助于建立更全面、更有创造力的认知系统</div>
      </div>
      <div class="point-item">
        <div class="point-marker">4</div>
        <div>终身学习不是选择，而是适应快速变化世界的必要策略</div>
      </div>
    </div>
    
    <div class="qr-section">
      <img src="https://img.picui.cn/free/2025/03/25/67e1a631794da.jpg" alt="QR Code" class="qr-image">
      <div class="text-sm text-center">扫描二维码，获取更多精彩内容</div>
    </div>
    
    <div class="editor-note">
      持续学习和思考是现代社会中保持竞争力的关键。不要被信息过载所淹没，而是要培养筛选、分析和整合知识的能力。记住，真正的智慧不仅在于知道什么，更在于如何思考。
    </div>
  </div>
</body>
</html>`;
        
        setPreviewHtml(html);
        
        // 设置杂志模式的模拟结果
        setResult({
          html: html,
          topic: topic,
          style: magStyle
        });
      }
    } catch (error) {
      console.error('生成艺术卡片错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template) => {
    setPrompt(template.prompt);
    setStyle(template.style);
    setShowTemplates(false);
  };

  // CSS类名生成函数，基于当前模式设置不同的颜色风格
  const getButtonClass = (isPrimary) => {
    if (mode === 'normal') {
      return isPrimary 
        ? "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        : "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200";
    } else {
      return isPrimary 
        ? "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
        : "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200";
    }
  };

  // 根据当前模式获取强调色
  const getAccentColor = () => {
    return mode === 'normal' ? 'indigo' : 'purple';
  };
  
  const accent = getAccentColor();

  return (
    <div className={`min-h-screen bg-gray-50`}>
      <Head>
        <title>艺术卡片生成 - HooTool AI</title>
        <meta name="description" content="使用AI生成精美的艺术卡片" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className={`text-gray-500 hover:text-${accent}-600 mr-3`}>
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <FaMagic className={`h-6 w-6 text-${accent}-600 mr-2`} />
                <h1 className="text-xl font-bold text-gray-900">
                  {mode === 'normal' ? '艺术卡片生成' : '杂志风格卡片生成'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setMode('normal')} 
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  mode === 'normal' 
                    ? `bg-indigo-100 text-indigo-700 border border-indigo-200` 
                    : `bg-white text-gray-500 border border-gray-200 hover:bg-gray-50`
                }`}
              >
                <FaImage className="inline-block mr-1 mb-0.5" /> 艺术卡片
              </button>
              <button 
                onClick={() => setMode('magazine')} 
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  mode === 'magazine' 
                    ? `bg-purple-100 text-purple-700 border border-purple-200` 
                    : `bg-white text-gray-500 border border-gray-200 hover:bg-gray-50`
                }`}
              >
                <FaPalette className="inline-block mr-1 mb-0.5" /> 杂志卡片
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* 模式切换指示 */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className={`text-lg font-semibold text-${accent}-700`}>
                    {mode === 'normal' ? '创建艺术卡片' : '创建杂志风格卡片'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {mode === 'normal' 
                      ? '使用AI生成精美的艺术图像，适用于社交媒体、演示文稿等场景' 
                      : '生成高端杂志风格的精美知识卡片，令人眼前一亮的视觉体验'}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button 
                    onClick={() => setShowTemplates(!showTemplates)}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-${accent}-600 bg-${accent}-50 hover:bg-${accent}-100`}
                  >
                    <FaBookmark className="mr-1.5 h-4 w-4" />
                    我的模板
                    {showTemplates ? <FaChevronDown className="ml-1 h-3 w-3" /> : <FaChevronRight className="ml-1 h-3 w-3" />}
                  </button>
                </div>
              </div>
              
              {/* 保存的模板面板 */}
              {showTemplates && (
                <div className={`mb-6 bg-${accent}-50 rounded-lg p-4`}>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">保存的模板</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedTemplates.map((template) => (
                      <div 
                        key={template.id} 
                        className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
                        onClick={() => applyTemplate(template)}
                      >
                        <div className="flex items-start">
                          <div className={`h-8 w-8 rounded-full bg-${accent}-100 flex items-center justify-center text-${accent}-600 flex-shrink-0`}>
                            <FaPalette className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.prompt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className={`bg-white rounded-lg border border-dashed border-gray-300 p-3 cursor-pointer hover:border-${accent}-300 flex items-center justify-center hover:bg-gray-50 transition-all h-full`}>
                      <div className="flex flex-col items-center text-gray-500">
                        <FaPlus className="h-5 w-5 mb-1" />
                        <span className="text-sm">添加新模板</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 正常模式的输入区域 */}
                {mode === 'normal' && (
                  <>
                    <div>
                      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                        描述您想要的艺术卡片
                      </label>
                      <textarea
                        id="prompt"
                        rows={4}
                        className={`shadow-sm focus:ring-${accent}-500 focus:border-${accent}-500 block w-full sm:text-sm border-gray-300 rounded-lg`}
                        placeholder="例如：一只在花丛中的蝴蝶，春天的阳光透过树叶，背景模糊"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
                            艺术风格
                          </label>
                          <button 
                            type="button"
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => setShowStyleInfo(!showStyleInfo)}
                          >
                            <FaInfoCircle className="inline-block mr-1 mb-0.5" />
                            查看风格说明
                          </button>
                        </div>
                        <select
                          id="style"
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${accent}-500 focus:border-${accent}-500 sm:text-sm rounded-lg`}
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                        >
                          {styles.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        
                        {/* 风格说明面板 */}
                        {showStyleInfo && (
                          <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            <h4 className="font-medium text-gray-700 mb-2">风格说明</h4>
                            <p>{styles.find(s => s.id === style)?.desc || '选择一种风格来查看说明'}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="ratio" className="block text-sm font-medium text-gray-700 mb-1">
                          尺寸比例
                        </label>
                        <select
                          id="ratio"
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${accent}-500 focus:border-${accent}-500 sm:text-sm rounded-lg`}
                          value={ratio}
                          onChange={(e) => setRatio(e.target.value)}
                        >
                          {ratios.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
                
                {/* 杂志卡片模式的输入区域 */}
                {mode === 'magazine' && (
                  <>
                    <div>
                      <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                        输入卡片主题
                      </label>
                      <input
                        id="topic"
                        type="text"
                        className={`shadow-sm focus:ring-${accent}-500 focus:border-${accent}-500 block w-full sm:text-sm border-gray-300 rounded-lg`}
                        placeholder="例如：终身学习、批判性思维、创造力培养等"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">这个主题将会生成一张精美的杂志风格知识卡片</p>
                    </div>
                    
                    <div>
                      <label htmlFor="magStyle" className="block text-sm font-medium text-gray-700 mb-1">
                        杂志风格
                      </label>
                      <select
                        id="magStyle"
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${accent}-500 focus:border-${accent}-500 sm:text-sm rounded-lg`}
                        value={magStyle}
                        onChange={(e) => setMagStyle(e.target.value)}
                      >
                        <option value="">随机风格 (推荐)</option>
                        {magazineStyles.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">让AI随机选择风格会带来惊喜的效果</p>
                    </div>
                    
                    <div className={`bg-${accent}-50 rounded-lg p-4 text-sm text-gray-700`}>
                      <h4 className={`font-medium text-${accent}-700 flex items-center mb-2`}>
                        <FaCrown className="mr-2 h-4 w-4" />
                        杂志卡片特性
                      </h4>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>由国际顶尖杂志设计师设计的多种时尚风格</li>
                        <li>精美的排版和设计，如同高端杂志般的视觉体验</li>
                        <li>内容将被智能整理成简洁精华的知识点</li>
                        <li>完全可定制的知识卡片，适合分享和学习</li>
                        <li>可在社交媒体上分享，展示个人品味和知识深度</li>
                      </ul>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  {mode === 'normal' && (
                    <button
                      type="button"
                      className={getButtonClass(false)}
                      onClick={() => {
                        const randomStyle = styles[Math.floor(Math.random() * styles.length)].id;
                        setStyle(randomStyle);
                      }}
                    >
                      <FaRandom className="mr-2 h-4 w-4" />
                      随机风格
                    </button>
                  )}
                  
                  {mode === 'magazine' && (
                    <button
                      type="button"
                      className={getButtonClass(false)}
                      onClick={() => {
                        // 展示示例主题
                        setTopic('终身学习与认知成长');
                      }}
                    >
                      <FaLightbulb className="mr-2 h-4 w-4" />
                      主题示例
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading || (mode === 'normal' ? !prompt.trim() : !topic.trim())}
                    className={getButtonClass(true) + " disabled:opacity-50"}
                  >
                    <FaPalette className="mr-2 h-4 w-4" />
                    {loading ? '生成中...' : mode === 'normal' ? '生成艺术卡片' : '生成杂志卡片'}
                  </button>
                </div>
              </form>
              
              {loading && (
                <div className="mt-8 flex flex-col items-center justify-center">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${accent}-600`}></div>
                  <p className="mt-4 text-sm text-gray-500">
                    {mode === 'normal' ? '正在生成您的艺术卡片...' : '正在创建您的杂志风格卡片...'}
                  </p>
                </div>
              )}
              
              {/* 普通艺术卡片结果 */}
              {result && mode === 'normal' && (
                <div className="mt-10 border-t border-gray-200 pt-10">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <FaImage className={`mr-2 h-5 w-5 text-${accent}-600`} />
                    生成结果
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="relative group">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img 
                          src={result.url} 
                          alt="生成的艺术卡片"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 w-full">
                          <div className="flex justify-end space-x-2">
                            <button className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors">
                              <FaImage className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors">
                              <FaDownload className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors">
                              <FaShareAlt className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">提示词</h4>
                          <p className="text-gray-700">{result.prompt}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">风格</h4>
                            <div className="flex items-center">
                              <span className={`inline-block w-3 h-3 rounded-full bg-${accent}-500 mr-2`}></span>
                              <span className="text-gray-700">{styles.find(s => s.id === result.style)?.name}</span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">比例</h4>
                            <div className="flex items-center">
                              <span className="inline-block w-4 h-3 border border-gray-400 mr-2"></span>
                              <span className="text-gray-700">{ratios.find(r => r.id === result.ratio)?.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <button 
                          className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 transition-colors`}
                          onClick={() => {
                            // 保存为模板
                          }}
                        >
                          <FaBookmark className="mr-1.5 h-3.5 w-3.5" />
                          保存为模板
                        </button>
                        
                        <div className="flex space-x-2">
                          <button className={`inline-flex items-center px-3.5 py-2 text-sm rounded-lg font-medium text-white bg-${accent}-600 hover:bg-${accent}-700 transition-colors shadow-sm`}>
                            <FaDownload className="mr-1.5 h-3.5 w-3.5" />
                            下载
                          </button>
                          <button className={`inline-flex items-center px-3.5 py-2 text-sm rounded-lg font-medium text-white bg-${accent}-600 hover:bg-${accent}-700 transition-colors shadow-sm`}>
                            重新生成
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 杂志卡片结果 */}
              {result && mode === 'magazine' && (
                <div className="mt-10 border-t border-gray-200 pt-10">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <FaPalette className={`mr-2 h-5 w-5 text-${accent}-600`} />
                    杂志卡片预览
                  </h3>
                  
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">卡片详情</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">主题</h5>
                            <p className="text-gray-700">{result.topic}</p>
                          </div>
                          
                          <div>
                            <h5 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">风格</h5>
                            <div className="flex items-center">
                              <span className={`inline-block w-3 h-3 rounded-full bg-${accent}-500 mr-2`}></span>
                              <span className="text-gray-700">
                                {result.style ? magazineStyles.find(s => s.id === result.style)?.name : '随机生成风格'}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">创建日期</h5>
                            <p className="text-gray-700">2025-03-23</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                          <button className={`w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 transition-colors`}>
                            <FaBookmark className="mr-1.5 h-3.5 w-3.5" />
                            保存为模板
                          </button>
                          
                          <button className={`w-full inline-flex justify-center items-center px-4 py-2 text-sm rounded-lg font-medium text-white bg-${accent}-600 hover:bg-${accent}-700 transition-colors shadow-sm`}>
                            <FaDownload className="mr-1.5 h-3.5 w-3.5" />
                            导出为图片
                          </button>
                          
                          <button className={`w-full inline-flex justify-center items-center px-4 py-2 text-sm rounded-lg font-medium text-${accent}-600 bg-${accent}-50 hover:bg-${accent}-100 transition-colors`}>
                            <FaHistory className="mr-1.5 h-3.5 w-3.5" />
                            重新生成
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <FaShareAlt className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                          分享与导出
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                              <i className="fab fa-weixin text-lg"></i>
                            </div>
                            <span className="text-xs text-gray-700">微信</span>
                          </button>
                          
                          <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
                              <i className="fab fa-weibo text-lg"></i>
                            </div>
                            <span className="text-xs text-gray-700">微博</span>
                          </button>
                          
                          <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                              <i className="fas fa-link text-lg"></i>
                            </div>
                            <span className="text-xs text-gray-700">复制链接</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:w-1/2 order-1 lg:order-2">
                      <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
                        <div className="h-[600px] overflow-auto p-2">
                          <iframe 
                            srcDoc={result.html} 
                            title="Magazine Card Preview" 
                            className="w-full h-full border-0" 
                            sandbox="allow-same-origin"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-10">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaLightbulb className={`mr-2 h-5 w-5 text-${accent}-600`} />
                  创作提示
                </h3>
                
                <div className={`bg-${accent}-50 rounded-xl p-6`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">提高生成质量的建议</h4>
                      <ul className={`space-y-2 text-sm text-gray-600 pl-5`}>
                        <li className="flex items-start">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${accent}-500 mt-1.5 mr-2 flex-shrink-0`}></span>
                          描述越详细，生成的结果越接近您的想象
                        </li>
                        <li className="flex items-start">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${accent}-500 mt-1.5 mr-2 flex-shrink-0`}></span>
                          提及光线、构图和情绪可以获得更好的结果
                        </li>
                        <li className="flex items-start">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${accent}-500 mt-1.5 mr-2 flex-shrink-0`}></span>
                          尝试不同的艺术风格，发现新的创意可能
                        </li>
                        <li className="flex items-start">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${accent}-500 mt-1.5 mr-2 flex-shrink-0`}></span>
                          使用专业术语可以更精确地描述您想要的效果
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">使用示例</h4>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-600">
                        <p className="mb-2"><span className="font-medium">风景示例:</span> "黄昏时分的海滩，温暖的阳光洒在细腻的沙滩上，远处有棕榈树剪影，天空呈现渐变的橙红色和紫色，水彩风格"</p>
                        <p><span className="font-medium">肖像示例:</span> "一位戴着花冠的年轻女子侧脸特写，柔和的自然光线，背景是模糊的森林，油画风格，色调温暖"</p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-1">
                        <span>每次生成消耗 {mode === 'normal' ? '10' : '15'} 积分</span>
                        <Link href="/help/credits" className={`text-${accent}-600 hover:underline`}>查看积分说明</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}