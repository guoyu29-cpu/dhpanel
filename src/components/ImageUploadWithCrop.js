import React, { useState, useRef, useEffect } from 'react';
import ImageCropModal from './ImageCropModal';
import { uploadAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import './ImageUploadWithCrop.css';

/**
 * 带裁剪功能的图片上传组件
 * @param {Function} onUploadSuccess - 上传成功回调，返回图片URL
 * @param {Function} onUploadError - 上传失败回调
 * @param {Number} aspectRatio - 裁剪宽高比，默认16/9
 * @param {String} currentImage - 当前图片URL（用于显示）
 * @param {String} buttonText - 按钮文字
 * @param {Boolean} showPreview - 是否显示预览
 * @param {Boolean} isNewItem - 是否为新建项目（影响按钮显示）
 */
const ImageUploadWithCrop = ({
  onUploadSuccess,
  onUploadError,
  aspectRatio = 16 / 9,
  currentImage = null,
  buttonText = '上传图片',
  showPreview = true,
  isNewItem = false
}) => {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  // 监听 currentImage 变化，更新预览
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  /**
   * 文件选择处理
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }

    // 读取文件并显示裁剪界面
    const reader = new FileReader();
    reader.onload = (e) => {
      setTempImageSrc(e.target.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    // 清空input，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 裁剪完成处理
   */
  const handleCropComplete = async (croppedBlob) => {
    setUploading(true);
    
    try {
      // 创建File对象
      const croppedFile = new File(
        [croppedBlob], 
        `cropped_${Date.now()}.jpg`, 
        { type: 'image/jpeg' }
      );

      // 先显示预览
      const previewUrl = URL.createObjectURL(croppedBlob);
      setPreview(previewUrl);

      // 上传到SuperBed
      const response = await uploadAPI.uploadToSuperbed(croppedFile);
      
      if (response.success) {
        setPreview(response.url);
        if (onUploadSuccess) {
          onUploadSuccess(response.url);
        }
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert(error.message || '图片上传失败，请重试');
      
      // 恢复原图
      setPreview(currentImage);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * 删除图片
   */
  const handleRemoveImage = () => {
    if (window.confirm('确定要删除这张图片吗？')) {
      setPreview(null);
      if (onUploadSuccess) {
        onUploadSuccess('');
      }
    }
  };

  /**
   * 触发文件选择
   */
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-with-crop">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {showPreview && preview && (
        <div className="upload-preview-area" onClick={isNewItem ? triggerFileSelect : undefined}>
          <img src={getImageUrl(preview)} alt="预览" className="upload-preview-image" />
          <div className="upload-preview-overlay">
            {!isNewItem && (
              <button
                type="button"
                className="btn-change-image"
                onClick={triggerFileSelect}
                disabled={uploading}
              >
                更换图片
              </button>
            )}
            <button
              type="button"
              className="btn-remove-image"
              onClick={handleRemoveImage}
              disabled={uploading}
            >
              删除图片
            </button>
          </div>
          {isNewItem && (
            <div className="new-item-hint">
              点击图片可重新选择
            </div>
          )}
        </div>
      )}

      {(!showPreview || !preview) && (
        <button
          type="button"
          className="btn-upload-image"
          onClick={triggerFileSelect}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="upload-spinner">⏳</span>
              <span>上传中...</span>
            </>
          ) : (
            <>
              <span className="upload-icon">📷</span>
              <span>{buttonText}</span>
            </>
          )}
        </button>
      )}

      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setTempImageSrc(null);
        }}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={aspectRatio}
      />
    </div>
  );
};

export default ImageUploadWithCrop;

