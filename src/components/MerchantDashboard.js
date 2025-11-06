import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../services/api';
import BusinessHoursSelector from './BusinessHoursSelector';
import AdvancedItemManager from './AdvancedItemManager';
import ContactButton from './ContactButton';
import ImageUploadWithCrop from './ImageUploadWithCrop';
import { getImageUrl } from '../utils/imageUtils';
import './MerchantDashboard.css';

const MerchantDashboard = () => {
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 基本信息表单
  const [basicInfo, setBasicInfo] = useState({
    shopName: '',
    description: '',
    address: '',
    businessHours: '',
    phone: '',
    wechat: ''
  });

  const [images, setImages] = useState([]);

  // 餐饮 - 特色菜
  const [specialDishes, setSpecialDishes] = useState([]);

  // 住宿 - 房型
  const [roomTypes, setRoomTypes] = useState([]);

  // 服务
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadMerchantInfo();
  }, []);

  const loadMerchantInfo = async () => {
    try {
      const merchantId = localStorage.getItem('merchantId');
      if (!merchantId) {
        window.location.href = '/merchant/login';
        return;
      }

      const response = await merchantAPI.getMerchantById(merchantId);
      if (response.success) {
        const data = response.data;
        setMerchantInfo(data);

        // 设置基本信息
        setBasicInfo({
          shopName: data.shopName || '',
          description: data.description || '',
          address: data.address || '',
          businessHours: data.businessHours || '',
          phone: data.phone || '',
          wechat: data.wechat || ''
        });

        setImages(data.images || []);
        setSpecialDishes(data.specialDishes || []);
        setRoomTypes(data.roomTypes || []);
        setServices(data.services || []);
      }
    } catch (error) {
      showMessage('error', '加载商家信息失败');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  // 添加店铺图片
  const handleAddShopImage = (url) => {
    setImages(prev => [...prev, url]);
    showMessage('success', '图片上传成功');
  };

  // 删除店铺图片
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveBasicInfo = async () => {
    setSaving(true);
    try {
      const response = await merchantAPI.updateMerchantInfo(merchantInfo._id, {
        ...basicInfo,
        images
      });

      if (response.success) {
        showMessage('success', '基本信息保存成功');
        setMerchantInfo(response.data);
      }
    } catch (error) {
      showMessage('error', '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 保存特色菜
  const saveDishes = async () => {
    setSaving(true);
    try {
      const response = await merchantAPI.updateSpecialDishes(merchantInfo._id, specialDishes);
      if (response.success) {
        showMessage('success', '特色菜保存成功');
      }
    } catch (error) {
      showMessage('error', error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 保存房型
  const saveRooms = async () => {
    setSaving(true);
    try {
      const response = await merchantAPI.updateRoomTypes(merchantInfo._id, roomTypes);
      if (response.success) {
        showMessage('success', '房型保存成功');
      }
    } catch (error) {
      showMessage('error', error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 自动保存房型
  const autoSaveRooms = async (updatedRoomTypes) => {
    try {
      const response = await merchantAPI.updateRoomTypes(merchantInfo._id, updatedRoomTypes);
      if (response.success) {
        console.log('房型自动保存成功');
      }
    } catch (error) {
      console.error('房型自动保存失败:', error);
      throw error;
    }
  };

  // 保存服务
  const saveServices = async () => {
    setSaving(true);
    try {
      const response = await merchantAPI.updateServices(merchantInfo._id, services);
      if (response.success) {
        showMessage('success', '服务保存成功');
      }
    } catch (error) {
      showMessage('error', error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 自动保存特色菜
  const autoSaveSpecialDishes = async (updatedDishes) => {
    try {
      const response = await merchantAPI.updateSpecialDishes(merchantInfo._id, updatedDishes);
      if (response.success) {
        console.log('特色菜自动保存成功');
      }
    } catch (error) {
      console.error('特色菜自动保存失败:', error);
      throw error;
    }
  };

  // 自动保存服务
  const autoSaveServices = async (updatedServices) => {
    try {
      const response = await merchantAPI.updateServices(merchantInfo._id, updatedServices);
      if (response.success) {
        console.log('服务自动保存成功');
      }
    } catch (error) {
      console.error('服务自动保存失败:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchantInfo');
    localStorage.removeItem('merchantId');
    window.location.href = '/merchant/login';
  };

  if (loading) {
    return (
      <div className="merchant-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!merchantInfo) {
    return null;
  }

  return (
    <div className="merchant-dashboard">
      {/* 顶部导航栏 */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>{merchantInfo.shopName}</h1>
            <span className={`status-badge status-${merchantInfo.status}`}>
              {merchantInfo.status === 'approved' && '已审核'}
              {merchantInfo.status === 'pending' && '待审核'}
              {merchantInfo.status === 'rejected' && '已拒绝'}
              {merchantInfo.status === 'suspended' && '已暂停'}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-logout">退出登录</button>
        </div>
      </header>

      {/* 消息提示 */}
      {message.text && (
        <div className={`message-alert message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* 主内容区 */}
      <div className="dashboard-content">
        {/* 侧边栏导航 */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <span className="nav-icon">🏪</span>
              基本信息
            </button>
            
            {merchantInfo.category === '餐饮' && (
              <button
                className={`nav-item ${activeTab === 'dishes' ? 'active' : ''}`}
                onClick={() => setActiveTab('dishes')}
              >
                <span className="nav-icon">🍽️</span>
                菜品管理
              </button>
            )}

            {merchantInfo.category === '住宿' && (
              <button
                className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                <span className="nav-icon">🛏️</span>
                房型管理
              </button>
            )}

            {['旅行社', '活动提供商', '出行服务'].includes(merchantInfo.category) && (
              <button
                className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                <span className="nav-icon">🎯</span>
                服务管理
              </button>
            )}
          </nav>

          <div className="sidebar-info">
            <h4>商家类别</h4>
            <p>{merchantInfo.category}</p>
            <h4>联系方式</h4>
            <p>📞 {merchantInfo.phone}</p>
            {merchantInfo.wechat && <p>💬 {merchantInfo.wechat}</p>}
          </div>
        </aside>

        {/* 内容区域 */}
        <main className="dashboard-main">
          {/* 基本信息 */}
          {activeTab === 'basic' && (
            <div className="content-section">
              <h2>基本信息</h2>

              <div className="form-group">
                <label>店铺名称</label>
                <input
                  type="text"
                  name="shopName"
                  value={basicInfo.shopName}
                  onChange={handleBasicInfoChange}
                  placeholder="请输入店铺名称"
                />
              </div>

              <div className="form-group">
                <label>简介</label>
                <textarea
                  name="description"
                  value={basicInfo.description}
                  onChange={handleBasicInfoChange}
                  placeholder="请输入店铺简介"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>地址</label>
                <input
                  type="text"
                  name="address"
                  value={basicInfo.address}
                  onChange={handleBasicInfoChange}
                  placeholder="请输入详细地址"
                />
              </div>

              <div className="form-group">
                <label>营业时间</label>
                <BusinessHoursSelector
                  value={basicInfo.businessHours}
                  onChange={(value) => setBasicInfo(prev => ({ ...prev, businessHours: value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>联系电话</label>
                  <input
                    type="tel"
                    name="phone"
                    value={basicInfo.phone}
                    onChange={handleBasicInfoChange}
                    placeholder="请输入联系电话"
                  />
                </div>

                <div className="form-group">
                  <label>微信号</label>
                  <input
                    type="text"
                    name="wechat"
                    value={basicInfo.wechat}
                    onChange={handleBasicInfoChange}
                    placeholder="请输入微信号"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>店铺图片</label>
                <div className="shop-images-section">
                  {images.length > 0 && (
                    <div className="images-grid">
                      {images.map((img, index) => (
                        <div key={index} className="image-item">
                          <img src={getImageUrl(img)} alt={`店铺图片${index + 1}`} />
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="add-image-section">
                    <ImageUploadWithCrop
                      onUploadSuccess={handleAddShopImage}
                      aspectRatio={16 / 9}
                      buttonText="添加店铺图片"
                      showPreview={false}
                    />
                  </div>
                  <small className="help-text">建议上传3-5张店铺图片，展示店铺环境和特色</small>
                </div>
              </div>

              <button
                className="btn-save"
                onClick={saveBasicInfo}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存基本信息'}
              </button>
            </div>
          )}

          {/* 菜品管理（餐饮类） */}
          {activeTab === 'dishes' && merchantInfo.category === '餐饮' && (
            <div className="content-section">
              <h2>菜品管理</h2>
              
              <AdvancedItemManager
                items={specialDishes}
                onItemsChange={setSpecialDishes}
                itemType="dish"
                merchantCategory={merchantInfo.category}
                onAutoSave={autoSaveSpecialDishes}
              />
            </div>
          )}

          {/* 房型管理（住宿类） */}
          {activeTab === 'rooms' && merchantInfo.category === '住宿' && (
            <div className="content-section">
              <h2>房型管理</h2>
              
              <AdvancedItemManager
                items={roomTypes}
                onItemsChange={setRoomTypes}
                itemType="room"
                merchantCategory={merchantInfo.category}
                onAutoSave={autoSaveRooms}
              />
            </div>
          )}

          {/* 服务管理（旅行社/活动提供商/出行服务） */}
          {activeTab === 'services' && ['旅行社', '活动提供商', '出行服务'].includes(merchantInfo.category) && (
            <div className="content-section">
              <h2>服务管理</h2>
              
              <AdvancedItemManager
                items={services}
                onItemsChange={setServices}
                itemType="service"
                merchantCategory={merchantInfo.category}
                onAutoSave={autoSaveServices}
              />
            </div>
          )}
        </main>
      </div>
      
      {/* 联系按钮 */}
      <ContactButton />
    </div>
  );
};

export default MerchantDashboard;

