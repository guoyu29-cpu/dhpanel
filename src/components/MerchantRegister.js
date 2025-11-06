import React, { useState } from 'react';
import { merchantAPI } from '../services/api';
import './MerchantRegister.css';

const MerchantRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    category: '',
    address: '',
    contactName: '',
    isOwner: false,
    phone: '',
    wechat: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = ['餐饮', '住宿', '旅行社', '活动提供商', '出行服务'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (!formData.shopName) {
      newErrors.shopName = '请输入店铺名称';
    }

    if (!formData.category) {
      newErrors.category = '请选择类别';
    }

    if (!formData.address) {
      newErrors.address = '请输入地址';
    }

    if (!formData.contactName) {
      newErrors.contactName = '请输入联系人姓名';
    }

    if (!formData.phone) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await merchantAPI.register(submitData);

      if (response.success) {
        setSuccess(true);
        // 清空表单
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          shopName: '',
          category: '',
          address: '',
          contactName: '',
          isOwner: false,
          phone: '',
          wechat: ''
        });

        // 3秒后可以跳转到登录页面
        setTimeout(() => {
          window.location.href = '/merchant/login';
        }, 3000);
      }
    } catch (error) {
      setErrors({ submit: error.message || '注册失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="merchant-register-container">
        <div className="success-message">
        <div className="success-icon">✓</div>
        <h2>注册成功！</h2>
        <p>您的商家账户已创建成功，正在跳转到登录页面...</p>
        <p className="status-note">您的账户已激活，可以立即使用所有功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>商家入驻</h1>
          <p>欢迎入驻敦煌文旅平台</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* 店铺基本信息 */}
          <div className="form-section">
            <h3>店铺基本信息</h3>

            <div className="form-group">
              <label htmlFor="shopName">店铺名称 <span className="required">*</span></label>
              <input
                type="text"
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="请输入店铺名称"
                className={errors.shopName ? 'error' : ''}
              />
              {errors.shopName && <span className="error-message">{errors.shopName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">类别 <span className="required">*</span></label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">请选择类别</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">地址 <span className="required">*</span></label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="请输入详细地址"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
          </div>

          {/* 账户信息 */}
          <div className="form-section">
            <h3>账户信息</h3>
            
            <div className="form-group">
              <label htmlFor="username">用户名 <span className="required">*</span></label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="请输入用户名（至少3个字符）"
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">密码 <span className="required">*</span></label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码（至少6个字符）"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">确认密码 <span className="required">*</span></label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="请再次输入密码"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          {/* 联系人信息 */}
          <div className="form-section">
            <h3>联系人信息</h3>

            <div className="form-group">
              <label htmlFor="contactName">联系人姓名 <span className="required">*</span></label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="请输入联系人姓名"
                className={errors.contactName ? 'error' : ''}
              />
              {errors.contactName && <span className="error-message">{errors.contactName}</span>}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isOwner"
                  checked={formData.isOwner}
                  onChange={handleChange}
                />
                <span>我是店铺所有者</span>
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">联系电话 <span className="required">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="请输入手机号码"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="wechat">微信号</label>
                <input
                  type="text"
                  id="wechat"
                  name="wechat"
                  value={formData.wechat}
                  onChange={handleChange}
                  placeholder="请输入微信号（选填）"
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-alert">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '注册中...' : '提交注册'}
            </button>
            <a href="/merchant/login" className="link-secondary">
              已有账户？立即登录
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantRegister;

