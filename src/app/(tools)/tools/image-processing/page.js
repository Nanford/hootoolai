'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const processingOptions = [
  { id: 'enhance', name: '画质增强', description: '提升图片分辨率和清晰度' },
  { id: 'stylize', name: '风格转换', description: '将图片转换为不同的艺术风格' },
  { id: 'background-remove', name: '移除背景', description: '智能识别并移除图片背景' },
  { id: 'colorize', name: '黑白上色', description: '为黑白图片添加自然逼真的颜色' },
];

export default function ImageProcessingPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [selectedOption, setSelectedOption] = useState(processingOptions[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      setProcessedUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleProcess = async () => {
    if (!selectedFile) {
      toast.error('请先上传图片');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('processType', selectedOption);
      
      try {
        const response = await axios.post('/api/image-processing/process', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setProcessedUrl(response.data.processedUrl);
        toast.success('图片处理成功！');
        setIsDemo(false);
      } catch (apiError) {
        console.error('API调用失败，启用演示模式:', apiError);
        // 启用演示模式，使用预览图片作为处理结果
        setProcessedUrl(previewUrl);
        setIsDemo(true);
        toast.success('演示模式：显示预览图片作为处理结果');
      }
    } catch (error) {
      console.error('图片处理失败:', error);
      setErrorMessage('图片处理失败，请稍后再试或联系客服');
      toast.error(error.response?.data?.message || '图片处理失败，请稍后再试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedUrl) {
      const link = document.createElement('a');
      link.href = processedUrl;
      link.download = `processed-${selectedOption}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI图片处理</h1>
        <p className="mt-2 text-gray-600">使用先进的AI技术为您的图片增添魔力，让图片焕然一新。</p>
        {isDemo && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">当前为演示模式，实际处理功能需要正确配置API密钥。</p>
          </div>
        )}
        {errorMessage && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">处理选项</h2>
          
          <div className="space-y-4">
            {processingOptions.map((option) => (
              <div key={option.id} className="flex items-start">
                <input
                  id={option.id}
                  name="processing-option"
                  type="radio"
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                />
                <label htmlFor={option.id} className="ml-3 block text-sm">
                  <span className="font-medium text-gray-900">{option.name}</span>
                  <span className="text-gray-500 block">{option.description}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleProcess}
              disabled={!selectedFile || isProcessing}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isProcessing ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  处理中...
                </>
              ) : (
                '开始处理'
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">上传图片</h2>
            <div
              {...getRootProps()}
              className={`mt-2 flex justify-center rounded-lg border-2 border-dashed px-6 py-10 ${
                isDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="text-center">
                <PhotoIcon
                  className="mx-auto h-12 w-12 text-gray-300"
                  aria-hidden="true"
                />
                <div className="mt-4 flex flex-wrap justify-center text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>上传图片</span>
                    <input {...getInputProps()} />
                  </label>
                  <p className="pl-1">或拖放图片到此处</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PNG, JPG, WEBP 最大 10MB</p>
              </div>
            </div>
          </div>

          {(previewUrl || processedUrl) && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {processedUrl ? '处理结果' : '预览图片'}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {previewUrl && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">原始图片</p>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={previewUrl}
                        alt="原始图片"
                        className="object-contain"
                        fill
                      />
                    </div>
                  </div>
                )}
                
                {processedUrl && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">处理后图片</p>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={processedUrl}
                        alt="处理后图片"
                        className="object-contain"
                        fill
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                      >
                        下载图片
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}