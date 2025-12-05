import React, { useState } from 'react';
import BedConfiguration from './BedConfiguration';
import RoomFacilitiesModal from './RoomFacilitiesModal';
import ImageUploadWithCrop from './ImageUploadWithCrop';
import { getImageUrl } from '../utils/imageUtils';
import './AdvancedItemManager.css';

const AdvancedItemManager = ({ 
  items = [], 
  onItemsChange, 
  itemType = 'dish', // 'dish', 'room', 'service'
  merchantCategory,
  onAutoSave // 新增：自动保存回调函数
}) => {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newItem, setNewItem] = useState(getEmptyItem());
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [facilitiesModalOpen, setFacilitiesModalOpen] = useState(false);
  const [currentFacilitiesIndex, setCurrentFacilitiesIndex] = useState(-1);

  function getEmptyItem() {
    const baseItem = {
      name: '',
      description: '',
      image: ''
    };

    if (itemType === 'dish') {
      return { ...baseItem, price: '' };
    } else if (itemType === 'room') {
      return { 
        ...baseItem, 
        price: '', 
        facilities: [],
        maxGuests: 2,
        beds: [],
        roomFacilities: []
      };
    }
    
    return baseItem;
  }

  const getItemTypeConfig = () => {
    const configs = {
      dish: {
        title: '菜品',
        addButtonText: '添加新菜品',
        nameLabel: '菜品名称',
        namePlaceholder: '请输入菜品名称',
        descriptionLabel: '菜品介绍',
        descriptionPlaceholder: '请输入菜品介绍',
        priceLabel: '价格 (¥)',
        pricePlaceholder: '请输入价格',
        icon: '🍽️'
      },
      room: {
        title: '房型管理',
        addButtonText: '添加新房型',
        nameLabel: '房型名称',
        namePlaceholder: '请输入房型名称',
        descriptionLabel: '房型介绍',
        descriptionPlaceholder: '请输入房型介绍',
        priceLabel: '门市价 (¥)',
        pricePlaceholder: '请输入门市价格',
        maxGuestsLabel: '最大入住人数',
        maxGuestsPlaceholder: '请输入最大入住人数',
        bedsLabel: '床位配置',
        facilitiesLabel: '房间设施',
        facilitiesPlaceholder: '请输入设施，用逗号分隔',
        icon: '🛏️'
      },
      service: {
        title: '服务项目',
        addButtonText: '添加新服务',
        nameLabel: '服务名称',
        namePlaceholder: '请输入服务名称',
        descriptionLabel: '服务介绍',
        descriptionPlaceholder: '请输入服务介绍',
        icon: '🎯'
      }
    };
    
    return configs[itemType] || configs.service;
  };

  const config = getItemTypeConfig();

  const handleInputChange = (field, value, isEditing = false, index = -1) => {
    if (isEditing && index >= 0) {
      const updatedItems = [...items];
      if (field === 'facilities' && itemType === 'room') {
        updatedItems[index][field] = value.split(',').map(f => f.trim()).filter(f => f);
      } else {
        updatedItems[index][field] = value;
      }
      onItemsChange(updatedItems);
    } else {
      if (field === 'facilities' && itemType === 'room') {
        setNewItem(prev => ({ ...prev, [field]: value.split(',').map(f => f.trim()).filter(f => f) }));
      } else {
        setNewItem(prev => ({ ...prev, [field]: value }));
      }
    }
  };

  // 处理床位配置变化
  const handleBedsChange = (beds, isEditing = false, index = -1) => {
    handleInputChange('beds', beds, isEditing, index);
  };

  // 打开房间设施选择弹窗
  const openFacilitiesModal = (index = -1) => {
    setCurrentFacilitiesIndex(index);
    setFacilitiesModalOpen(true);
  };

  // 关闭房间设施选择弹窗
  const closeFacilitiesModal = () => {
    setFacilitiesModalOpen(false);
    setCurrentFacilitiesIndex(-1);
  };

  // 处理房间设施变化
  const handleRoomFacilitiesChange = (facilities) => {
    if (currentFacilitiesIndex === -1) {
      // 新房型
      setNewItem(prev => ({ ...prev, roomFacilities: facilities }));
    } else {
      // 编辑现有房型
      const updatedItems = [...items];
      updatedItems[currentFacilitiesIndex] = { 
        ...updatedItems[currentFacilitiesIndex], 
        roomFacilities: facilities 
      };
      onItemsChange(updatedItems);
    }
  };

  // 图片上传成功处理（使用新的裁剪上传组件）
  const handleImageUploadSuccess = (url, isEditing = false, index = -1) => {
    if (isEditing && index >= 0) {
      const updatedItems = [...items];
      updatedItems[index].image = url;
      onItemsChange(updatedItems);
    } else {
      setNewItem(prev => ({ ...prev, image: url }));
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim()) {
      alert(`请输入${config.nameLabel}`);
      return;
    }

    const updatedItems = [...items, { ...newItem }];
    onItemsChange(updatedItems);
    
    // 自动保存
    if (onAutoSave) {
      try {
        await onAutoSave(updatedItems);
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }
    
    setNewItem(getEmptyItem());
  };

  const removeItem = async (index) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      const updatedItems = items.filter((_, i) => i !== index);
      onItemsChange(updatedItems);
      if (editingIndex === index) {
        setEditingIndex(-1);
      }
      
      // 自动保存
      if (onAutoSave) {
        try {
          await onAutoSave(updatedItems);
        } catch (error) {
          console.error('自动保存失败:', error);
        }
      }
    }
  };

  const duplicateItem = async (index) => {
    const itemToDuplicate = { ...items[index] };
    itemToDuplicate.name = `${itemToDuplicate.name} (副本)`;
    const updatedItems = [...items, itemToDuplicate];
    onItemsChange(updatedItems);
    
    // 自动保存
    if (onAutoSave) {
      try {
        await onAutoSave(updatedItems);
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }
  };

  const moveItem = async (fromIndex, toIndex) => {
    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);
    onItemsChange(updatedItems);
    
    // 自动保存
    if (onAutoSave) {
      try {
        await onAutoSave(updatedItems);
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveItem(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const renderItemForm = (item, isEditing = false, index = -1) => (
    <div className="item-form">
      <div className="form-row">
        <div className="form-group">
          <label>{config.nameLabel}</label>
          <input
            type="text"
            value={item.name}
            onChange={(e) => handleInputChange('name', e.target.value, isEditing, index)}
            placeholder={config.namePlaceholder}
          />
        </div>
        
        {(itemType === 'dish' || itemType === 'room') && (
          <div className="form-group">
            <label>{config.priceLabel}</label>
            <input
              type="number"
              value={item.price}
              onChange={(e) => handleInputChange('price', e.target.value, isEditing, index)}
              placeholder={config.pricePlaceholder}
              min="0"
              step="0.01"
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>{config.descriptionLabel}</label>
        <textarea
          value={item.description}
          onChange={(e) => handleInputChange('description', e.target.value, isEditing, index)}
          placeholder={config.descriptionPlaceholder}
          rows="3"
        />
      </div>

      {itemType === 'room' && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>{config.maxGuestsLabel}</label>
              <input
                type="number"
                value={item.maxGuests || 2}
                onChange={(e) => handleInputChange('maxGuests', parseInt(e.target.value) || 2, isEditing, index)}
                placeholder={config.maxGuestsPlaceholder}
                min="1"
                max="20"
              />
              <small className="help-text">最多可入住人数</small>
            </div>
          </div>

          <div className="form-group">
            <label>{config.bedsLabel}</label>
            <BedConfiguration
              value={item.beds || []}
              onChange={(beds) => handleBedsChange(beds, isEditing, index)}
            />
          </div>

          <div className="form-group">
            <label>房间设施配置</label>
            <div className="room-facilities-section">
              <div className="facilities-summary">
                {item.roomFacilities && item.roomFacilities.length > 0 ? (
                  <div className="facilities-preview">
                    <span className="facilities-count">
                      已配置 {item.roomFacilities.length} 项设施
                    </span>
                    <div className="facilities-tags">
                      {item.roomFacilities.slice(0, 3).map((facility, idx) => (
                        <span key={idx} className="facility-tag-small">
                          {facility.name}
                          {facility.subtype && `(${facility.subtype})`}
                        </span>
                      ))}
                      {item.roomFacilities.length > 3 && (
                        <span className="more-facilities-tag">
                          +{item.roomFacilities.length - 3}项
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-facilities">
                    <span className="no-facilities-text">未配置房间设施</span>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                className="configure-facilities-btn"
                onClick={() => openFacilitiesModal(isEditing ? index : -1)}
              >
                🏨 配置房间设施
              </button>
            </div>
            <small className="help-text">点击按钮配置详细的房间设施，支持多选和自定义选项</small>
          </div>
        </>
      )}

      <div className="form-group">
        <label>图片</label>
        <ImageUploadWithCrop
          currentImage={item.image}
          onUploadSuccess={(url) => handleImageUploadSuccess(url, isEditing, index)}
          aspectRatio={16 / 9}
          buttonText={item.image ? '更换图片' : '上传图片'}
          showPreview={true}
          isNewItem={!isEditing && index === -1}
        />
      </div>
    </div>
  );

  return (
    <div className="advanced-item-manager">
      <div className="manager-header">
        <h3>
          <span className="header-icon">{config.icon}</span>
          {config.title}
        </h3>
        <div className="header-stats">
          共 {items.length} 个项目
        </div>
      </div>

      {/* 现有项目列表 */}
      <div className="items-list">
        {items.map((item, index) => (
          <div
            key={index}
            className={`item-card ${editingIndex === index ? 'editing' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="item-header">
              <div className="drag-handle">⋮⋮</div>
              <div className="item-info">
                <h4>{item.name}</h4>
                {(itemType === 'dish' || itemType === 'room') && item.price && (
                  <span className="item-price">¥{item.price}</span>
                )}
              </div>
              <div className="item-actions">
                <button
                  className="action-btn edit"
                  onClick={() => setEditingIndex(editingIndex === index ? -1 : index)}
                  title="编辑"
                >
                  编辑
                </button>
                <button
                  className="action-btn duplicate"
                  onClick={() => duplicateItem(index)}
                  title="复制"
                >
                  复制
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => removeItem(index)}
                  title="删除"
                >
                  删除
                </button>
              </div>
            </div>

            {editingIndex === index ? (
              <div className="item-edit-form">
                {renderItemForm(item, true, index)}
                <div className="edit-actions">
                  <button
                    className="btn-confirm"
                    onClick={async () => {
                      // 自动保存
                      if (onAutoSave) {
                        try {
                          await onAutoSave(items);
                        } catch (error) {
                          console.error('自动保存失败:', error);
                        }
                      }
                      setEditingIndex(-1);
                    }}
                  >
                    确认编辑
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setEditingIndex(-1)}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="item-preview">
                {item.image && (
                  <div className="preview-image">
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                    />
                  </div>
                )}
                <div className="preview-content">
                  {item.description && <p className="item-description">{item.description}</p>}
                  {itemType === 'room' && item.facilities && item.facilities.length > 0 && (
                    <div className="facilities">
                      <strong>设施：</strong>
                      {item.facilities.map((facility, i) => (
                        <span key={i} className="facility-tag">{facility}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">{config.icon}</div>
            <p>还没有添加任何{config.title.replace('管理', '').replace('项目', '')}</p>
            <p>点击下方按钮开始添加吧！</p>
          </div>
        )}
      </div>

      {/* 添加新项目表单 */}
      <div className="add-item-section">
        <h4>
          <span className="add-icon">➕</span>
          {config.addButtonText}
        </h4>
        {renderItemForm(newItem)}
        <div className="add-actions">
          <button className="btn-add" onClick={addItem}>
            添加项目
          </button>
          <button 
            className="btn-reset" 
            onClick={() => setNewItem(getEmptyItem())}
          >
            重置表单
          </button>
        </div>
      </div>

      {/* 房间设施配置弹窗 */}
      {itemType === 'room' && facilitiesModalOpen && (
        <RoomFacilitiesModal
          isOpen={facilitiesModalOpen}
          onClose={closeFacilitiesModal}
          roomName={
            currentFacilitiesIndex === -1 
              ? newItem.name || '新房型' 
              : items[currentFacilitiesIndex]?.name || '房型'
          }
          facilities={
            currentFacilitiesIndex === -1 
              ? newItem.roomFacilities || []
              : items[currentFacilitiesIndex]?.roomFacilities || []
          }
          onChange={handleRoomFacilitiesChange}
          allRooms={items}
          currentRoomIndex={currentFacilitiesIndex}
        />
      )}
    </div>
  );
};

export default AdvancedItemManager;
