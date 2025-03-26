'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PhotoIcon, SparklesIcon, UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, [status, router]);

  const features = [
    {
      name: 'AI图片处理',
      description: '使用先进的AI技术为您的图片增添魔力，包括风格迁移、画质提升、背景去除等功能',
      icon: PhotoIcon,
      href: '/tools/image-processing',
    },
    {
      name: 'AI艺术卡片',
      description: '生成独特的艺术卡片，适合社交媒体分享、电子贺卡、个人收藏等用途',
      icon: SparklesIcon,
      href: '/tools/art-generation',
    },
    {
      name: '个人中心',
      description: '管理您的个人信息、查看生成历史、设置偏好',
      icon: UserCircleIcon,
      href: '/dashboard/profile',
    },
    {
      name: '设置',
      description: '自定义应用主题、语言、通知等选项',
      icon: Cog6ToothIcon,
      href: '/dashboard/settings',
    },
  ];

  const testimonials = [
    {
      quote: "HOOTOOL AI的艺术卡片生成功能让我惊叹不已，只需简单描述，就能得到令人惊艳的艺术作品。",
      name: "王小明",
      role: "自由设计师",
      initials: "WX"
    },
    {
      quote: "图片处理工具非常强大，一键去除背景的功能为我节省了大量时间，效果令人满意。",
      name: "李梅",
      role: "内容创作者",
      initials: "LM"
    },
    {
      quote: "作为一个没有PS技能的普通用户，HOOTOOL AI让我也能创作出专业级别的图片，非常推荐！",
      name: "张华",
      role: "市场营销",
      initials: "ZH"
    }
  ];

  if (!isLoaded || status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 导航栏 */}
      <header className="absolute inset-x-0 top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600">
        <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <SparklesIcon className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">
                HOOTOOL AI
              </span>
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {features.slice(0, 2).map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="text-sm font-semibold leading-6 text-white hover:text-gray-100"
              >
                {feature.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4">
            {status === 'authenticated' ? (
              <Link 
                href="/dashboard/profile" 
                className="text-sm font-semibold leading-6 text-blue-600 bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                个人中心
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-semibold leading-6 text-blue-600 bg-white px-6 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  登录
                </Link>
                <Link 
                  href="/register" 
                  className="text-sm font-semibold leading-6 text-blue-600 bg-white px-6 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* 英雄区域 */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 to-purple-600 min-h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-white z-10 md:pr-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              AI赋能<br />创意无限
            </h1>
            <p className="text-xl mb-8 opacity-90">
              使用HOOTOOL AI的强大功能，轻松创作精美图片，设计专业艺术卡片，释放您的创意潜能。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={status === 'authenticated' ? '/tools/image-processing' : '/register'}
                className="px-8 py-3.5 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-md"
              >
                {status === 'authenticated' ? '开始创作' : '免费注册'}
              </Link>
              <Link 
                href="#features" 
                className="px-8 py-3.5 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition"
              >
                了解更多
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
              <div className="w-full h-[500px] bg-gray-200 rounded-2xl relative">
                {/* 使用AI生成艺术卡片展示图片 */}
                <Image
                  src="/img/AI生成艺术卡片展示.png" 
                  alt="AI生成艺术卡片展示"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="rounded-2xl object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-yellow-300 rounded-full opacity-30 blur-2xl"></div>
            <div className="absolute -top-6 -right-6 w-72 h-72 bg-pink-400 rounded-full opacity-30 blur-3xl"></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-white" style={{clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'}}></div>
      </section>

      {/* 功能特点区域 */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">强大功能，激发创意</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              HOOTOOL AI提供多种智能工具，让您的图片处理和艺术创作变得简单而专业
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.slice(0, 4).map((feature) => (
              <div 
                key={feature.name} 
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <Link 
                  href={feature.href} 
                  className="text-blue-600 font-medium flex items-center hover:text-blue-800"
                >
                  立即体验
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 作品展示区域 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">AI创作展示</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              探索HOOTOOL AI能够创作的精彩作品
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 展示图片1 */}
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-64 bg-gray-200 relative">
                <Image
                  src="/img/AI图片展示.png" 
                  alt="AI图片展示"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* 展示图片2 */}
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-64 bg-gray-200 relative">
                <Image
                  src="/img/AI图片展示1.png" 
                  alt="AI图片展示1"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* 展示图片3 */}
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-64 bg-gray-200 relative">
                <Image
                  src="/img/展示图片.png" 
                  alt="展示图片"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* 展示图片4 */}
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-64 bg-gray-200 relative">
                <Image
                  src="/img/展示图片1.png" 
                  alt="展示图片1"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* 展示图片5 */}
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-64 bg-gray-200 relative">
                <Image
                  src="/img/展示.png" 
                  alt="展示"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* 展示图片6 */}
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-64 bg-gray-200 relative">
                <Image
                  src="/img/展示1.png" 
                  alt="展示1"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* 展示图片7 */}
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-64 bg-gray-200 relative">
                <Image
                  src="/img/AI图片展示区1.png" 
                  alt="AI图片展示区1"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* 展示图片8 */}
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-64 bg-gray-200 relative">
                <Image
                  src="/img/AI图片展示.png" 
                  alt="AI图片展示"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">用户评价</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              听听用户们如何评价HOOTOOL AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg relative">
                <div className="text-blue-500 text-6xl absolute top-4 right-6 opacity-10">"</div>
                <p className="text-gray-700 mb-6 relative z-10">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 行动召唤区域 */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">准备好释放您的创意了吗？</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            立即加入HOOTOOL AI，开始您的AI创作之旅
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={status === 'authenticated' ? '/tools/image-processing' : '/register'}
              className="px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-md"
            >
              {status === 'authenticated' ? '开始创作' : '立即注册'}
            </Link>
            <Link 
              href={status === 'authenticated' ? '/tools/art-generation' : '/login'} 
              className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition"
            >
              {status === 'authenticated' ? '艺术卡片生成' : '登录账户'}
            </Link>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">HOOTOOL AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                专业的AI图像处理和艺术卡片生成平台，让创作变得简单而有趣。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">功能</h3>
              <ul className="space-y-2">
                <li><Link href="/tools/image-processing" className="text-gray-400 hover:text-white transition">AI图片处理</Link></li>
                <li><Link href="/tools/art-generation" className="text-gray-400 hover:text-white transition">AI艺术卡片</Link></li>
                <li><Link href="/dashboard/profile" className="text-gray-400 hover:text-white transition">个人中心</Link></li>
                <li><Link href="/dashboard/settings" className="text-gray-400 hover:text-white transition">设置</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">支持</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">帮助中心</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">常见问题</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">联系我们</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">反馈建议</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">法律</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">服务条款</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">隐私政策</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">版权声明</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} HOOTOOL AI. 保留所有权利。
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition">微</a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition">微</a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition">知</a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition">B</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
