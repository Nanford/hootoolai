import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaUpload, FaImage, FaDownload, FaMagic, 
  FaTrash, FaSpinner, FaCopy, FaLightbulb, FaRegCheckCircle
} from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';

export default function ImageEditing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showTips, setShowTips] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // 示例修改指令
  const exampleInstructions = [
    "将图片中的背景改为夜空中的星星，保持前景不变",
    "给图像添加暖色调滤镜，并增加光晕效果",
    "把图像转换为水彩画风格，保持原有的构图",
    "移除图像中的所有文字",
    "将图片背景模糊化，让主体更加突出",
    "将照片中的白天场景转换为黄昏场景",
    "给图片中的人物添加卡通风格的效果",
    "将图像转换为黑白电影效果，增加适当的胶片颗粒感",
    "把照片中的草地变成鲜花盛开的场景",
    "添加雨天效果，包括水滴和潮湿的地面"
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
      
      // 获取修改历史记录
      try {
        const { data, error } = await supabase
          .from('image_processing_history')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('process_type', 'edit')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (!error && data) {
          setHistory(data);
        }
      } catch (err) {
        console.error('获取历史记录失败:', err);
      }
      
      setLoading(false);
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
    setResult(null); // 清除之前的结果
  };

  const resetImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setInstructions('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditImage = async () => {
    if (!image || !instructions.trim()) {
      alert('请上传图片并输入修改指令');
      return;
    }
    
    setEditing(true);
    
    try {
      // 获取认证令牌
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        console.error('无法获取认证令牌');
        throw new Error('认证失败，请重新登录');
      }
      
      // 将图片转换为base64
      const reader = new FileReader();
      
      // 使用Promise包装FileReader
      const imageBase64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });
      
      // 调用修改API
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image: imageBase64,
          processType: 'edit',
          instructions: instructions
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'INSUFFICIENT_CREDITS') {
          alert('您的积分不足，请充值后再使用图片修改服务');
          setEditing(false);
          return;
        }
        throw new Error(errorData.message || '图片修改失败');
      }
      
      const data = await response.json();
      
      // 设置修改结果
      setResult({
        url: data.url,
        date: new Date().toISOString(),
        message: data.textResponse || '修改完成',
        instructions: instructions
      });
      
      // 更新历史记录
      setHistory(prev => [{
        id: Date.now(),
        original_image: preview,
        result_image: data.url,
        prompt: instructions,
        created_at: new Date().toISOString()
      }, ...prev]);
      
    } catch (error) {
      console.error('修改图像错误:', error);
      alert(`修改失败: ${error.message}`);
    } finally {
      setEditing(false);
    }
  };

  const useExampleInstruction = (example) => {
    setInstructions(example);
  };

  const downloadImage = async (url, filename = 'edited-image.png') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('下载图像失败:', error);
      alert('下载失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        <span className="ml-2 text-gray-700">加载中...</span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>图像修改 - HooTool AI</title>
        <meta name="description" content="使用AI通过文字指令修改图像" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/dashboard/image-processing" className="flex items-center text-gray-600 hover:text-gray-900">
              <FaArrowLeft className="mr-2" />
              <span>返回图像服务</span>
            </Link>
            <button onClick={() => router.push('/dashboard/image-processing/generate')} className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <FaMagic className="mr-2 h-4 w-4" />
              <span>切换到图像生成</span>
            </button>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              <span className="block">AI图像修改</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              使用文字指令智能修改你的图像
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">修改图像</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 左侧：上传图片区域 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">1. 上传要修改的图片</h3>
                  
                  {!preview ? (
                    <div 
                      className={`border-2 ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-dashed border-gray-300'} rounded-lg p-8 transition-all cursor-pointer`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                          <FaUpload className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h3 className="text-md font-medium text-gray-900 mb-1">点击或拖放上传</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          支持 PNG, JPG, JPEG 格式，最大 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={preview} 
                            alt="预览图" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <button
                          onClick={resetImage}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white text-gray-600 hover:text-red-500"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 flex justify-between">
                        <span>{image && `${(image.size / 1024 / 1024).toFixed(2)} MB • ${image.type.split('/')[1].toUpperCase()}`}</span>
                        <button 
                          onClick={() => fileInputRef.current.click()}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          更换图片
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 右侧：输入修改指令 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">2. 输入修改指令</h3>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="请输入修改指令，例如：将图片中的背景改为夜空中的星星，保持前景不变"
                    rows="5"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    指令越详细，修改效果越理想。请明确说明要修改的内容和保留的内容。
                  </p>
                  
                  <div className="mt-4">
                    <button
                      onClick={handleEditImage}
                      disabled={editing || !preview || !instructions.trim()}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editing ? (
                        <>
                          <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                          修改中...
                        </>
                      ) : (
                        <>
                          <FaMagic className="h-5 w-5 mr-2" />
                          开始修改 (12积分)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 显示修改结果 */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">修改结果</h2>
                
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
                    <h3 className="text-sm font-medium text-gray-700 mb-2">修改后图像</h3>
                    <div className="bg-gray-100 rounded-lg overflow-hidden relative group">
                      <div className="aspect-square">
                        <img 
                          src={result.url} 
                          alt="修改后图像" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => downloadImage(result.url, `edited-${Date.now()}.png`)}
                            className="bg-white rounded-full p-2 hover:bg-gray-100"
                          >
                            <FaDownload className="h-5 w-5 text-gray-700" />
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(result.url);
                              alert('图片URL已复制到剪贴板');
                            }}
                            className="bg-white rounded-full p-2 hover:bg-gray-100"
                          >
                            <FaCopy className="h-5 w-5 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">修改指令</h3>
                  <p className="text-sm text-gray-600">{result.instructions}</p>
                </div>
                
                {result.message && (
                  <div className="mt-3 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <h3 className="text-sm font-medium text-indigo-800 mb-2">AI反馈</h3>
                    <p className="text-sm text-indigo-700">{result.message}</p>
                  </div>
                )}
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <button 
                    onClick={() => downloadImage(result.url, `edited-${Date.now()}.png`)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md font-medium bg-white hover:bg-gray-50 text-gray-700"
                  >
                    <FaDownload className="mr-1.5 h-4 w-4" />
                    下载图像
                  </button>
                  <button 
                    onClick={() => {
                      setInstructions(result.instructions);
                      setResult(null);
                    }} 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaMagic className="mr-1.5 h-4 w-4" />
                    重新修改
                  </button>
                  <button 
                    onClick={resetImage}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md font-medium bg-white hover:bg-gray-50 text-gray-700"
                  >
                    <FaUpload className="mr-1.5 h-4 w-4" />
                    上传新图片
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 修改指令示例 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">指令示例</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {exampleInstructions.map((example, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    onClick={() => useExampleInstruction(example)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-indigo-600 mt-0.5">
                        <FaLightbulb className="h-4 w-4" />
                      </div>
                      <p className="ml-2 text-sm text-gray-700">{example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 修改历史 */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">修改历史</h2>
                  <Link href="/dashboard/history" className="text-sm text-indigo-600 hover:text-indigo-800">
                    查看全部
                  </Link>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {history.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        <div className="aspect-square bg-gray-100">
                          <img 
                            src={item.result_image} 
                            alt="修改后图像" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={() => downloadImage(item.result_image)}
                            className="bg-white/80 p-1.5 rounded-full text-gray-700 hover:bg-white"
                          >
                            <FaDownload className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {item.prompt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 使用技巧 */}
          {showTips && (
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaLightbulb className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <div className="flex justify-between">
                    <h3 className="text-md font-medium text-indigo-900">图像修改小技巧</h3>
                    <button 
                      onClick={() => setShowTips(false)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-indigo-700">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FaRegCheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>明确指出要修改的部分和要保留的部分</span>
                      </li>
                      <li className="flex items-start">
                        <FaRegCheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>描述想要的风格和效果，如"水彩画风格"、"黑白效果"</span>
                      </li>
                      <li className="flex items-start">
                        <FaRegCheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>提供具体的颜色变化，如"将红色背景改为蓝色"</span>
                      </li>
                      <li className="flex items-start">
                        <FaRegCheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>修改指令越详细，效果越好，但保持简洁清晰</span>
                      </li>
                      <li className="flex items-start">
                        <FaRegCheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>复杂的修改可能需要多次尝试，可以使用之前的结果继续修改</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-xs text-indigo-600">每次修改消耗 12 积分，修改后的图像归您所有</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 