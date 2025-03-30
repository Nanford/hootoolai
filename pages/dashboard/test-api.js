import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaArrowLeft, FaCheck, FaTimes, FaSync } from 'react-icons/fa';

export default function TestApi() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testDeepseekApi = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/test-deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '未知错误');
      }

      setResult(data);
    } catch (err) {
      console.error('API测试出错:', err);
      setError(err.message || '测试过程中发生错误');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>API测试 - HooTool AI</title>
        <meta name="description" content="测试DeepSeek API连接" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
            <FaArrowLeft className="mr-2" /> 返回控制台
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">API连接测试</h1>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">DeepSeek API</h2>
              <p className="text-gray-600 mb-4">
                测试与DeepSeek API的连接。确保您已在环境变量中设置了正确的API密钥。
              </p>
              
              <button
                onClick={testDeepseekApi}
                disabled={testing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center"
              >
                {testing ? (
                  <>
                    <FaSync className="animate-spin mr-2" /> 测试中...
                  </>
                ) : (
                  '测试连接'
                )}
              </button>
              
              {result && (
                <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-md">
                  <div className="flex items-start">
                    <FaCheck className="text-green-600 mt-1 mr-2" />
                    <div>
                      <h3 className="text-green-800 font-medium">连接成功</h3>
                      <p className="text-green-700 text-sm mt-1">
                        已成功连接到DeepSeek API并收到响应。
                      </p>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border border-green-200 overflow-auto max-h-40">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex items-start">
                    <FaTimes className="text-red-600 mt-1 mr-2" />
                    <div>
                      <h3 className="text-red-800 font-medium">连接失败</h3>
                      <p className="text-red-700 text-sm mt-1">
                        与DeepSeek API连接时发生错误。请检查API密钥和网络连接。
                      </p>
                      <div className="mt-2 text-xs bg-white p-2 rounded border border-red-200 overflow-auto">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="text-blue-800 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                设置说明
              </h3>
              <ul className="mt-2 text-blue-700 text-sm space-y-1">
                <li>1. 确保您已从DeepSeek获取了有效的API密钥</li>
                <li>2. 在项目根目录的.env.local文件中添加：NEXT_PUBLIC_DEEPSEEK_API_KEY=您的密钥</li>
                <li>3. 重启开发服务器以使环境变量生效</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 