import React, { useState } from 'react';
import { merchantAPI } from '../services/api';
import './MerchantLogin.css';

const MerchantLogin = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await merchantAPI.login(formData);

      if (response.success) {
        // 保存商家信息到localStorage
        localStorage.setItem('merchantInfo', JSON.stringify(response.data));
        localStorage.setItem('merchantId', response.data._id);
        
        // 调用登录成功回调
        if (onLoginSuccess) {
          onLoginSuccess(response.data);
        } else {
          // 跳转到商家管理面板
          window.location.href = '/merchant/dashboard';
        }
      }
    } catch (error) {
      setError(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="merchant-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>商家登录</h1>
          <p>欢迎回到敦煌文旅平台</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                登录中...
              </>
            ) : '登录'}
          </button>

          <div className="login-footer">
            <a href="/merchant/register" className="link-register">
              还没有账户？立即注册
            </a>
          </div>
        </form>

        <div className="login-tips">
          <h4>温馨提示：</h4>
          <ul>
            <li>注册成功后即可立即使用所有功能</li>
            <li>请妥善保管您的登录账号和密码</li>
            <li>如有问题请联系平台客服</li>
          </ul>
        </div>
      </div>

      <div className="login-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default MerchantLogin;

