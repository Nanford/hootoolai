import Head from 'next/head';

export default function Test() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>测试页面 - HooTool AI</title>
      </Head>
      <main className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary text-center mb-8">项目配置测试</h1>
          <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
            <p className="text-lg text-gray-700 mb-4">
              这是一个测试页面，用于验证项目配置是否正确。
            </p>
            <div className="flex justify-center">
              <button className="btn-primary">
                Tailwind CSS 按钮样式测试
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 