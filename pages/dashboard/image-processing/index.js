import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaArrowLeft, FaMagic, FaPaintBrush
} from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';

export default function ImageProcessing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 图片服务选项
  const imageServices = [
    {
      id: 'generation',
      title: '图像生成',
      description: '从文本描述生成全新的高质量图像',
      icon: <FaMagic className="h-8 w-8 text-purple-500" />,
      url: '/dashboard/image-processing/generate',
      cost: '每次 5 积分'
    },
    {
      id: 'editing',
      title: '图像修改',
      description: '使用文本指令智能修改现有图像',
      icon: <FaPaintBrush className="h-8 w-8 text-blue-500" />,
      url: '/dashboard/image-processing/edit',
      cost: '每次 5 积分'
    }
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
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 text-indigo-600 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-700">加载中...</span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AI图像服务 - HooTool AI</title>
        <meta name="description" content="HooTool AI 图像服务 - 生成和修改图像" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <FaArrowLeft className="mr-2" />
              <span>返回仪表盘</span>
            </Link>
          </div>
          
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              <span className="block">AI图像服务</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              生成或修改图像，释放你的创意
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {imageServices.map((service) => (
              <div key={service.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-lg bg-indigo-50 inline-block">
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">{service.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{service.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{service.cost}</span>
                    <Link href={service.url} className="inline-flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-800 hover:underline">
                      立即使用 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">常见问题</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-900">图像生成是什么?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  图像生成是通过文本描述，使用最新的AI技术从零创建全新的高质量图像。
                </p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900">图像修改有什么用?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  图像修改让你通过文本指令智能修改现有图像，比如更改背景、调整颜色、添加或删除元素等。
                </p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900">如何获得更多积分?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  您可以通过订阅我们的会员计划或单独购买积分包来获取更多积分。
                  <Link href="/dashboard/account" className="text-indigo-600 hover:text-indigo-800 ml-1">
                    查看账户页面
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}