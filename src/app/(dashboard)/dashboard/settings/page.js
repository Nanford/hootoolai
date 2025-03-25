'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Switch } from '@headlessui/react';
import { SunIcon, MoonIcon, LanguageIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const languageOptions = [
  { id: 'zh-CN', name: '简体中文' },
  { id: 'en-US', name: 'English (US)' },
];

const themeOptions = [
  { id: 'light', name: '浅色模式', icon: SunIcon },
  { id: 'dark', name: '深色模式', icon: MoonIcon },
  { id: 'system', name: '跟随系统', icon: null },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'zh-CN',
    emailNotifications: true,
    marketingEmails: false,
    autoProcessing: true,
    highQualityPreview: true,
    shareUsageData: true,
  });

  useEffect(() => {
    // 从用户存储的设置中加载(在实际应用中)
    const loadSettings = async () => {
      try {
        // const response = await axios.get('/api/user/settings');
        // setSettings(response.data.settings);
        
        // 假数据
        setSettings({
          theme: localStorage.getItem('theme') || 'light',
          language: localStorage.getItem('language') || 'zh-CN',
          emailNotifications: true,
          marketingEmails: false,
          autoProcessing: true,
          highQualityPreview: true,
          shareUsageData: true,
        });
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };
    
    loadSettings();
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // 保存到localStorage(简单示例)
    if (key === 'theme' || key === 'language') {
      localStorage.setItem(key, value);
    }
    
    // 在实际应用中，这里会调用API保存设置
    // saveSettings(key, value);
  };

  const saveSettings = async (key, value) => {
    setLoading(true);
    
    try {
      await axios.put('/api/user/settings', {
        [key]: value,
      });
      
      toast.success('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存设置失败，请稍后再试');
      
      // 恢复原来的设置
      setSettings(prev => ({ ...prev, [key]: !value }));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">设置</h1>
      
      <div className="space-y-6">
        {/* 外观设置 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">外观设置</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主题
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((theme) => (
                  <div
                    key={theme.id}
                    className={`
                      border rounded-md p-3 flex items-center cursor-pointer
                      ${settings.theme === theme.id 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => updateSetting('theme', theme.id)}
                  >
                    {theme.icon && (
                      <theme.icon className={`h-5 w-5 mr-2 ${settings.theme === theme.id ? 'text-blue-500' : 'text-gray-400'}`} />
                    )}
                    <span className={settings.theme === theme.id ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                      {theme.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语言
              </label>
              <div className="grid grid-cols-2 gap-3">
                {languageOptions.map((language) => (
                  <div
                    key={language.id}
                    className={`
                      border rounded-md p-3 flex items-center cursor-pointer
                      ${settings.language === language.id 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => updateSetting('language', language.id)}
                  >
                    <LanguageIcon className={`h-5 w-5 mr-2 ${settings.language === language.id ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={settings.language === language.id ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                      {language.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* 通知设置 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">通知设置</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">电子邮件通知</h3>
                <p className="text-sm text-gray-500">接收账户活动和安全相关的电子邮件</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onChange={(checked) => updateSetting('emailNotifications', checked)}
                className={`${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span className="sr-only">启用电子邮件通知</span>
                <span
                  className={`${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">营销邮件</h3>
                <p className="text-sm text-gray-500">接收产品更新和优惠信息</p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onChange={(checked) => updateSetting('marketingEmails', checked)}
                className={`${
                  settings.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span className="sr-only">启用营销邮件</span>
                <span
                  className={`${
                    settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
        </div>
        
        {/* 功能设置 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">功能设置</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">自动处理</h3>
                <p className="text-sm text-gray-500">上传图片后自动开始处理</p>
              </div>
              <Switch
                checked={settings.autoProcessing}
                onChange={(checked) => updateSetting('autoProcessing', checked)}
                className={`${
                  settings.autoProcessing ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span className="sr-only">启用自动处理</span>
                <span
                  className={`${
                    settings.autoProcessing ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">高质量预览</h3>
                <p className="text-sm text-gray-500">使用更高分辨率的图片预览（可能增加数据用量）</p>
              </div>
              <Switch
                checked={settings.highQualityPreview}
                onChange={(checked) => updateSetting('highQualityPreview', checked)}
                className={`${
                  settings.highQualityPreview ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span className="sr-only">启用高质量预览</span>
                <span
                  className={`${
                    settings.highQualityPreview ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
        </div>
        
        {/* 隐私设置 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">隐私设置</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">共享使用数据</h3>
                <p className="text-sm text-gray-500">帮助我们改进产品（不会共享您的个人信息）</p>
              </div>
              <Switch
                checked={settings.shareUsageData}
                onChange={(checked) => updateSetting('shareUsageData', checked)}
                className={`${
                  settings.shareUsageData ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span className="sr-only">启用共享使用数据</span>
                <span
                  className={`${
                    settings.shareUsageData ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
        </div>
        
        {/* 账户控制 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">账户控制</h2>
          
          <div className="space-y-4">
            <div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                删除我的账户
              </button>
              <p className="mt-1 text-xs text-gray-500">
                这将永久删除您的帐户和所有数据。此操作无法撤销。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 