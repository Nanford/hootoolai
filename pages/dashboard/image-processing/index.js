import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaUpload, FaImage, FaDownload, FaMagic, 
  FaTrash, FaSpinner, FaCopy, FaRedo, FaHistory, FaEye,
  FaInfoCircle, FaLightbulb, FaRegCheckCircle, FaRegStar,
  FaTimes, FaChevronRight, FaPlus
} from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';

export default function ImageProcessing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processType, setProcessType] = useState('enhance');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [dragActive, setDragActive] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [intensity, setIntensity] = useState(50);
  const [selectedStyle, setSelectedStyle] = useState('natural');
  const [recentResults, setRecentResults] = useState([]);
  const router = useRouter();
  const fileInputRef = useRef(null);

  const processTypes = [
    { 
      id: 'enhance', 
      name: '图像增强', 
      description: '提高图像清晰度和质量', 
      icon: '✨',
      cost: 5,
      advanced: true
    },
    { 
      id: 'style', 
      name: '风格转换', 
      description: '将图像转换为不同艺术风格', 
      icon: '🎨',
      cost: 10,
      advanced: true
    },
    { 
      id: 'remove-bg', 
      name: '移除背景', 
      description: '自动移除图像背景', 
      icon: '✂️',
      cost: 8,
      advanced: false
    },
    { 
      id: 'upscale', 
      name: '超分辨率', 
      description: '提高图像分辨率，保持清晰度', 
      icon: '🔍',
      cost: 12,
      advanced: true
    },
    { 
      id: 'repair', 
      name: '图像修复', 
      description: '修复受损或有瑕疵的图像', 
      icon: '🔧',
      cost: 7,
      advanced: true
    },
    { 
      id: 'color', 
      name: '色彩调整', 
      description: '优化图像的色彩平衡和饱和度', 
      icon: '🌈',
      cost: 6,
      advanced: true
    },
  ];

  const styleOptions = [
    { id: 'natural', name: '自然风格', description: '保持原始图像的自然外观' },
    { id: 'oil', name: '油画风格', description: '转换为油画艺术风格' },
    { id: 'watercolor', name: '水彩风格', description: '柔和的水彩画效果' },
    { id: 'sketch', name: '素描风格', description: '黑白素描效果' },
    { id: 'comic', name: '漫画风格', description: '动漫或漫画风格' },
    { id: 'neon', name: '霓虹风格', description: '鲜艳的霓虹灯效果' },
  ];

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
      
      // 模拟加载最近处理结果
      setRecentResults([
        {
          id: 1,
          originalUrl: '/images/sample-1-original.jpg',
          resultUrl: '/images/sample-1-result.jpg',
          type: 'enhance',
          date: '2023-05-15',
          name: '风景照片增强'
        },
        {
          id: 2,
          originalUrl: '/images/sample-2-original.jpg',
          resultUrl: '/images/sample-2-result.jpg',
          type: 'remove-bg',
          date: '2023-05-13',
          name: '产品图背景移除'
        },
        {
          id: 3,
          originalUrl: '/images/sample-3-original.jpg',
          resultUrl: '/images/sample-3-result.jpg',
          type: 'style',
          date: '2023-05-10',
          name: '照片油画风格转换'
        }
      ]);
    };

    checkUser();
  }, [router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    processFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('请上传 JPG 或 PNG 格式的图片');
      return;
    }
    
    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }
    
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setActiveTab('process');
  };

  const handleProcessImage = async () => {
    if (!image) return;
    
    setProcessing(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 设置模拟结果
      setResult({
        url: preview, // 在实际应用中会替换为处理后的图像
        type: processType,
        style: processType === 'style' ? selectedStyle : null,
        intensity: showAdvancedOptions ? intensity : 50,
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error('处理图像错误:', error);
    } finally {
      setProcessing(false);
    }
  };

  const resetImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setActiveTab('upload');
    setProcessType('enhance');
    setIntensity(50);
    setSelectedStyle('natural');
    setShowAdvancedOptions(false);
  };

  const getProcessTypeName = (id) => {
    const type = processTypes.find(t => t.id === id);
    return type ? type.name : '';
  };

  const getStyleName = (id) => {
    const style = styleOptions.find(s => s.id === id);
    return style ? style.name : '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 relative">
            <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-blue-600 border-solid rounded-full"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-blue-100 border-solid rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>图像处理 - HooTool AI</title>
        <meta name="description" content="使用AI进行图像处理，包括增强、风格转换和背景移除" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 mr-3">
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <FaImage className="h-5 w-5 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">图像处理</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                  activeTab === 'history' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <FaHistory className="inline-block mr-1.5 mb-0.5" />
                处理记录
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* 选项卡导航 */}
          <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => !result && setActiveTab('upload')}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'upload'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${result ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={result}
                >
                  <div className="flex items-center justify-center">
                    <FaUpload className="mr-2 h-4 w-4" />
                    上传图片
                  </div>
                </button>
                <button
                  onClick={() => preview && setActiveTab('process')}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'process'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${!preview ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!preview}
                >
                  <div className="flex items-center justify-center">
                    <FaMagic className="mr-2 h-4 w-4" />
                    处理选项
                  </div>
                </button>
                <button
                  onClick={() => result && setActiveTab('result')}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'result'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!result}
                >
                  <div className="flex items-center justify-center">
                    <FaEye className="mr-2 h-4 w-4" />
                    处理结果
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* 上传图片 */}
          {activeTab === 'upload' && (
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">上传图片</h2>
                  <p className="text-sm text-gray-500 mb-6">选择或拖放图片以开始处理</p>
                  
                  <div 
                    className={`border-2 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} rounded-xl p-8 transition-all`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="flex flex-col items-center justify-center text-center cursor-pointer">
                      <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <FaUpload className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">点击或拖放上传</h3>
                      <p className="text-sm text-gray-500 mb-4 max-w-md">
                        支持 PNG, JPG, JPEG 格式，最大 5MB
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                      >
                        选择图片
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                  />
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaLightbulb className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">使用建议</h3>
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p>• 上传高质量的原始图像，会得到更好的处理效果</p>
                        <p>• 不同处理模式适用于不同场景，请根据需求选择</p>
                        <p>• 处理后的图像可以下载或保存到您的账户中</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 快速处理示例 */}
                {recentResults.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">近期处理示例</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentResults.slice(0, 3).map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="aspect-video bg-gray-100 relative overflow-hidden">
                            <img 
                              src={item.resultUrl || preview} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                                <span className="text-xs text-white">{getProcessTypeName(item.type)}</span>
                                <button className="text-white p-1 hover:bg-white/20 rounded">
                                  <FaEye className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 处理选项 */}
          {activeTab === 'process' && (
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* 左侧：预览图 */}
                  <div className="lg:w-1/3">
                    <h3 className="text-base font-medium text-gray-900 mb-3">原始图片</h3>
                    <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                      <div className="aspect-square">
                        <img 
                          src={preview} 
                          alt="原始图片" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {image && <span>{(image.size / 1024 / 1024).toFixed(2)} MB</span>}
                      </div>
                      <button
                        onClick={resetImage}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center"
                      >
                        <FaTrash className="h-3.5 w-3.5 mr-1" />
                        移除图片
                      </button>
                    </div>
                  </div>
                  
                  {/* 右侧：处理选项 */}
                  <div className="lg:w-2/3">
                    <h3 className="text-base font-medium text-gray-900 mb-3">选择处理模式</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {processTypes.map((type) => (
                        <div 
                          key={type.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            processType === type.id 
                              ? 'border-blue-500 bg-blue-50 shadow-sm' 
                              : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                          onClick={() => {
                            setProcessType(type.id);
                            // 重置高级选项
                            if (type.id === 'style') {
                              setShowAdvancedOptions(true);
                            }
                          }}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 text-xl mr-3">{type.icon}</div>
                            <div>
                              <h4 className={`font-medium mb-0.5 ${processType === type.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                {type.name}
                              </h4>
                              <p className="text-xs text-gray-500 mb-2">{type.description}</p>
                              <div className="flex items-center text-xs">
                                <span className={`px-1.5 py-0.5 rounded-full ${processType === type.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                  {type.cost} 积分
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 处理模式的高级选项 */}
                    {processType === 'style' && (
                      <div className="mb-6 border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-base font-medium text-gray-900">选择风格</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {styleOptions.map((style) => (
                            <div 
                              key={style.id}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                selectedStyle === style.id 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                              onClick={() => setSelectedStyle(style.id)}
                            >
                              <div className="flex justify-between">
                                <h4 className="text-sm font-medium text-gray-900">{style.name}</h4>
                                {selectedStyle === style.id && (
                                  <FaRegCheckCircle className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{style.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 通用高级选项 */}
                    <div className="mb-6">
                      <button
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="flex items-center text-sm font-medium text-gray-700"
                      >
                        {showAdvancedOptions ? (
                          <FaChevronRight className="h-3.5 w-3.5 mr-1.5 transform rotate-90" />
                        ) : (
                          <FaChevronRight className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        高级选项
                      </button>
                      
                      {showAdvancedOptions && (
                        <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="mb-4">
                            <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-1">
                              处理强度: {intensity}%
                            </label>
                            <input
                              type="range"
                              id="intensity"
                              min="0"
                              max="100"
                              step="1"
                              value={intensity}
                              onChange={(e) => setIntensity(parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>轻微</span>
                              <span>强烈</span>
                            </div>
                          </div>
                          
                          {processType === 'enhance' && (
                            <div>
                              <div className="flex items-center mb-2">
                                <input
                                  id="preserve-details"
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="preserve-details" className="ml-2 block text-sm text-gray-700">
                                  保留更多细节
                                </label>
                              </div>
                              <div className="flex items-center mb-2">
                                <input
                                  id="reduce-noise"
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="reduce-noise" className="ml-2 block text-sm text-gray-700">
                                  减少噪点
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id="enhance-colors"
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="enhance-colors" className="ml-2 block text-sm text-gray-700">
                                  增强色彩
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleProcessImage}
                        disabled={processing}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors disabled:opacity-50"
                      >
                        {processing ? (
                          <>
                            <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                            处理中...
                          </>
                        ) : (
                          <>
                            <FaMagic className="h-5 w-5 mr-2" />
                            开始处理
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 处理结果 */}
          {activeTab === 'result' && result && (
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">处理结果</h2>
                
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* 对比视图 */}
                  <div className="lg:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">原始图像</h3>
                        <div className="bg-gray-100 rounded-lg overflow-hidden">
                          <div className="aspect-square">
                            <img 
                              src={preview} 
                              alt="原始图像" 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">处理后图像</h3>
                        <div className="bg-gray-100 rounded-lg overflow-hidden relative group">
                          <div className="aspect-square">
                            <img 
                              src={result.url} 
                              alt="处理后图像" 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                              <span className="text-xs text-white bg-blue-600 px-2 py-1 rounded">
                                {getProcessTypeName(result.type)}
                              </span>
                              <div>
                                <button className="bg-white/20 p-1.5 rounded-full text-white mx-1 hover:bg-white/30">
                                  <FaCopy className="h-3.5 w-3.5" />
                                </button>
                                <button className="bg-white/20 p-1.5 rounded-full text-white mx-1 hover:bg-white/30">
                                  <FaDownload className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 transition-colors">
                        <FaCopy className="mr-1.5 h-3.5 w-3.5" />
                        复制图片
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 transition-colors">
                        <FaDownload className="mr-1.5 h-3.5 w-3.5" />
                        下载图片
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        <FaRedo className="mr-1.5 h-3.5 w-3.5" />
                        重新处理
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 transition-colors">
                        <FaRegStar className="mr-1.5 h-3.5 w-3.5" />
                        收藏
                      </button>
                    </div>
                  </div>
                  
                  {/* 处理详情 */}
                  <div className="lg:w-1/3">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">处理详情</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">处理类型</h4>
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getProcessTypeName(result.type)}
                            </span>
                            {result.style && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {getStyleName(result.style)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">处理日期</h4>
                          <p className="text-gray-900">{formatDate(result.date)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">处理参数</h4>
                          <div className="flex items-center">
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">
                              强度: {result.intensity}%
                            </div>
                            {result.style && (
                              <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                                风格: {getStyleName(result.style)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">文件大小</h4>
                          <p className="text-gray-900">
                            {image && <span>原始: {(image.size / 1024 / 1024).toFixed(2)} MB</span>}
                            {image && <span className="mx-2">→</span>}
                            <span>处理后: 约 {(image ? image.size * 0.85 / 1024 / 1024 : 0).toFixed(2)} MB</span>
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">AI 处理引擎</h4>
                          <p className="text-gray-900">OpenAI DALL-E 3</p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">消耗积分</h4>
                          <div className="flex items-center">
                            <span className="text-gray-900 font-medium">
                              {processTypes.find(t => t.id === result.type)?.cost || 5} 积分
                            </span>
                            <div className="ml-2 text-xs text-blue-600 hover:underline cursor-pointer">
                              积分说明
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-4 bg-blue-50 border-t border-blue-100">
                        <div className="flex items-center">
                          <FaInfoCircle className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                          <p className="text-xs text-blue-700">
                            AI 处理可能无法满足所有需求。如对结果不满意，您可以调整参数重新处理或联系我们的客服寻求帮助。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 相关处理建议 */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">您可能还想尝试</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {processTypes.filter(t => t.id !== result.type).slice(0, 3).map((type) => (
                      <div 
                        key={type.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => {
                          setProcessType(type.id);
                          setActiveTab('process');
                        }}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 text-xl mr-3">{type.icon}</div>
                          <div>
                            <h4 className="font-medium text-gray-900">{type.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 mb-2">{type.description}</p>
                            <button className="text-xs text-blue-600 font-medium flex items-center">
                              尝试这个
                              <FaChevronRight className="ml-1 h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 历史记录 */}
          {activeTab === 'history' && (
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">处理历史记录</h2>
                  <div className="flex items-center space-x-2">
                    <select className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option>所有类型</option>
                      {processTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {recentResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentResults.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className="relative">
                          <div className="aspect-video bg-gray-100 relative">
                            <img 
                              src={item.resultUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getProcessTypeName(item.type)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                            </div>
                            <div className="flex space-x-1">
                              <button className="text-gray-400 hover:text-gray-600 p-1">
                                <FaDownload className="h-3.5 w-3.5" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600 p-1">
                                <FaTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                            <button className="text-xs text-gray-500 hover:text-gray-700">查看原图</button>
                            <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                              再次处理
                              <FaChevronRight className="ml-1 h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* 添加新处理按钮 */}
                    <div className="border border-dashed border-gray-300 rounded-lg flex items-center justify-center h-full min-h-[200px] cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors" onClick={resetImage}>
                      <div className="text-center px-4 py-8">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                          <FaPlus className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">处理新图像</h3>
                        <p className="text-xs text-gray-500">上传一张新图片开始处理</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                      <FaHistory className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">暂无处理记录</h4>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">
                      您还没有处理任何图像。上传一张图片，体验AI图像处理的强大功能。
                    </p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaUpload className="mr-2 h-4 w-4" />
                      上传图片
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 底部提示区域 */}
          {activeTab !== 'history' && (
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaLightbulb className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">图像处理小贴士</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <ul className="space-y-1.5">
                          <li className="flex items-start">
                            <FaRegCheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>上传高质量的原始图像，会得到更好的处理效果</span>
                          </li>
                          <li className="flex items-start">
                            <FaRegCheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>图像增强适合修复模糊、低质量的图像</span>
                          </li>
                          <li className="flex items-start">
                            <FaRegCheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>风格转换可以为图像添加艺术效果，如油画、水彩等</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <ul className="space-y-1.5">
                          <li className="flex items-start">
                            <FaRegCheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>移除背景功能适合产品摄影和人像处理</span>
                          </li>
                          <li className="flex items-start">
                            <FaRegCheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>使用高级选项可以更精确地控制处理效果</span>
                          </li>
                          <li className="flex items-start">
                            <FaRegCheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>处理后的图像可以下载或保存到您的收藏夹中</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center text-xs text-gray-500">
                      <span>
                        每次处理消耗 5-20 积分，具体取决于处理类型和图像大小
                      </span>
                      <Link href="/pricing" className="text-blue-600 hover:text-blue-800 hover:underline">
                        了解积分政策
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}