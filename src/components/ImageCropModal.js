import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropModal.css';

/**
 * 图片裁剪模态框组件
 * @param {Boolean} isOpen - 是否打开模态框
 * @param {Function} onClose - 关闭回调
 * @param {String} imageSrc - 原始图片URL/base64
 * @param {Function} onCropComplete - 裁剪完成回调，返回blob对象
 * @param {Number} aspectRatio - 裁剪宽高比，默认16/9
 */
const ImageCropModal = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete,
  aspectRatio = 16 / 9 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onRotationChange = (e) => {
    setRotation(Number(e.target.value));
  };

  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  /**
   * 创建裁剪后的图片
   */
  const createCroppedImage = async () => {
    try {
      setLoading(true);
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      return croppedImageBlob;
    } catch (e) {
      console.error('裁剪图片失败:', e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const croppedBlob = await createCroppedImage();
    if (croppedBlob && onCropComplete) {
      onCropComplete(croppedBlob);
    }
    onClose();
  };

  const handleCancel = () => {
    // 重置所有状态
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="image-crop-modal-overlay" onClick={handleCancel}>
      <div className="image-crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h3>裁剪图片</h3>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <div className="crop-modal-body">
          <div className="crop-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteInternal}
            />
          </div>

          <div className="crop-controls">
            <div className="control-group">
              <label>
                <span className="control-icon">🔍</span>
                <span className="control-label">缩放</span>
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="range-slider"
              />
              <span className="control-value">{zoom.toFixed(1)}x</span>
            </div>

            <div className="control-group">
              <label>
                <span className="control-icon">🔄</span>
                <span className="control-label">旋转</span>
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={onRotationChange}
                className="range-slider"
              />
              <span className="control-value">{rotation}°</span>
            </div>
          </div>

          <div className="crop-tips">
            <span className="tip-icon">💡</span>
            <span>拖动图片调整位置，使用滚轮或滑块调整缩放</span>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button className="btn-cancel" onClick={handleCancel} disabled={loading}>
            取消
          </button>
          <button className="btn-confirm" onClick={handleConfirm} disabled={loading}>
            {loading ? '处理中...' : '确认裁剪'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 裁剪图片的核心函数
 */
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

/**
 * 创建图片对象
 */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

export default ImageCropModal;

