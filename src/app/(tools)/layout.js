'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MainNav } from '@/components/MainNav';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function ToolsLayout({ children }) {
  const { data: session, status } = useSession();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // 错误处理清理函数
    return () => {
      setHasError(false);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // 如果发生错误，显示友好的错误界面
  if (hasError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">出现了一些问题</h1>
        <p className="text-gray-600 mb-6">很抱歉，工具加载过程中发生错误。</p>
        <Link 
          href="/" 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          返回首页
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">需要登录</h1>
        <p className="text-gray-600 mb-6">请先登录后再使用AI工具。</p>
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            登录
          </Link>
          <Link 
            href="/" 
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 h-full">
        <MainNav />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          <ErrorBoundary setHasError={setHasError}>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

// 错误边界组件
function ErrorBoundary({ children, setHasError }) {
  useEffect(() => {
    // 添加全局错误处理
    const handleError = (error) => {
      console.error('捕获到错误:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [setHasError]);

  return (
    <>
      {children}
    </>
  );
} 