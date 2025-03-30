import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaCheck, FaMagic, FaArrowRight } from 'react-icons/fa';
import { supabase } from '../utils/supabase';

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // 处理订阅按钮点击
  const handleSubscribe = (plan) => {
    if (!user) {
      router.push(`/auth/login?redirect=/pricing&plan=${plan}`);
      return;
    }
    
    // 这里可以接入支付系统
    router.push(`/dashboard/billing/checkout?plan=${plan}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>价格方案 - HooTool AI</title>
        <meta name="description" content="HooTool AI 的价格方案，选择适合您需求的计划" />
      </Head>

      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
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
              {user ? (
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  返回控制台
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                    登录
                  </Link>
                  <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-md hover:shadow-lg">
                    免费注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 价格方案内容 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 标题区域 */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold text-gray-900">选择适合您的方案</h1>
            <p className="mt-4 text-xl text-gray-600">
              灵活的价格选项，满足从个人创作者到企业团队的各种需求
            </p>
          </div>

          {/* 价格卡片 */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:max-w-5xl lg:mx-auto">
            {/* 免费方案 */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-100">
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900">免费版</h2>
                <p className="mt-2 text-gray-600">适合个人轻度使用和体验</p>
                <p className="mt-6">
                  <span className="text-5xl font-bold text-gray-900">¥0</span>
                  <span className="text-gray-600 ml-2">/月</span>
                </p>
                {user ? (
                  <button 
                    onClick={() => handleSubscribe('free')}
                    className="mt-8 block w-full py-3 px-4 bg-white border border-gray-300 text-blue-600 font-medium rounded-lg text-center hover:bg-gray-50 transition-colors"
                  >
                    当前方案
                  </button>
                ) : (
                  <Link 
                    href="/auth/signup" 
                    className="mt-8 block w-full py-3 px-4 bg-white border border-gray-300 text-blue-600 font-medium rounded-lg text-center hover:bg-gray-50 transition-colors"
                  >
                    免费开始
                  </Link>
                )}
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
                <button 
                  onClick={() => handleSubscribe('pro')}
                  className="mt-8 block w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg text-center hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  选择专业版
                </button>
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
                <button 
                  onClick={() => handleSubscribe('team')}
                  className="mt-8 block w-full py-3 px-4 bg-white border border-gray-300 text-blue-600 font-medium rounded-lg text-center hover:bg-gray-50 transition-colors"
                >
                  选择团队版
                </button>
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

          {/* 积分包 */}
          <div className="mt-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-gray-900">额外积分包</h2>
              <p className="mt-4 text-lg text-gray-600">
                需要更多积分？选择适合您需求的积分包
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:max-w-5xl lg:mx-auto">
              {[
                { name: "小型积分包", credits: 500, price: 29, tag: "适合个人使用" },
                { name: "中型积分包", credits: 1200, price: 59, tag: "最受欢迎", highlight: true },
                { name: "大型积分包", credits: 3000, price: 129, tag: "最划算" }
              ].map((pack, i) => (
                <div 
                  key={i}
                  className={`bg-white rounded-xl overflow-hidden ${
                    pack.highlight 
                      ? "shadow-lg border-2 border-blue-200 hover:border-blue-300" 
                      : "shadow-md border border-gray-100 hover:border-blue-100"
                  } transition-all duration-300 hover:shadow-xl`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{pack.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{pack.tag}</p>
                      </div>
                      {pack.highlight && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          热门选择
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-bold text-gray-900">¥{pack.price}</p>
                      <p className="mt-1 text-sm text-gray-500">获得 {pack.credits} 积分</p>
                    </div>
                    <button 
                      onClick={() => handleSubscribe(`credits-${pack.credits}`)}
                      className={`mt-6 w-full py-2 px-4 rounded-lg text-center ${
                        pack.highlight
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                          : "bg-white border border-gray-300 text-blue-600 hover:bg-gray-50"
                      } font-medium transition-colors`}
                    >
                      购买积分
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 常见问题 */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center">常见问题</h2>
            <div className="mt-12 space-y-8">
              {[
                {
                  q: "积分有效期是多久？",
                  a: "购买的积分自购买之日起12个月内有效。免费用户的每月积分不会累积，将在下个月初重置。"
                },
                {
                  q: "如何升级或降级我的方案？",
                  a: "您可以随时在账户设置中更改您的订阅计划。升级将立即生效，降级将在当前计费周期结束后生效。"
                },
                {
                  q: "团队版可以添加多少用户？",
                  a: "团队版基础方案包含5个用户账户。如需更多用户，请联系我们的销售团队获取企业级解决方案。"
                },
                {
                  q: "是否提供退款？",
                  a: "我们提供7天无理由退款保证。如果您对服务不满意，可以在购买后7天内申请全额退款。"
                }
              ].map((item, i) => (
                <div key={i} className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900">{item.q}</h3>
                  <p className="mt-2 text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 联系我们 */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl overflow-hidden shadow-md">
            <div className="px-6 py-10 text-center sm:px-12">
              <h2 className="text-2xl font-bold text-white">需要自定义方案？</h2>
              <p className="mt-4 text-lg text-blue-100">
                对于大型企业或特殊需求，我们提供定制化解决方案。联系我们的销售团队获取专属方案。
              </p>
              <a 
                href="mailto:sales@hootoolai.com"
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-blue-600 bg-white hover:bg-blue-50 transition-colors"
              >
                联系销售 <FaArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <Link href="/" className="flex items-center">
              <FaMagic className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HooTool AI
              </span>
            </Link>
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
        </div>
      </footer>
    </div>
  );
} 