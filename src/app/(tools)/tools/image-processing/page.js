'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const processingOptions = [
  { id: 'enhance', name: '图片增强', description: '提升图片清晰度和亮度' },
  { id: 'style', name: '风格迁移', description: '将图片转换为特定艺术风格' },
  { id: 'remove-bg', name: '去除背景', description: '自动移除图片背景' },
  { id: 'colorize', name: '上色', description: '给黑白图片上色' },
  { id: 'description', name: '图片描述', description: '生成图片内容的详细描述' },
  { id: 'custom', name: '自定义指令', description: '按照您的具体要求处理图片' }
];

export default function ImageProcessingPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [processType, setProcessType] = useState('enhance');
  const [loading, setLoading] = useState(false);
  const [imageDescription, setImageDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImageUrl(''); // 清除之前处理的图片
      setImageDescription(''); // 清除之前的描述
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 10485760, // 10MB
    maxFiles: 1
  });

  const handleProcessImage = async () => {
    if (!selectedFile) {
      toast.error('请先上传图片');
      return;
    }

    if (processType === 'custom' && !customPrompt.trim()) {
      toast.error('请输入自定义处理指令');
      return;
    }

    setLoading(true);
    setProcessedImageUrl('');
    setImageDescription('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('processType', processType);
      
      if (processType === 'custom') {
        formData.append('customPrompt', customPrompt);
      }

      const response = await axios.post('/api/image-processing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.processedImageUrl) {
        setProcessedImageUrl(response.data.processedImageUrl);
      }
      
      if (response.data.description) {
        setImageDescription(response.data.description);
      }
      
      toast.success('处理成功');
    } catch (error) {
      console.error('处理图片时出错:', error);
      toast.error('处理图片失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI 图片处理</h2>
        <p className="mt-1 text-gray-500">
          使用 Google Gemini AI 为您的图片添加特效、风格迁移、去除背景或生成描述。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <PhotoIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">
              {isDragActive ? '放开以上传图片' : '点击或拖拽图片到此处上传'}
            </p>
            <p className="mt-1 text-xs text-gray-500">支持 JPG, PNG, GIF (最大 10MB)</p>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-gray-700">原图预览:</p>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={previewUrl} 
                  alt="原图预览" 
                  className="w-full h-auto object-contain max-h-[300px]" 
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择处理类型:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {processingOptions.map((option) => (
                <div 
                  key={option.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    processType === option.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProcessType(option.id)}
                >
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              ))}
            </div>
          </div>

          {processType === 'custom' && (
            <div className="mt-4">
              <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                自定义处理指令
              </label>
              <textarea
                id="customPrompt"
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="输入您希望AI如何处理此图片的具体要求，例如：'将图中的红色汽车变成蓝色'、'移除图片中的电线杆'"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">输入越详细的指令，处理效果越接近您的期望</p>
            </div>
          )}

          <button
            onClick={handleProcessImage}
            disabled={!selectedFile || loading || (processType === 'custom' && !customPrompt.trim())}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                处理中...
              </>
            ) : (
              '处理图片'
            )}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">处理结果</h3>
          
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-gray-200 border-dashed rounded-lg">
              <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="mt-2 text-sm font-medium text-gray-500">AI 正在处理您的图片...</p>
            </div>
          )}

          {!loading && !processedImageUrl && !imageDescription && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-gray-200 border-dashed rounded-lg">
              <p className="text-sm font-medium text-gray-500">处理后的图片将显示在这里</p>
            </div>
          )}

          {processedImageUrl && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">处理后的图片:</p>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={processedImageUrl} 
                  alt="处理后的图片" 
                  className="w-full h-auto object-contain max-h-[300px]" 
                />
              </div>
              
              <div className="mt-3 flex justify-between">
                {previewUrl && (
                  <div className="flex space-x-2">
                    <a
                      href={previewUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      下载原图
                    </a>
                    <span className="text-gray-300">|</span>
                  </div>
                )}
                
                <a 
                  href={processedImageUrl} 
                  download
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  下载处理后图片
                </a>
              </div>
            </div>
          )}

          {imageDescription && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-gray-700">图片描述:</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{imageDescription}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewUrl && processedImageUrl && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">对比查看</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">原图:</p>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={previewUrl} 
                  alt="原图" 
                  className="w-full h-auto object-contain max-h-[300px]" 
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">处理后:</p>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={processedImageUrl} 
                  alt="处理后的图片" 
                  className="w-full h-auto object-contain max-h-[300px]" 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 