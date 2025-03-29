import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaImage, FaReadme, FaChevronRight, 
  FaStar, FaDownload, FaHistory, FaRandom, FaCrown,
  FaPalette, FaRegLightbulb, FaCheck, FaTimes, FaRegFileImage,
  FaSave, FaAngleDown, FaSlidersH, FaPlus
} from 'react-icons/fa';
import { SiWechat } from 'react-icons/si';
import { supabase } from '../../../utils/supabase';

export default function CoverGenerator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverType, setCoverType] = useState('wechat'); // wechat或xiaohongshu
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('简约');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [colorTheme, setColorTheme] = useState('');
  const [composition, setComposition] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const router = useRouter();

  const styles = [
    { id: '简约', name: '简约', desc: '干净、清爽、留白，突出文字内容' },
    { id: '时尚', name: '时尚', desc: '现代、潮流、大胆，吸引年轻受众' },
    { id: '复古', name: '复古', desc: '怀旧、经典、做旧，唤起情感共鸣' },
    { id: '可爱', name: '可爱', desc: '活泼、萌趣、卡通，适合轻松内容' },
    { id: '商务', name: '商务', desc: '专业、沉稳、精致，适合职场内容' },
    { id: '创意', name: '创意', desc: '独特、新颖、艺术，突破常规思维' },
    { id: '科技', name: '科技', desc: '未来、数字、高科技，适合科技内容' },
    { id: '自然', name: '自然', desc: '有机、舒适、绿色，贴近自然生活' }
  ];

  const colorThemes = [
    { id: 'vibrant', name: '活力色彩', desc: '鲜艳饱和的色彩组合' },
    { id: 'pastel', name: '柔和色调', desc: '温和舒适的淡色系' },
    { id: 'monochrome', name: '单色渐变', desc: '同一色系的深浅变化' },
    { id: 'contrast', name: '强烈对比', desc: '对比色创造视觉冲击' },
    { id: 'warm', name: '暖色系', desc: '红、橙、黄等温暖色调' },
    { id: 'cool', name: '冷色系', desc: '蓝、绿、紫等冷静色调' }
  ];

  const compositions = [
    { id: 'centered', name: '居中构图', desc: '标题和元素居中排列' },
    { id: 'asymmetric', name: '不对称构图', desc: '创造视觉张力和动感' },
    { id: 'grid', name: '网格构图', desc: '整齐有序的布局方式' },
    { id: 'overlay', name: '叠加构图', desc: '文字覆盖在图像之上' },
    { id: 'frame', name: '框架构图', desc: '使用边框或装饰元素包围内容' }
  ];

  // 封面模板预设
  const templates = [
    // 公众号封面模板
    {
      id: 'wechat-minimal',
      type: 'wechat',
      name: '极简公众号封面',
      preview: '/images/templates/wechat-minimal.jpg',
      style: '简约',
      colorTheme: 'monochrome',
      composition: 'centered',
      prompt: '创建一个极简风格的公众号封面，以简洁的白色背景为主，使用细微的几何元素和留白空间营造高级感。标题采用优雅的无衬线字体，居中排布。整体设计简约克制，突出文字内容，适合专业和商务内容。'
    },
    {
      id: 'wechat-tech',
      type: 'wechat',
      name: '科技感公众号封面',
      preview: '/images/templates/wechat-tech.jpg',
      style: '科技',
      colorTheme: 'cool',
      composition: 'asymmetric',
      prompt: '设计一个具有未来科技感的公众号封面，使用深蓝色和青色调，搭配抽象的数字元素、电路图案或数据可视化元素。添加细微的网格背景和光效，创造高科技氛围。标题使用现代感强的字体，可采用不对称布局增加动感。'
    },
    {
      id: 'wechat-business',
      type: 'wechat',
      name: '商务专业公众号封面',
      preview: '/images/templates/wechat-business.jpg',
      style: '商务',
      colorTheme: 'monochrome',
      composition: 'grid',
      prompt: '创建一个专业商务风格的公众号封面，使用深蓝、灰色等商务色调，整洁的网格布局，简约的图表或图标元素。标题采用粗体无衬线字体，排版规整有力。整体设计要传达专业、可靠和权威的感觉，适合财经、管理、职场等内容。'
    },
    {
      id: 'wechat-creative',
      type: 'wechat',
      name: '创意艺术公众号封面',
      preview: '/images/templates/wechat-creative.jpg',
      style: '创意',
      colorTheme: 'vibrant',
      composition: 'asymmetric',
      prompt: '设计一个充满艺术感的创意公众号封面，使用大胆的色彩组合和不规则图形，可以融入手绘元素、拼贴风格或抽象艺术。字体选择要有设计感和个性，可以探索非传统的排版方式。整体设计要富有想象力和创新性，引人注目。'
    },
  
    // 小红书封面模板
    {
      id: 'xiaohongshu-fashion',
      type: 'xiaohongshu',
      name: '时尚潮流小红书封面',
      preview: '/images/templates/xiaohongshu-fashion.jpg',
      style: '时尚',
      colorTheme: 'vibrant',
      composition: 'overlay',
      prompt: '创建一个时尚潮流风格的小红书封面，使用鲜艳的对比色彩和大胆的图形元素。标题可以使用手写风格或时尚杂志常用的字体，搭配时尚元素如杂志剪贴、潮流单品插画等。可以添加时尚标签或简短描述，整体氛围要现代、活力且具有吸引力。'
    },
    {
      id: 'xiaohongshu-cute',
      type: 'xiaohongshu',
      name: '可爱风小红书封面',
      preview: '/images/templates/xiaohongshu-cute.jpg',
      style: '可爱',
      colorTheme: 'pastel',
      composition: 'centered',
      prompt: '设计一个可爱风格的小红书封面，使用柔和的粉色、薄荷绿等糖果色，可以添加卡通元素、简单插画或萌趣贴纸。字体选择圆润可爱的类型，可以加入一些装饰如小星星、爱心等。整体风格要活泼、轻松且吸引年轻受众。'
    },
    {
      id: 'xiaohongshu-lifestyle',
      type: 'xiaohongshu',
      name: '生活方式小红书封面',
      preview: '/images/templates/xiaohongshu-lifestyle.jpg',
      style: '自然',
      colorTheme: 'warm',
      composition: 'asymmetric',
      prompt: '创建一个生活方式主题的小红书封面，呈现自然、舒适的氛围。使用温暖的色调，可以融入植物、咖啡、书籍等生活元素的简约插画。字体选择优雅简约的类型，排版要自然流畅。整体设计要传达慢生活、品质生活的感觉，吸引追求生活品质的受众。'
    },
    {
      id: 'xiaohongshu-vintage',
      type: 'xiaohongshu',
      name: '复古风小红书封面',
      preview: '/images/templates/xiaohongshu-vintage.jpg',
      style: '复古',
      colorTheme: 'warm',
      composition: 'frame',
      prompt: '设计一个复古风格的小红书封面，使用怀旧的色调如褪色的棕色、米色和深红色。可以添加旧照片质感、纸张纹理、复古边框或老式印刷元素。字体选择经典的衬线字体或模仿老式打字机字体。整体设计要唤起怀旧情感，带有一种时光流转的美感。'
    }
  ];

  // 根据当前选择的封面类型过滤模板
  const filteredTemplates = templates.filter(template => template.type === coverType);

  useEffect(() => {
    // 检查用户是否已登录
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!title) return;
    
    setGenerating(true);
    
    // 生成封面的提示词
    let prompt = "";
    
    if (selectedTemplate) {
      // 使用选定模板的提示词
      prompt = selectedTemplate.prompt;
    } else {
      // 根据用户选择构建提示词
      let styleDesc = styles.find(s => s.id === style)?.desc || style;
      let colorDesc = colorTheme ? (colorThemes.find(c => c.id === colorTheme)?.desc || colorTheme) : "";
      let compDesc = composition ? (compositions.find(c => c.id === composition)?.desc || composition) : "";
      
      prompt = `创建一个${style}风格的${coverType === 'wechat' ? '公众号' : '小红书'}封面，`;
      if (colorTheme) prompt += `使用${colorDesc}，`;
      if (composition) prompt += `采用${compDesc}，`;
      prompt += `标题为"${title}"`;
      if (description) prompt += `，描述为"${description}"`;
      prompt += `。整体设计要${styleDesc}，吸引目标受众的注意。`;
    }
    
    console.log("生成提示词:", prompt);
    
    // 这里只是模拟处理过程，实际项目中会对接Anthropic API
    setTimeout(() => {
      setResult({
        url: '/images/sample-cover.jpg', // 这里使用示例图片
        type: coverType,
        title: title,
        description: description,
        style: style,
        prompt: prompt
      });
      setGenerating(false);
    }, 3000);
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setStyle(template.style);
    setColorTheme(template.colorTheme);
    setComposition(template.composition);
    setShowTemplates(false);
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
  };
  
  const getAccentColor = () => {
    return coverType === 'wechat' ? 'orange' : 'red';
  };
  
  const accent = getAccentColor();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 relative">
            <div className={`absolute top-0 left-0 right-0 bottom-0 border-4 border-${accent}-600 border-solid rounded-full`}></div>
            <div className={`absolute top-0 left-0 right-0 bottom-0 border-4 border-${accent}-100 border-solid rounded-full animate-spin border-t-transparent`}></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>封面生成 - HooTool AI</title>
        <meta name="description" content="使用AI生成精美的公众号和小红书封面" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className={`text-gray-500 hover:text-${accent}-600 mr-3`}>
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <FaRegFileImage className={`h-5 w-5 text-${accent}-600 mr-2`} />
                <h1 className="text-xl font-bold text-gray-900">封面生成</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
              >
                <FaHistory className="mr-2 h-4 w-4" />
                使用模板
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 模板选择面板 */}
          {showTemplates && (
            <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">选择模板</h2>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id 
                          ? `border-${accent}-500 ring-2 ring-${accent}-500 ring-opacity-50` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectTemplate(template)}
                    >
                      <div className="h-32 bg-gray-200 relative">
                        {/* 这里应该放模板预览图，现在用颜色块代替 */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-${template.type === 'wechat' ? 'green' : 'red'}-400 to-${template.type === 'wechat' ? 'green' : 'red'}-600 opacity-60`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">模板预览</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span className={`inline-block w-2 h-2 rounded-full bg-${accent}-500 mr-1`}></span>
                          <span>{template.style} · {colorThemes.find(c => c.id === template.colorTheme)?.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-xl overflow-hidden">
            {/* 封面类型切换 */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => {
                    setCoverType('wechat');
                    setSelectedTemplate(null);
                  }}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    coverType === 'wechat'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <SiWechat className="mr-2 h-5 w-5" />
                    公众号封面
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCoverType('xiaohongshu');
                    setSelectedTemplate(null);
                  }}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    coverType === 'xiaohongshu'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <FaReadme className="mr-2 h-5 w-5" />
                    小红书封面
                  </div>
                </button>
              </nav>
            </div>
            
            {/* 设计/历史记录选项卡 */}
            <div className="border-b border-gray-200">
              <nav className="flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('design')}
                  className={`px-6 py-3 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'design'
                      ? `border-${accent}-500 text-${accent}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FaPalette className="mr-2 h-4 w-4" />
                    设计封面
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-3 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? `border-${accent}-500 text-${accent}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FaHistory className="mr-2 h-4 w-4" />
                    历史记录
                  </div>
                </button>
              </nav>
            </div>
            
            {/* 设计封面内容 */}
            {activeTab === 'design' && (
              <div className="p-6">
                {selectedTemplate && (
                  <div className={`mb-6 p-4 rounded-lg bg-${accent}-50 border border-${accent}-100`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FaRegLightbulb className={`h-5 w-5 text-${accent}-500 mr-2`} />
                        <div>
                          <h3 className="font-medium text-gray-900">使用模板: {selectedTemplate.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            风格: {selectedTemplate.style}，
                            色彩: {colorThemes.find(c => c.id === selectedTemplate.colorTheme)?.name}，
                            构图: {compositions.find(c => c.id === selectedTemplate.composition)?.name}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={clearTemplate}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FaTimes className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleGenerate}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        文章标题 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className={`shadow-sm focus:ring-${accent}-500 focus:border-${accent}-500 block w-full sm:text-sm border-gray-300 rounded-lg`}
                        placeholder="输入标题，例如：如何提升工作效率的10个小技巧"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        简短描述 (可选)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={2}
                        className={`shadow-sm focus:ring-${accent}-500 focus:border-${accent}-500 block w-full sm:text-sm border-gray-300 rounded-lg`}
                        placeholder="添加简短描述，增强封面视觉效果，例如：实用技巧帮助你事半功倍"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="style" className="block text-sm font-medium text-gray-700">
                          封面风格
                        </label>
                        <button
                          type="button"
                          onClick={() => setAdvancedOptions(!advancedOptions)}
                          className={`text-sm text-${accent}-600 flex items-center`}
                        >
                          <FaSlidersH className="mr-1 h-3.5 w-3.5" />
                          {advancedOptions ? '隐藏高级选项' : '显示高级选项'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {styles.map((styleOption) => (
                          <div
                            key={styleOption.id}
                            className={`
                              cursor-pointer rounded-lg border p-3 transition-all
                              ${style === styleOption.id 
                                ? `border-${accent}-500 bg-${accent}-50` 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            onClick={() => setStyle(styleOption.id)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-900">{styleOption.name}</span>
                              {style === styleOption.id && (
                                <FaCheck className={`h-3.5 w-3.5 text-${accent}-500`} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {advancedOptions && (
                      <>
                        <div>
                          <label htmlFor="colorTheme" className="block text-sm font-medium text-gray-700 mb-1">
                            色彩主题 (可选)
                          </label>
                          <select
                            id="colorTheme"
                            name="colorTheme"
                            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${accent}-500 focus:border-${accent}-500 sm:text-sm rounded-lg`}
                            value={colorTheme}
                            onChange={(e) => setColorTheme(e.target.value)}
                          >
                            <option value="">-- 选择色彩主题 --</option>
                            {colorThemes.map((theme) => (
                              <option key={theme.id} value={theme.id}>
                                {theme.name} - {theme.desc}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="composition" className="block text-sm font-medium text-gray-700 mb-1">
                            构图方式 (可选)
                          </label>
                          <select
                            id="composition"
                            name="composition"
                            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${accent}-500 focus:border-${accent}-500 sm:text-sm rounded-lg`}
                            value={composition}
                            onChange={(e) => setComposition(e.target.value)}
                          >
                            <option value="">-- 选择构图方式 --</option>
                            {compositions.map((comp) => (
                              <option key={comp.id} value={comp.id}>
                                {comp.name} - {comp.desc}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${accent}-500`}
                        onClick={() => {
                          // 随机选择风格
                          const randomStyle = styles[Math.floor(Math.random() * styles.length)].id;
                          setStyle(randomStyle);
                          
                          if (advancedOptions) {
                            // 随机选择色彩主题和构图
                            const randomColor = colorThemes[Math.floor(Math.random() * colorThemes.length)].id;
                            const randomComp = compositions[Math.floor(Math.random() * compositions.length)].id;
                            setColorTheme(randomColor);
                            setComposition(randomComp);
                          }
                        }}
                      >
                        <FaRandom className="mr-2 h-4 w-4" />
                        随机风格
                      </button>
                      
                      <button
                        type="submit"
                        disabled={generating || !title.trim()}
                        className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-${accent}-600 hover:bg-${accent}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${accent}-500 disabled:opacity-50 transition-colors`}
                      >
                        {generating ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            生成中...
                          </>
                        ) : (
                          <>
                            <FaImage className="mr-2 h-4 w-4" />
                            生成封面
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                
                {generating && (
                  <div className="mt-8 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className={`inline-block h-12 w-12 relative`}>
                        <div className={`absolute top-0 left-0 right-0 bottom-0 border-4 border-${accent}-600 border-solid rounded-full`}></div>
                        <div className={`absolute top-0 left-0 right-0 bottom-0 border-4 border-${accent}-100 border-solid rounded-full animate-spin border-t-transparent`}></div>
                      </div>
                      <p className="mt-4 text-base text-gray-600">正在生成您的封面...</p>
                      <p className="mt-2 text-sm text-gray-500">这可能需要几秒钟</p>
                    </div>
                  </div>
                )}
                
                {result && (
                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">生成结果</h3>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="lg:w-2/3">
                        <div className={`bg-gradient-to-r from-${accent}-50 to-gray-50 p-1 rounded-xl shadow-sm`}>
                          <div className="aspect-[16/9] bg-white rounded-lg overflow-hidden flex items-center justify-center">
                            <img 
                              src={result.url} 
                              alt="生成的封面"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 transition-colors`}>
                            <FaDownload className="mr-1.5 h-3.5 w-3.5" />
                            下载封面
                          </button>
                          <button className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 transition-colors`}>
                            <FaSave className="mr-1.5 h-3.5 w-3.5" />
                            保存到收藏
                          </button>
                          <button className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm rounded-lg font-medium text-white bg-${accent}-600 hover:bg-${accent}-700 transition-colors`}>
                            <FaRandom className="mr-1.5 h-3.5 w-3.5" />
                            重新生成
                          </button>
                        </div>
                      </div>
                      
                      <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          <div className="border-b border-gray-200 px-4 py-3">
                            <h4 className="font-medium text-gray-900">封面详情</h4>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <h5 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">类型</h5>
                              <div className="flex items-center">
                                {coverType === 'wechat' ? (
                                  <>
                                    <SiWechat className="h-4 w-4 text-green-600 mr-2" />
                                    <span className="text-gray-900">公众号封面</span>
                                  </>
                                ) : (
                                  <>
                                    <FaReadme className="h-4 w-4 text-red-500 mr-2" />
                                    <span className="text-gray-900">小红书封面</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">标题</h5>
                              <p className="text-gray-900">{result.title}</p>
                            </div>
                            
                            {result.description && (
                              <div>
                                <h5 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">描述</h5>
                                <p className="text-gray-900">{result.description}</p>
                              </div>
                            )}
                            
                            <div>
                              <h5 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">风格</h5>
                              <div className="flex flex-wrap gap-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${accent}-100 text-${accent}-800`}>
                                  {result.style}
                                </span>
                                {colorTheme && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                    {colorThemes.find(c => c.id === colorTheme)?.name}
                                  </span>
                                )}
                                {composition && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
                                    {compositions.find(c => c.id === composition)?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">生成提示词</h5>
                              <div className="bg-gray-50 p-2 rounded-md">
                                <p className="text-xs text-gray-600 whitespace-pre-wrap">{result.prompt}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <div className="flex items-center mb-4">
                    <FaRegLightbulb className={`h-5 w-5 text-${accent}-500 mr-2`} />
                    <h3 className="text-lg font-medium text-gray-900">效果提升提示</h3>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <FaCheck className={`h-4 w-4 text-${accent}-500 mr-2`} />
                            提高效果的建议
                          </h4>
                          <ul className="space-y-2.5 text-sm text-gray-700">
                            <li className="flex items-start">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${accent}-500 mt-1.5 mr-2 flex-shrink-0`}></span>
                              提供详细的内容标题和简短描述，能帮助AI更好地理解主题
                            </li>
                            <li className="flex items-start">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${accent}-500 mt-1.5 mr-2 flex-shrink-0`}></span>
                              选择与内容主题匹配的风格，如商务内容选择"商务"风格
                            </li>
                            <li className="flex items-start">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${accent}-500 mt-1.5 mr-2 flex-shrink-0`}></span>
                              使用高级选项可以更精确地控制封面的视觉效果
                            </li>
                            <li className="flex items-start">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${accent}-500 mt-1.5 mr-2 flex-shrink-0`}></span>
                              尝试多种组合，找到最适合你的内容的视觉效果
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <FaCrown className={`h-4 w-4 text-${accent}-500 mr-2`} />
                            专业用户技巧
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                            <p className="mb-3">高转化率封面的特点:</p>
                            <ul className="space-y-1.5">
                              <li className="flex items-start">
                                <FaChevronRight className={`h-3 w-3 text-${accent}-500 mt-1 mr-1.5 flex-shrink-0`} />
                                清晰易读的标题，避免过多文字堆砌
                              </li>
                              <li className="flex items-start">
                                <FaChevronRight className={`h-3 w-3 text-${accent}-500 mt-1 mr-1.5 flex-shrink-0`} />
                                与内容相关的视觉元素，提高关联性
                              </li>
                              <li className="flex items-start">
                                <FaChevronRight className={`h-3 w-3 text-${accent}-500 mt-1 mr-1.5 flex-shrink-0`} />
                                独特和吸引人的设计，在信息流中脱颖而出
                              </li>
                              <li className="flex items-start">
                                <FaChevronRight className={`h-3 w-3 text-${accent}-500 mt-1 mr-1.5 flex-shrink-0`} />
                                一致的品牌风格，增强品牌识别度
                              </li>
                            </ul>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-1">
                            <span>每次生成消耗 {coverType === 'wechat' ? '10' : '12'} 积分</span>
                            <Link href="/help/credits" className={`text-${accent}-600 hover:underline`}>积分说明</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 历史记录选项卡 */}
            {activeTab === 'history' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">历史生成记录</h3>
                  <div className="flex items-center">
                    <select
                      className={`mr-2 text-sm border-gray-300 rounded-md focus:ring-${accent}-500 focus:border-${accent}-500`}
                      defaultValue="all"
                    >
                      <option value="all">全部类型</option>
                      <option value="wechat">公众号封面</option>
                      <option value="xiaohongshu">小红书封面</option>
                    </select>
                    <button 
                      className={`p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100`}
                      title="清空历史记录"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* 历史记录为空状态 */}
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className={`h-16 w-16 rounded-full bg-${accent}-100 flex items-center justify-center text-${accent}-600 mb-4`}>
                    <FaHistory className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">暂无历史记录</h4>
                  <p className="text-sm text-gray-500 max-w-sm mb-6">
                    您还没有生成任何封面。开始创建您的第一个精美封面吧！
                  </p>
                  <button
                    onClick={() => setActiveTab('design')}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-${accent}-600 hover:bg-${accent}-700`}
                  >
                    <FaPlus className="mr-2 h-4 w-4" />
                    创建新封面
                  </button>
                </div>
                
                {/* 历史记录列表 - 实际应用中取消注释并填充数据 */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="h-32 bg-gray-200 relative">
                        <div className={`absolute inset-0 bg-gradient-to-br from-${i % 2 === 0 ? 'green' : 'red'}-400 to-${i % 2 === 0 ? 'green' : 'red'}-600 opacity-60`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold">封面预览</span>
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            i % 2 === 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {i % 2 === 0 ? '公众号封面' : '小红书封面'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 truncate">
                          示例标题 #{i+1}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          简短描述示例文本
                        </p>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex justify-between">
                        <button className="text-gray-500 hover:text-gray-700">
                          <FaDownload className="h-4 w-4" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <FaRegFileImage className="h-4 w-4" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <FaStar className="h-4 w-4" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div> */}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}