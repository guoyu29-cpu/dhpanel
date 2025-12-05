/**
 * 图片URL处理工具函数
 */

/**
 * 获取正确的图片URL
 * @param {string} imageUrl - 图片URL（可能是相对路径或完整URL）
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // 如果已经是完整的HTTP/HTTPS URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 如果是相对路径，拼接本地服务器地址
  return `http://localhost:3001${imageUrl}`;
};

/**
 * 检查图片URL是否来自外部图床
 * @param {string} imageUrl - 图片URL
 * @returns {boolean} 是否为外部图床URL
 */
export const isExternalImage = (imageUrl) => {
  if (!imageUrl) return false;
  return imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
};

/**
 * 获取图片来源标识
 * @param {string} imageUrl - 图片URL
 * @returns {string} 图片来源（'local' | 'superbed' | 'external'）
 */
export const getImageSource = (imageUrl) => {
  if (!imageUrl) return 'none';
  
  if (imageUrl.includes('superbed.cn') || imageUrl.includes('pic.superbed.cn')) {
    return 'superbed';
  }
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return 'external';
  }
  
  return 'local';
};

