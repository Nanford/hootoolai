/**
 * 检查应用是否在演示模式下运行
 */
export const isDemoMode = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  }
  return window.location.search.includes('demo=true') || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};

/**
 * 生成随机ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * 格式化日期
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 在演示模式下返回一个占位图URL
 */
export const getDemoImageUrl = (type, style) => {
  const colors = {
    'enhance': 'blue/white',
    'stylize': 'purple/white',
    'background-remove': 'green/white',
    'colorize': 'yellow/black',
    'watercolor': 'cyan/white',
    'oil-painting': 'indigo/white',
    'cartoon': 'pink/white',
    'anime': 'violet/white',
    'pixel-art': 'orange/white',
  };
  
  const color = colors[style || type] || 'gray/white';
  const text = encodeURIComponent(style || type || 'Generated');
  
  return `https://placehold.co/600x600/${color}?text=${text}`;
}; 