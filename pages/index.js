import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaRocket, FaImage, FaComment, FaPalette, FaNewspaper, FaCheck, FaMagic, FaArrowRight, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { supabase } from '../utils/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
      }
      
      setLoading(false);
    };

    checkUser();
  }, []);

  useEffect(() => {
    // 点击页面其他区域时关闭用户菜单
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('退出登录错误:', error.message);
        return;
      }
      
      setUser(null);
      setShowUserMenu(false);
    } catch (error) {
      console.error('退出登录错误:', error.message);
    }
  };

  const handleStartUsingClick = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>HooTool AI - 智能工具平台</title>
        <meta name="description" content="HooTool AI 是一个强大的AI工具平台，提供图片处理、艺术卡片生成、封面设计和智能聊天助手等功能" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 导航栏 */}
      <nav className="border-b border-gray-100 sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FaMagic className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  HooTool AI
                </span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <a href="#features" className="border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  功能
                </a>
                <Link href="/pricing" className="border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  价格
                </Link>
                <a href="#cases" className="border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  使用案例
                </a>
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {user ? (
                <div className="flex items-center space-x-4" ref={userMenuRef}>
                  <div 
                    className="flex items-center cursor-pointer relative"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <span className="text-gray-700 mr-2">{user.user_metadata?.nickname || user.email?.split('@')[0] || '用户'}</span>
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                      <FaUser className="h-4 w-4" />
                    </div>
                    {showUserMenu && (
                      <div className="absolute right-0 top-full w-48 py-2 mt-2 bg-white rounded-md shadow-xl z-20">
                        <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FaRocket className="mr-2 h-4 w-4 text-gray-500" />
                          控制面板
                        </Link>
                        <Link href="/dashboard/account" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FaCog className="mr-2 h-4 w-4 text-gray-500" />
                          账户设置
                        </Link>
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaSignOutAlt className="mr-2 h-4 w-4 text-gray-500" />
                          退出登录
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link 
                    href="/auth/login"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    登录
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    免费注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-16 pb-20 md:pt-20 md:pb-28 lg:flex lg:items-center lg:gap-12">
            <div className="max-w-xl lg:max-w-lg">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">专业AI工具</span>
                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  简化您的创作工作
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                HooTool AI 集合图片处理、艺术创作、内容生成和智能聊天于一体，让AI技术为您的工作带来前所未有的效率提升。
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:gap-4">
                <button 
                  onClick={handleStartUsingClick}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {user ? '立即体验' : '开始使用'}
                  <FaArrowRight className="ml-2 h-4 w-4" />
                </button>
                <a 
                  href="#features"
                  className="mt-4 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition-all"
                >
                  浏览功能
                </a>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:flex-1">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-md">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply opacity-30 animate-blob"></div>
                <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-2000"></div>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-1">
                      <div className="h-64 sm:h-80 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <div className="text-center p-6">
                          <FaMagic className="h-12 w-12 text-white/90 mx-auto mb-4" />
                          <div className="text-xl text-white font-bold">AI 创作助手</div>
                          <div className="text-sm text-white/80 mt-2">智能生成、高效创作</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 特性说明 */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">功能特性</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              一站式AI创作平台
            </p>
            <p className="mt-4 text-xl text-gray-600">
              我们提供多种AI工具，满足您在图像处理、内容创作和交互方面的各种需求
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* 图片处理 */}
              <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-100 h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white mb-5">
                    <FaImage className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">图片处理</h3>
                  <p className="text-gray-600 flex-grow">
                    基于OpenAI API的强大图像处理能力，可进行图像优化、风格转换、背景移除等操作。
                  </p>
                  <a href="#" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    了解更多 <FaArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* 艺术卡片 */}
              <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-100 h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-600 text-white mb-5">
                    <FaPalette className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">艺术卡片</h3>
                  <p className="text-gray-600 flex-grow">
                    使用Anthropic API生成精美艺术卡片，适用于各类社交媒体、邀请函和数字艺术创作。
                  </p>
                  <a href="#" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    了解更多 <FaArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* 封面生成 */}
              <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-100 h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-orange-500 text-white mb-5">
                    <FaNewspaper className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">封面生成</h3>
                  <p className="text-gray-600 flex-grow">
                    专为公众号和小红书设计的封面生成工具，一键创建吸引眼球的精美封面。
                  </p>
                  <a href="#" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    了解更多 <FaArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* 聊天机器人 */}
              <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-100 h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white mb-5">
                    <FaComment className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">AI助手</h3>
                  <p className="text-gray-600 flex-grow">
                    基于DeepSeek的智能聊天助手，可以回答问题、提供建议、协助写作和创意构思。
                  </p>
                  <a href="#" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    了解更多 <FaArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 价格方案 */}
      <div id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">价格方案</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              选择适合您的方案
            </p>
            <p className="mt-4 text-xl text-gray-600">
              我们提供灵活的定价选项，满足不同用户的需求
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-5xl lg:mx-auto">
            {/* 免费方案 */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-100">
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900">免费版</h2>
                <p className="mt-2 text-gray-600">适合个人轻度使用和体验</p>
                <p className="mt-6">
                  <span className="text-5xl font-bold text-gray-900">¥0</span>
                  <span className="text-gray-600 ml-2">/月</span>
                </p>
                <Link href="/auth/signup" className="mt-8 block w-full py-3 px-4 bg-white border border-gray-300 text-blue-600 font-medium rounded-lg text-center hover:bg-gray-50 transition-colors">
                  免费开始
                </Link>
              </div>
              <div className="bg-gray-50 px-8 py-6">
                <h3 className="text-sm font-medium text-gray-900">包含功能</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">每月100积分</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">基础图片处理</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">标准艺术卡片生成</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">基础AI助手功能</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 专业方案 */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-300 relative">
              <div className="absolute top-0 right-0">
                <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">推荐</div>
              </div>
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900">专业版</h2>
                <p className="mt-2 text-gray-600">适合内容创作者和小型团队</p>
                <p className="mt-6">
                  <span className="text-5xl font-bold text-gray-900">¥49</span>
                  <span className="text-gray-600 ml-2">/月</span>
                </p>
                <Link href="/pricing?plan=pro" className="mt-8 block w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg text-center hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                  选择专业版
                </Link>
              </div>
              <div className="bg-blue-50 px-8 py-6">
                <h3 className="text-sm font-medium text-gray-900">包含功能</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">每月1000积分</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">高级图片处理</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">高质量艺术卡片和封面</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">完整AI助手功能</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">优先客户支持</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 团队方案 */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-100">
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900">团队版</h2>
                <p className="mt-2 text-gray-600">适合创意团队和企业使用</p>
                <p className="mt-6">
                  <span className="text-5xl font-bold text-gray-900">¥199</span>
                  <span className="text-gray-600 ml-2">/月</span>
                </p>
                <Link href="/pricing?plan=team" className="mt-8 block w-full py-3 px-4 bg-white border border-gray-300 text-blue-600 font-medium rounded-lg text-center hover:bg-gray-50 transition-colors">
                  选择团队版
                </Link>
              </div>
              <div className="bg-gray-50 px-8 py-6">
                <h3 className="text-sm font-medium text-gray-900">包含功能</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">每月5000积分</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">最高质量图片和艺术作品</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">5个团队成员账户</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">API访问权限</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600">专属客户经理</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 使用案例 */}
      <div id="cases" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">使用案例</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              看看他们如何使用HooTool AI
            </p>
            <p className="mt-4 text-xl text-gray-600">
              来自不同行业的用户分享了他们使用我们AI工具的成功案例
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "内容创作者提升效率",
                desc: "某知名自媒体作者使用我们的工具每周生成10+精美封面，为其公众号吸引了更多读者。",
                color: "from-blue-500 to-indigo-600"
              },
              {
                title: "设计师的创意助手",
                desc: "一名自由设计师利用我们的艺术卡片功能，为客户提供更多创意选择，业务量增长35%。",
                color: "from-indigo-500 to-purple-600"
              },
              {
                title: "营销团队的秘密武器",
                desc: "一家营销公司使用我们的AI助手，提高了内容创作效率，每月节省了20+小时的工作时间。",
                color: "from-blue-500 to-cyan-600"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
                <div className={`h-48 bg-gradient-to-r ${item.color} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center p-8">
                      <FaMagic className="h-10 w-10 mx-auto mb-4 opacity-90" />
                      <p className="text-lg font-bold">成功案例 #{i+1}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {item.desc}
                  </p>
                  <div>
                    <Link 
                      href={`/case-study/${i+1}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      查看详情 <FaArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">准备好开始使用了吗？</span>
              <span className="block text-blue-200 text-2xl mt-3 font-normal">
                {user ? '进入控制面板，探索AI创作的无限可能' : '免费注册，立即体验AI创作的无限可能'}
              </span>
            </h2>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row lg:mt-0 lg:ml-8">
            <button
              onClick={handleStartUsingClick}
              className="flex-shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 shadow-md hover:shadow-lg transition-all"
            >
              {user ? '进入控制面板' : '立即注册'}
            </button>
            <a
              href="#features"
              className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-800/30 hover:bg-blue-800/40 transition-all"
            >
              了解更多
            </a>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center">
              <FaMagic className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HooTool AI
              </span>
            </Link>
          </div>
          <div className="mt-8 flex justify-center space-x-6">
            <Link href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
              服务条款
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
              隐私政策
            </Link>
            <a href="mailto:support@hootoolai.com" className="text-gray-500 hover:text-gray-900 transition-colors">
              联系我们
            </a>
          </div>
          <p className="mt-8 text-center text-gray-500">
            &copy; 2023 HooTool AI. 保留所有权利.
          </p>
        </div>
      </footer>
    </div>
  );
}