import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaRobot, FaImage, FaRegNewspaper, FaPalette, 
  FaUser, FaSignOutAlt, FaBolt, FaChartLine, 
  FaHistory, FaCrown, FaQuestion, FaPlus,
  FaRegBell, FaRegStar, FaMagic, FaRocket
} from 'react-icons/fa';
import { supabase } from '../../utils/supabase';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tools');
  const [creditUsage, setCreditUsage] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      // 模拟获取用户数据
      setCreditUsage(35); // 假设用户已使用35%的积分
      setLoading(false);
    };

    checkUser();
  }, [router]);

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
      router.push('/');
    } catch (error) {
      console.error('退出登录错误:', error.message);
    }
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

  // 最近使用记录
  const recentActivities = [
    { id: 1, tool: '图片处理', date: '今天 14:30', status: '已完成', result: '2张图片' },
    { id: 2, tool: 'AI助手', date: '昨天 20:15', status: '已完成', result: '对话2000字' },
    { id: 3, tool: '封面生成', date: '3天前', status: '已完成', result: '1张封面' },
  ];

  // 示例文档
  const documents = [
    { id: 1, title: '如何高效使用AI助手', type: '教程', date: '2023-05-20' },
    { id: 2, title: '小红书爆款封面设计指南', type: '指南', date: '2023-06-15' },
    { id: 3, title: '图片处理常见问题', type: 'FAQ', date: '2023-07-10' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>控制台 - HooTool AI</title>
        <meta name="description" content="HooTool AI工具平台控制台" />
      </Head>

      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FaMagic className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  HooTool AI
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none">
                <FaRegBell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              <div className="border-l border-gray-200 h-6 mx-2"></div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white cursor-pointer">
                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || <FaUser className="h-4 w-4" />}
                  </div>
                </div>
                <div className="ml-3" ref={userMenuRef}>
                  <div 
                    className="text-sm font-medium text-gray-700 cursor-pointer relative"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    {user?.user_metadata?.nickname || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    {showUserMenu && (
                      <div className="absolute right-0 top-full w-48 py-2 mt-2 bg-white rounded-md shadow-xl z-20">
                        <Link href="/dashboard/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          账户设置
                        </Link>
                        <Link href="/pricing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          升级账户
                        </Link>
                        <button 
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          退出登录
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">免费用户</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 欢迎消息与积分状态 */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md overflow-hidden">
              <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="w-full flex-1 sm:w-auto">
                    <h2 className="text-2xl leading-8 font-bold text-white">
                      {`早上好，${user?.user_metadata?.nickname || user?.user_metadata?.full_name || user?.email?.split('@')[0]}`}
                    </h2>
                    <p className="mt-2 text-base text-blue-100">
                      欢迎回到 HooTool AI，今天您想创作什么？
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">剩余积分</span>
                        <span className="font-bold">65 / 100</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2" 
                          style={{ width: `${100 - creditUsage}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-blue-100 flex justify-between">
                        <span>本月已使用: {creditUsage}%</span>
                        <Link href="/pricing" className="text-white underline hover:no-underline">
                          升级账户
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 sm:px-10">
                <div className="text-sm text-blue-100">
                  <span className="font-medium text-white"><FaBolt className="inline-block mr-1" /> 提示：</span> 使用我们的新功能"批量图片处理"可以一次性处理多达10张图片，大幅提升工作效率！
                </div>
              </div>
            </div>
          </div>

          {/* 选项卡导航 */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tools')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tools'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                我的工具
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                最近使用记录
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                账户信息
              </button>
              <button
                onClick={() => setActiveTab('help')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'help'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                帮助文档
              </button>
            </nav>
          </div>

          {/* 工具卡片区域 */}
          {activeTab === 'tools' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 图片处理工具 */}
                <Link href="/dashboard/image-processing" className="group">
                  <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-md transition-all duration-300 hover:shadow-xl hover:border-blue-100 h-full group-hover:translate-y-[-4px]">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <FaImage className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">图片处理</h3>
                          <p className="text-sm text-gray-500">利用OpenAI技术处理图片</p>
                        </div>
                      </div>
                      <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                            消耗1-5积分/张
                          </span>
                          <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                            开始使用 <FaRocket className="ml-1 h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 艺术卡片生成 */}
                <Link href="/dashboard/art-cards" className="group">
                  <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-md transition-all duration-300 hover:shadow-xl hover:border-blue-100 h-full group-hover:translate-y-[-4px]">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center">
                          <FaPalette className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">艺术卡片</h3>
                          <p className="text-sm text-gray-500">通过Anthropic API生成艺术卡片</p>
                        </div>
                      </div>
                      <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                            消耗5积分/张
                          </span>
                          <span className="inline-flex items-center text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
                            开始使用 <FaRocket className="ml-1 h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 公众号/小红书封面 */}
                <Link href="/dashboard/cover-generator" className="group">
                  <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-md transition-all duration-300 hover:shadow-xl hover:border-blue-100 h-full group-hover:translate-y-[-4px]">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                          <FaRegNewspaper className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">封面生成</h3>
                          <p className="text-sm text-gray-500">生成公众号和小红书封面</p>
                        </div>
                      </div>
                      <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600">
                            消耗8积分/张
                          </span>
                          <span className="inline-flex items-center text-sm font-medium text-orange-500 group-hover:translate-x-1 transition-transform">
                            开始使用 <FaRocket className="ml-1 h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 聊天机器人 */}
                <Link href="/dashboard/chat" className="group">
                  <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-md transition-all duration-300 hover:shadow-xl hover:border-blue-100 h-full group-hover:translate-y-[-4px]">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                          <FaRobot className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">AI助手</h3>
                          <p className="text-sm text-gray-500">基于DeepSeek的智能聊天助手</p>
                        </div>
                      </div>
                      <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                            消耗1积分/1000字
                          </span>
                          <span className="inline-flex items-center text-sm font-medium text-green-500 group-hover:translate-x-1 transition-transform">
                            开始使用 <FaRocket className="ml-1 h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 推荐工具组合 */}
              <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">推荐工具组合</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">社交媒体内容创作套装</h3>
                        <p className="text-sm text-gray-500 mt-1">完整的社交媒体内容创作工作流，从创意到发布</p>
                      </div>
                      <Link href="/dashboard/workflows/social-media" className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        查看详情
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <FaRobot className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">步骤1: 内容构思</h4>
                          <p className="text-xs text-gray-500">使用AI助手生成创意</p>
                        </div>
                      </div>
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <FaRegNewspaper className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">步骤2: 设计封面</h4>
                          <p className="text-xs text-gray-500">使用封面生成工具</p>
                        </div>
                      </div>
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <FaPalette className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">步骤3: 创建图文</h4>
                          <p className="text-xs text-gray-500">使用艺术卡片生成配图</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 最近使用记录选项卡 */}
          {activeTab === 'activity' && (
            <div className="bg-white overflow-hidden shadow rounded-xl">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">最近使用记录</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">查看您最近使用的工具和结果</p>
                </div>
                <Link href="/dashboard/history" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  查看全部
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <div className="overflow-hidden overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          工具
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          使用时间
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          结果
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                {activity.tool === '图片处理' && <FaImage className="h-4 w-4" />}
                                {activity.tool === 'AI助手' && <FaRobot className="h-4 w-4" />}
                                {activity.tool === '封面生成' && <FaRegNewspaper className="h-4 w-4" />}
                                {activity.tool === '艺术卡片' && <FaPalette className="h-4 w-4" />}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{activity.tool}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{activity.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.result}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/dashboard/history/${activity.id}`} className="text-blue-600 hover:text-blue-900">
                              查看
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 账户信息选项卡 */}
          {activeTab === 'account' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-xl">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">账户信息</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">您的账户信息和使用限额</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">用户名</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.user_metadata?.nickname || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">账户类型</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        免费用户
                      </span>
                      <Link href="/pricing" className="ml-3 text-sm text-blue-600 hover:text-blue-500">
                        升级账户
                      </Link>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">剩余积分</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex items-center">
                        <span className="font-medium">65 / 100</span>
                        <div className="ml-4 w-48 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 rounded-full h-2" 
                            style={{ width: `${100 - creditUsage}%` }}
                          ></div>
                        </div>
                        <Link href="/pricing" className="ml-3 text-sm text-blue-600 hover:text-blue-500">
                          购买积分
                        </Link>
                      </div>
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">注册日期</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">2023-05-15</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">账户操作</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 flex flex-wrap gap-3">
                      <Link href="/dashboard/account" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <FaUser className="mr-2 h-4 w-4 text-gray-500" />
                        编辑个人资料
                      </Link>
                      <Link href="/dashboard/billing" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <FaChartLine className="mr-2 h-4 w-4 text-gray-500" />
                        消费记录
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaSignOutAlt className="mr-2 h-4 w-4 text-gray-500" />
                        退出登录
                      </button>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* 帮助文档选项卡 */}
          {activeTab === 'help' && (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-xl mb-8">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">帮助文档</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">查看如何使用HooTool AI平台的各项功能</p>
                  </div>
                  <a href="mailto:support@hootoolai.com" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    联系支持
                  </a>
                </div>
                <div className="border-t border-gray-200">
                  <div className="bg-gray-50 px-4 py-5 sm:px-6">
                    <div className="text-base text-gray-800 font-medium mb-4">快速入门</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 常见问题 */}
                      <Link href="/help/faq" className="flex p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <FaQuestion className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-base font-medium text-gray-900">常见问题</h4>
                          <p className="text-sm text-gray-500">解答使用过程中的常见问题</p>
                        </div>
                      </Link>
                      
                      {/* 积分说明 */}
                      <Link href="/help/credits" className="flex p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <FaBolt className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-base font-medium text-gray-900">积分说明</h4>
                          <p className="text-sm text-gray-500">了解积分如何计算和使用</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:px-6">
                    <div className="text-base text-gray-800 font-medium mb-4">功能指南</div>
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <Link href={`/help/docs/${doc.id}`} key={doc.id} className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start">
                              <FaRegStar className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div className="ml-3">
                                <h4 className="text-base font-medium text-gray-900">{doc.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {doc.type}
                                  </span>
                                  <span className="ml-2 text-gray-500">
                                    更新于: {doc.date}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <FaArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl overflow-hidden shadow-sm border border-blue-100">
                <div className="px-6 py-8 flex flex-col md:flex-row items-center justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <h3 className="text-xl font-bold text-gray-900">需要帮助？</h3>
                    <p className="mt-2 text-gray-600">如果您有任何问题或需要技术支持，请随时联系我们的客服团队</p>
                  </div>
                  <div className="flex space-x-4">
                    <a
                      href="mailto:support@hootoolai.com"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                      发送邮件
                    </a>
                    <Link
                      href="/help/contact"
                      className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      在线客服
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/help" className="text-gray-400 hover:text-gray-500">
              帮助中心
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-500">
              服务条款
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-gray-500">
              隐私政策
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-400">
              &copy; 2023 HooTool AI. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}