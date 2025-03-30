import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { supabase } from '../../utils/supabase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage({ type: '', content: '' });

      // 使用Supabase登录
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // 登录成功后跳转到仪表盘
      router.push('/dashboard');
      
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.message || '登录失败，请检查您的邮箱和密码。'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const email = window.prompt('请输入您的电子邮箱地址以重置密码');
    
    if (!email) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      
      setMessage({
        type: 'success',
        content: '密码重置链接已发送到您的邮箱，请查收。'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.message || '发送重置密码邮件失败，请稍后再试。'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Head>
        <title>登录 - HooTool AI</title>
        <meta name="description" content="登录到您的HooTool AI账户" />
      </Head>

      {/* 左侧登录区域 - 白色主题 */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              HooTool AI
            </Link>
            <h2 className="mt-6 text-2xl font-medium text-gray-900">登录您的账户</h2>
            <p className="mt-2 text-sm text-gray-500">
              或{' '}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                创建一个新账户
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {message.content && (
              <div className={`mb-4 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message.content}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  电子邮箱
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                    {...register('email', { 
                      required: '请输入您的电子邮箱', 
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: '请输入有效的电子邮箱地址'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  密码
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                    {...register('password', { required: '请输入您的密码' })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                    {...register('remember_me')}
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                    记住我
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                  >
                    忘记密码?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 右侧香奈儿风格设计 - 使用淡蓝色渐变 */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-500/80 to-indigo-600/80 flex items-center justify-center overflow-hidden">
          {/* 香奈儿风格的菱形图案背景 */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full flex flex-wrap">
              {Array(25).fill().map((_, i) => (
                <div key={i} className="w-1/5 h-1/5 border border-white/20 flex items-center justify-center">
                  <div className="h-8 w-8 rotate-45 border border-white/20"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 香奈儿风格的双C标志 */}
          <div className="relative z-10 text-center px-8 max-w-md">
            <div className="mb-10 mx-auto">
              <div className="flex justify-center items-center">
                <div className="h-24 w-16 border-4 border-white rounded-full mr-[-8px]"></div>
                <div className="h-24 w-16 border-4 border-white rounded-full ml-[-8px] transform scale-x-[-1]"></div>
              </div>
            </div>
            
            <h3 className="text-3xl font-light tracking-widest text-white mb-8 uppercase">HooTool AI</h3>
            <div className="h-px w-24 bg-white mx-auto mb-8"></div>
            <p className="text-white/90 text-lg font-light tracking-wider leading-relaxed mb-8">
              利用先进的AI技术简化您的日常工作
            </p>
            <p className="text-white/90 text-lg font-light tracking-wider leading-relaxed mb-8">
              从图像处理到内容创作，一站式解决方案
            </p>
          </div>
          
          {/* 底部简约装饰 */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <div className="flex items-center space-x-6">
              <div className="h-px w-10 bg-white/70"></div>
              <div className="text-white text-xs tracking-widest uppercase">智能 · 高效 · 简约</div>
              <div className="h-px w-10 bg-white/70"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}