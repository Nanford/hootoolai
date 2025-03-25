'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SparklesIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function VerifyPage() {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('验证链接无效');
          setLoading(false);
          return;
        }

        const response = await axios.post('/api/auth/verify', { token });
        setVerified(true);
        setLoading(false);
        
        // 延迟跳转到登录页面
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || '邮箱验证失败');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <SparklesIcon className="h-12 w-12 text-blue-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          邮箱验证
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {loading && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-sm text-gray-500">正在验证您的邮箱...</p>
            </div>
          )}

          {error && !loading && (
            <div>
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  返回登录
                </Link>
              </div>
            </div>
          )}

          {verified && !loading && (
            <div>
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">邮箱验证成功！</h3>
                    <p className="mt-2 text-sm text-green-700">
                      您的账户已经激活，即将跳转到登录页面。
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  立即登录
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 