import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaImage, FaDownload, FaPalette, FaRandom, 
  FaHistory, FaBookmark, FaShareAlt, FaLightbulb, FaMagic,
  FaInfoCircle, FaCrown, FaChevronDown, FaChevronRight, 
  FaCode, FaCopy, FaEye, FaExpand, FaCompress
} from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';

export default function ArtCards() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('minimalist');
  const [ratio, setRatio] = useState('1:1');
  const [mode, setMode] = useState('magazine'); // 默认设置为magazine模式
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStyleInfo, setShowStyleInfo] = useState(false);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  
  // 杂志卡片特定状态
  const [topic, setTopic] = useState('');
  const [magStyle, setMagStyle] = useState('minimalist'); // 默认选择极简主义风格
  const [previewHtml, setPreviewHtml] = useState('');
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // iframe预览引用
  const iframeRef = useRef(null);

  useEffect(() => {
    // 加载保存的模板
    setSavedTemplates([
      { id: 1, name: "科技创新", prompt: "如何用前沿科技改变未来生活", style: "futuristic-glam" },
      { id: 2, name: "可持续生活", prompt: "打造更环保、可持续的生活方式", style: "organic-natural" },
      { id: 3, name: "艺术欣赏", prompt: "如何欣赏和理解现代艺术作品", style: "contemporary-art" }
    ]);
  }, []);

  // 当结果更新时，如果是杂志模式，将HTML内容更新到iframe
  useEffect(() => {
    if (result && result.html && iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(result.html);
      iframeDoc.close();
    }
  }, [result]);

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
    { id: 'minimalist', name: '极简主义风格', desc: '遵循"少即是多"理念，简约、精致、留白，让内容成为焦点' },
    { id: 'bold-modern', name: '大胆现代风格', desc: '打破传统排版规则，鲜艳对比色、不对称布局，充满视觉冲击力' },
    { id: 'elegant-vintage', name: '优雅复古风格', desc: '重现20世纪初期印刷品美学，怀旧色调、古典排版，散发典雅气息' },
    { id: 'futuristic-glam', name: '极致未来主义风格', desc: '灵感源于科幻电影，霓虹色彩与金属质感，科技感十足' },
    { id: 'contemporary-art', name: '当代艺术风格', desc: '艺术展览般的布局，自由开放的排版，强调创意与艺术性' },
    { id: 'luxury-baroque', name: '奢华巴洛克风格', desc: '源自17世纪欧洲宫廷，华丽装饰、金色点缀，繁复而不失品味' },
    { id: 'organic-natural', name: '有机自然风格', desc: '大地色系、自然纹理，松散自由的排版，传达平和高级感' },
    { id: 'art-nouveau', name: '新艺术主义风格', desc: '19世纪末欧洲经典风格，流畅曲线、植物图案，浪漫优雅' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'normal' && !prompt.trim()) return;
    if (mode === 'magazine' && !topic.trim()) return;
    
    setLoading(true);
    setResult(null);
    setPreviewHtml('');
    
    try {
      if (mode === 'normal') {
        // 设置正常模式的模拟结果
        // 这里保留原有的模拟逻辑，实际项目中可以对接OpenAI API
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResult({
          url: '/hero-image.svg',
          prompt,
          style,
          ratio
        });
      } else {
        // 获取认证令牌
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          console.error('无法获取认证令牌');
          throw new Error('认证失败，请重新登录');
        }
        
        // 调用后端API生成杂志卡片
        const response = await fetch('/api/generate-art-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 添加认证令牌
          },
          body: JSON.stringify({
            topic: topic,
            style: magStyle
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '生成失败');
        }
        
        // 设置杂志模式的结果
        setPreviewHtml(data.html);
        setResult({
          html: data.html,
          topic: topic,
          style: magStyle
        });
      }
    } catch (error) {
      console.error('生成艺术卡片错误:', error);
      alert(`生成失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template) => {
    setTopic(template.prompt);
    setMagStyle(template.style);
    setShowTemplates(false);
  };

  const getButtonClass = (isPrimary) => {
    return isPrimary
      ? `flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium ${getAccentColor()} hover:opacity-90 transition-all shadow-sm`
      : `flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:border-gray-400 text-gray-700 font-medium transition-all`;
  };

  const getAccentColor = () => {
    return 'bg-blue-600';
  };

  // 复制HTML代码到剪贴板
  const copyHtmlCode = () => {
    if (result && result.html) {
      navigator.clipboard.writeText(result.html);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // 下载HTML文件
  const downloadHtml = () => {
    if (result && result.html) {
      const blob = new Blob([result.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-${magStyle}-card.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // 切换全屏预览
  const toggleFullScreen = () => {
    setFullScreenPreview(!fullScreenPreview);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>杂志艺术卡片生成 | HooTool AI</title>
        <meta name="description" content="使用AI生成精美的杂志艺术卡片" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <FaArrowLeft className="mr-2" /> 返回控制台
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">杂志艺术卡片生成</h1>
        </div>

        {fullScreenPreview && result ? (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl mx-auto">
              <button 
                onClick={toggleFullScreen}
                className="absolute top-0 right-0 m-4 p-2 bg-white rounded-full shadow-lg z-10"
              >
                <FaCompress className="text-gray-700" />
              </button>
              <div className="bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh]">
                <iframe
                  ref={fullScreenPreview ? null : iframeRef}
                  srcDoc={result.html}
                  title="杂志卡片全屏预览"
                  className="w-full border-none h-[90vh]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧控制面板 */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">生成设置</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">卡片主题</label>
                  </div>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="输入主题，如：人工智能的未来"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">输入主题后，AI将创建一张精美的杂志风格知识卡片</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">杂志风格</label>
                    <button
                      type="button"
                      onClick={() => setShowStyleInfo(!showStyleInfo)}
                      className="text-sm text-gray-500 flex items-center"
                    >
                      <FaInfoCircle className="mr-1" /> {showStyleInfo ? '隐藏风格说明' : '查看风格说明'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                    {magazineStyles.map((s) => (
                      <div
                        key={s.id}
                        className={`p-3 rounded-md cursor-pointer border transition-all ${
                          magStyle === s.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setMagStyle(s.id)}
                      >
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="font-medium">{s.name}</div>
                            {showStyleInfo && <div className="text-sm text-gray-500 mt-1">{s.desc}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !topic.trim()}
                  className={`w-full ${getButtonClass(true)} py-3 ${
                    loading || !topic.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      <FaMagic className="mr-2" /> 生成杂志卡片
                    </>
                  )}
                </button>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">推荐模板</h2>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-sm text-gray-500 flex items-center"
                  >
                    {showTemplates ? <FaChevronDown className="mr-1" /> : <FaChevronRight className="mr-1" />}
                    {showTemplates ? '收起' : '展开'}
                  </button>
                </div>
                
                {showTemplates && (
                  <div className="space-y-3">
                    {savedTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer"
                        onClick={() => applyTemplate(template)}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500 truncate mt-1">{template.prompt}</div>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {magazineStyles.find(s => s.id === template.style)?.name || template.style}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 功能说明卡片 */}
              <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="flex items-center text-blue-800 font-medium mb-2">
                  <FaCrown className="mr-2" /> 高级杂志卡片特性
                </h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    国际顶尖杂志视觉设计，8种精致风格
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    专业排版与精美布局，完整的HTML代码
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    一键下载，可直接用于个人网站或社交媒体
                  </li>
                </ul>
              </div>
            </div>

            {/* 右侧预览区域 */}
            <div className="lg:col-span-2">
              {result ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">卡片预览</h2>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={toggleFullScreen}
                          className={getButtonClass(false)}
                          aria-label="全屏预览"
                        >
                          <FaExpand className="mr-2" /> 全屏
                        </button>
                        <button
                          type="button"
                          onClick={downloadHtml}
                          className={getButtonClass(false)}
                          aria-label="下载HTML文件"
                        >
                          <FaDownload className="mr-2" /> 下载
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowHtmlCode(!showHtmlCode)}
                          className={getButtonClass(false)}
                        >
                          {showHtmlCode ? <FaEye className="mr-2" /> : <FaCode className="mr-2" />}
                          {showHtmlCode ? '查看预览' : '查看代码'}
                        </button>
                        {showHtmlCode && (
                          <button
                            type="button"
                            onClick={copyHtmlCode}
                            className={getButtonClass(false)}
                          >
                            <FaCopy className="mr-2" />
                            {copiedCode ? '已复制' : '复制代码'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {showHtmlCode ? (
                      // HTML代码预览
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-[600px] text-sm">
                          {result.html}
                        </pre>
                      </div>
                    ) : (
                      // 卡片预览
                      <div className="flex justify-center">
                        {mode === 'magazine' && (
                          <div className="w-full max-w-md overflow-hidden">
                            <iframe
                              ref={iframeRef}
                              title="杂志卡片预览"
                              className="w-full border-none min-h-[600px]"
                            />
                          </div>
                        )}
                        
                        {mode === 'normal' && (
                          <div className="relative">
                            <img src={result.url} alt={result.prompt} className="max-w-full h-auto rounded-md" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {mode === 'magazine' ? (
                        <div>
                          <p><span className="font-medium">主题:</span> {result.topic}</p>
                          <p><span className="font-medium">风格:</span> {magazineStyles.find(s => s.id === result.style)?.name || result.style}</p>
                        </div>
                      ) : (
                        <div>
                          <p><span className="font-medium">提示词:</span> {result.prompt}</p>
                          <p><span className="font-medium">风格:</span> {styles.find(s => s.id === result.style)?.name || result.style}</p>
                          <p><span className="font-medium">比例:</span> {result.ratio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 rounded-full p-6 mb-4 inline-block">
                    <FaImage className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">创建国际顶级杂志风格卡片</h3>
                  <p className="text-gray-500 max-w-md mb-4">
                    选择一种杂志风格，输入你想要的主题，AI将为你生成精美的杂志卡片，如同国际顶尖杂志般的视觉体验。
                  </p>
                  <div className="max-w-md">
                    <div className="grid grid-cols-4 gap-2">
                      {['minimalist', 'bold-modern', 'elegant-vintage', 'art-nouveau'].map((styleId) => (
                        <div 
                          key={styleId}
                          className="aspect-square rounded-md border border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                          onClick={() => setMagStyle(styleId)}
                        >
                          <div className="text-center p-2">
                            <div className={`w-6 h-6 mx-auto rounded-full ${
                              styleId === 'minimalist' ? 'bg-gray-200' :
                              styleId === 'bold-modern' ? 'bg-purple-400' :
                              styleId === 'elegant-vintage' ? 'bg-amber-200' :
                              'bg-pink-200'
                            }`}></div>
                            <p className="text-xs mt-1 font-medium text-gray-700">
                              {styleId === 'minimalist' ? '极简' :
                               styleId === 'bold-modern' ? '现代' :
                               styleId === 'elegant-vintage' ? '复古' :
                               '艺术'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}