import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaSpinner, FaMagic, FaDownload, 
  FaCopy, FaHistory, FaLightbulb, FaImage
} from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';

export default function ImageGeneration() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showTips, setShowTips] = useState(true);
  const router = useRouter();

  // 示例提示词
  const examplePrompts = [
    "一只可爱的卡通熊猫正在竹林中吃竹子，3D渲染风格",
    "未来科技城市的夜景，霓虹灯，赛博朋克风格",
    "山顶上的城堡，阳光明媚，写实风格",
    "海滩上的日落，粉色和紫色的天空，油画风格",
    "厨房中摆放着新鲜水果和蔬菜的静物画，超写实风格",
    "宇航员站在外星球表面，背景是壮观的星系，科幻风格",
    "神秘的猫站在魔法书架前，周围环绕着魔法粒子，梦幻风格",
    "传统中国水墨画风格的山水，云雾缭绕的山峰和流水",
    "雨中的城市街道，地面反光，模糊的霓虹灯，电影风格",
    "传统日本花园中盛开的樱花树下，远处有穿着和服的女孩"
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
      
      // 获取生成历史记录
      try {
        const { data, error } = await supabase
          .from('image_processing_history')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('process_type', 'generate')
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

  const handleGenerateImage = async () => {
    if (!prompt) {
      alert('请输入图像描述提示词');
      return;
    }
    
    setGenerating(true);
    
    try {
      // 获取认证令牌
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        console.error('无法获取认证令牌');
        throw new Error('认证失败，请重新登录');
      }
      
      // 调用生成API
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          processType: 'generate',
          generatePrompt: prompt
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'INSUFFICIENT_CREDITS') {
          alert('您的积分不足，请充值后再使用图片生成服务');
          setGenerating(false);
          return;
        }
        throw new Error(errorData.message || '图片生成失败');
      }
      
      const data = await response.json();
      
      // 设置生成结果
      setResult({
        url: data.url,
        date: new Date().toISOString(),
        message: data.textResponse || '生成完成',
        prompt: prompt
      });
      
      // 更新历史记录
      setHistory(prev => [{
        id: Date.now(),
        result_image: data.url,
        prompt: prompt,
        created_at: new Date().toISOString()
      }, ...prev]);
      
    } catch (error) {
      console.error('生成图像错误:', error);
      alert(`生成失败: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const useExamplePrompt = (example) => {
    setPrompt(example);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const downloadImage = async (url, filename = 'generated-image.png') => {
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
        <title>图像生成 - HooTool AI</title>
        <meta name="description" content="使用AI从文本描述生成高质量图像" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/dashboard/image-processing" className="flex items-center text-gray-600 hover:text-gray-900">
              <FaArrowLeft className="mr-2" />
              <span>返回图像服务</span>
            </Link>
            <button onClick={() => router.push('/dashboard/image-processing/edit')} className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <FaImage className="mr-2 h-4 w-4" />
              <span>切换到图像修改</span>
            </button>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              <span className="block">AI图像生成</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              使用文本描述生成高质量图像，释放你的创意
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">创建图像</h2>
              
              <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                  描述你想要的图像 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="prompt"
                  rows="4"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：一只可爱的卡通熊猫正在竹林中吃竹子，3D渲染风格"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  描述越详细，生成的图像质量越高。包括场景、风格、颜色等细节。
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateImage}
                  disabled={generating || !prompt.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <FaMagic className="h-5 w-5 mr-2" />
                      生成图像 (15积分)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 生成结果 */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">生成结果</h2>
                
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <div className="aspect-square relative group">
                    <img 
                      src={result.url} 
                      alt="生成的图像" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => downloadImage(result.url, `generated-${Date.now()}.png`)}
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
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">生成提示词</h3>
                  <p className="text-sm text-gray-600">{result.prompt}</p>
                </div>
                
                {result.message && (
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <h3 className="text-sm font-medium text-indigo-800 mb-2">AI反馈</h3>
                    <p className="text-sm text-indigo-700">{result.message}</p>
                  </div>
                )}
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <button 
                    onClick={() => downloadImage(result.url, `generated-${Date.now()}.png`)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md font-medium bg-white hover:bg-gray-50 text-gray-700"
                  >
                    <FaDownload className="mr-1.5 h-4 w-4" />
                    下载图像
                  </button>
                  <button 
                    onClick={() => setPrompt(result.prompt)} 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaMagic className="mr-1.5 h-4 w-4" />
                    重新生成
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/image-processing/edit')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md font-medium bg-white hover:bg-gray-50 text-gray-700"
                  >
                    <FaImage className="mr-1.5 h-4 w-4" />
                    修改这张图片
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 提示词示例 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">提示词示例</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {examplePrompts.map((example, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    onClick={() => useExamplePrompt(example)}
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

          {/* 生成历史 */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">生成历史</h2>
                  <Link href="/dashboard/history" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                    <FaHistory className="h-3.5 w-3.5 mr-1" />
                    查看全部
                  </Link>
                </div>
                
                <div className="grid gap-6 md:grid-cols-3">
                  {history.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-100 relative">
                        <img 
                          src={item.result_image} 
                          alt="生成的图像" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(item.result_image);
                              }}
                              className="bg-white/80 p-1.5 rounded-full text-gray-700 hover:bg-white"
                            >
                              <FaDownload className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrompt(item.prompt);
                                window.scrollTo({top: 0, behavior: 'smooth'});
                              }}
                              className="bg-white/80 p-1.5 rounded-full text-gray-700 hover:bg-white"
                            >
                              <FaMagic className="h-3.5 w-3.5" />
                            </button>
                          </div>
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
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 mt-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaLightbulb className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <div className="flex justify-between">
                    <h3 className="text-md font-medium text-indigo-900">图像生成小技巧</h3>
                    <button 
                      onClick={() => setShowTips(false)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-indigo-700">
                    <ul className="space-y-2">
                      <li>• 描述要具体，包括场景、对象、颜色、光线、风格等细节</li>
                      <li>• 添加艺术风格，如"油画风格"、"水彩画风格"、"3D渲染"等</li>
                      <li>• 指定图像的视角，如"俯视图"、"特写镜头"、"全景图"等</li>
                      <li>• 提及光线效果，如"日落时的柔和光线"、"戏剧性照明"等</li>
                      <li>• 如果生成结果不理想，尝试调整提示词并重新生成</li>
                    </ul>
                    <p className="mt-3 text-xs text-indigo-600">每次生成消耗 15 积分，生成的图像归您所有</p>
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