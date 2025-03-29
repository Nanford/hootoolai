import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import { useForm } from 'react-hook-form';

export default function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password', '');

  useEffect(() => {
    // 检查当前用户是否已通过重置链接验证
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setMessage({
          type: 'error',
          content: '无效的重置链接或链接已过期。请重新发起密码重置请求。'
        });
      }
    };

    checkSession();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage({ type: '', content: '' });
      
      // 更新密码
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;
      
      setMessage({
        type: 'success',
        content: '密码重置成功！将在5秒后跳转到登录页面。'
      });

      // 5秒后重定向到登录页
      setTimeout(() => {
        router.push('/auth/login');
      }, 5000);
      
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.message || '密码重置失败，请稍后再试。'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>更新密码 - HooTool AI</title>
        <meta name="description" content="更新您的HooTool AI账户密码" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-3xl font-extrabold text-primary">HooTool AI</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          设置新密码
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message.content && (
            <div className={`mb-4 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.content}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                新密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  {...register('password', { 
                    required: '请设置您的新密码',
                    minLength: {
                      value: 6,
                      message: '密码长度至少为6个字符'
                    }
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认新密码
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  {...register('confirmPassword', { 
                    required: '请确认您的新密码',
                    validate: value => value === password || '两次输入的密码不匹配'
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {loading ? '处理中...' : '重置密码'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 