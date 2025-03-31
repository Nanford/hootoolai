import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FaArrowLeft, FaUser, FaSave, FaCoins, FaHistory, FaPlus } from 'react-icons/fa';
import { supabase } from '../../utils/supabase';

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [credits, setCredits] = useState(0);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    bio: ''
  });
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
      
      // 设置表单初始值
      setFormData({
        fullName: session.user.user_metadata?.full_name || '',
        nickname: session.user.user_metadata?.nickname || '',
        bio: session.user.user_metadata?.bio || ''
      });
      
      setLoading(false);
      
      // 获取用户积分
      await fetchUserCredits();
    };

    checkUser();
  }, [router]);
  
  // 获取用户积分
  const fetchUserCredits = async () => {
    setLoadingCredits(true);
    try {
      const response = await fetch('/api/credits');
      const data = await response.json();
      
      if (response.ok) {
        setCredits(data.credits);
      } else {
        console.error('获取积分失败:', data.error);
      }
    } catch (error) {
      console.error('获取积分出错:', error);
    } finally {
      setLoadingCredits(false);
    }
  };
  
  // 获取积分交易历史
  const fetchCreditTransactions = async () => {
    if (transactions.length > 0 && !showTransactions) {
      // 如果已经加载了交易历史，只需切换显示状态
      setShowTransactions(true);
      return;
    }
    
    setLoadingTransactions(true);
    setShowTransactions(true);
    
    try {
      const response = await fetch('/api/credits/history');
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions);
      } else {
        console.error('获取积分交易历史失败:', data.error);
      }
    } catch (error) {
      console.error('获取积分交易历史出错:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', content: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.fullName,
          nickname: formData.nickname,
          bio: formData.bio
        }
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        content: '个人资料已成功更新！' 
      });
    } catch (error) {
      console.error('更新资料错误:', error.message);
      setMessage({ 
        type: 'error', 
        content: `更新失败: ${error.message}` 
      });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>账户设置 - HooTool AI</title>
        <meta name="description" content="管理您的HooTool AI账户设置" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 mr-2">
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">账户设置</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          {/* 个人资料卡片 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">个人资料</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">更新您的个人信息和账户设置</p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {message.content && (
                <div className={`mb-4 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.content}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      电子邮箱
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        disabled
                        className="bg-gray-50 flex-1 min-w-0 block w-full px-3 py-2 rounded-md sm:text-sm border-gray-300 cursor-not-allowed"
                        value={user.email}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">邮箱地址不可更改</p>
                  </div>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      姓名
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 block w-full px-3 py-2 rounded-md sm:text-sm border-gray-300"
                        placeholder="您的真实姓名"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                      昵称
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="nickname"
                        id="nickname"
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 block w-full px-3 py-2 rounded-md sm:text-sm border-gray-300"
                        placeholder="您的昵称（其他用户将看到这个名称）"
                        value={formData.nickname}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">此昵称将显示在平台上</p>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      个人简介
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="简单介绍一下自己"
                        value={formData.bio}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        保存中...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2 -ml-1 h-4 w-4" />
                        保存更改
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* 积分管理卡片 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">积分管理</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">查看并管理您的账户积分</p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                  <FaCoins className="mr-2 h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-lg">
                    {loadingCredits ? (
                      <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
                    ) : (
                      `${credits} 积分`
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-2">积分使用说明</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">•</div>
                      <p>图片处理：每次生成消耗 <strong>10 积分</strong></p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">•</div>
                      <p>艺术卡片生成：每次生成消耗 <strong>25 积分</strong></p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">•</div>
                      <p>封面生成：每次生成消耗 <strong>25 积分</strong></p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">•</div>
                      <p>智能聊天：每次对话消耗 <strong>1 积分</strong></p>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Link href="/pricing" className="inline-flex items-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <FaPlus className="mr-2 -ml-1 h-4 w-4" />
                  购买积分
                </Link>
                
                <button
                  type="button"
                  onClick={fetchCreditTransactions}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaHistory className="mr-2 -ml-1 h-4 w-4" />
                  {showTransactions ? '隐藏交易记录' : '查看交易记录'}
                </button>
              </div>
              
              {/* 积分交易历史 */}
              {showTransactions && (
                <div className="mt-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">积分交易记录</h3>
                  
                  {loadingTransactions ? (
                    <div className="animate-pulse space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-100 h-16 rounded-md"></div>
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-md">
                      <p className="text-gray-500">暂无交易记录</p>
                    </div>
                  ) : (
                    <div className="mt-2 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">日期</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">描述</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">变动</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">余额</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                                {new Date(transaction.created_at).toLocaleString('zh-CN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.description}</td>
                              <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.balance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 