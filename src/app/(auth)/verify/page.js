'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// 添加关键导出，跳过预渲染
export const dynamic = "force-dynamic";

function VerifyComponent() {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('验证链接无效或已过期');
        return;
      }

      try {
        const response = await axios.post('/api/auth/verify', { token });
        setStatus('success');
        setMessage(response.data.message || '邮箱验证成功');
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || '验证失败，请重试');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {status === 'loading' && (
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          )}
          {status === 'success' && (
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          )}
          {status === 'error' && (
            <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          邮箱验证
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && <p className="text-gray-600">正在验证您的邮箱，请稍候...</p>}
            
            {status === 'success' && (
              <>
                <p className="text-green-600">{message}</p>
                <p className="mt-2 text-gray-600">3秒后自动跳转到登录页面</p>
                <div className="mt-4">
                  <Link href="/login" className="text-blue-600 hover:text-blue-500">
                    立即前往登录页面
                  </Link>
                </div>
              </>
            )}
            
            {status === 'error' && (
              <>
                <p className="text-red-600">{message}</p>
                <div className="mt-4">
                  <Link href="/login" className="text-blue-600 hover:text-blue-500">
                    返回登录页面
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyComponent />
    </Suspense>
  );
}