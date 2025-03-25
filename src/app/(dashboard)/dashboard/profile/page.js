'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [artworks, setArtworks] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
      
      // 加载用户作品
      const fetchUserWorks = async () => {
        try {
          const [artworksRes, imagesRes] = await Promise.all([
            axios.get('/api/user/artworks'),
            axios.get('/api/user/processed-images')
          ]);
          
          setArtworks(artworksRes.data.artworks || []);
          setProcessedImages(imagesRes.data.images || []);
        } catch (error) {
          console.error('加载用户作品失败:', error);
          toast.error('加载作品失败，请刷新页面重试');
        } finally {
          setLoadingWorks(false);
        }
      };
      
      // fetchUserWorks();
      // 假数据，实际使用时取消注释上面的代码
      setArtworks([]);
      setProcessedImages([]);
      setLoadingWorks(false);
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/api/user/profile', {
        name: formData.name,
      });
      
      // 更新session中的用户名
      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
        },
      });
      
      toast.success('个人资料更新成功');
    } catch (error) {
      console.error('更新个人资料失败:', error);
      toast.error(error.response?.data?.message || '更新失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('两次输入的新密码不一致');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('新密码长度至少为8个字符');
      setLoading(false);
      return;
    }

    try {
      await axios.put('/api/user/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      toast.success('密码更新成功');
      
      // 清空密码字段
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('更新密码失败:', error);
      toast.error(error.response?.data?.message || '密码更新失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">个人中心</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* 个人信息卡片 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || '用户头像'}
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold">{session.user.name || '未设置用户名'}</h2>
              <p className="text-gray-600">{session.user.email}</p>
              
              <div className="mt-4 w-full border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{artworks.length}</p>
                    <p className="text-gray-500 text-sm">艺术作品</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{processedImages.length}</p>
                    <p className="text-gray-500 text-sm">处理图片</p>
                  </div>
                </div>
              </div>
              
              {session.user.isPremium ? (
                <div className="mt-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  高级会员
                </div>
              ) : (
                <button 
                  type="button"
                  className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:from-purple-600 hover:to-blue-600"
                >
                  升级为高级会员
                </button>
              )}
            </div>
          </div>
          
          {/* 帐户统计 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">帐户统计</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">创建时间</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总作品数</span>
                <span>{artworks.length + processedImages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">本月使用次数</span>
                <span>23 次</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">剩余次数</span>
                <span>{session.user.isPremium ? '无限制' : '27 次'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {/* 个人资料表单 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">个人资料</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  用户名
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  邮箱
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">邮箱不可更改</p>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存修改'}
                </button>
              </div>
            </form>
          </div>
          
          {/* 修改密码表单 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">修改密码</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  当前密码
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  新密码
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  确认新密码
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? '更新中...' : '更新密码'}
                </button>
              </div>
            </form>
          </div>
          
          {/* 最近作品 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">最近作品</h2>
            
            {loadingWorks ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : artworks.length === 0 && processedImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>您还没有创建任何作品</p>
                <p className="text-sm mt-1">开始使用我们的AI工具创建精彩作品吧！</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* 这里放作品缩略图 */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">作品预览位</span>
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">作品预览位</span>
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">作品预览位</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 