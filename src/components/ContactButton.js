import React, { useState } from 'react';
import './ContactButton.css';

const ContactButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button className="contact-float-btn" onClick={() => setShowModal(true)}>
        <span className="contact-text">联系我们</span>
      </button>

      {showModal && (
        <div className="contact-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-header">
              <h3>联系平台团队</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            
            <div className="contact-modal-body">
              <div className="contact-section">
                <h4>敦煌文旅平台</h4>
                <p className="platform-desc">为您提供专业的商家服务支持</p>
              </div>

              <div className="contact-divider"></div>

              <div className="contact-info-grid">
                <div className="contact-item">
                  <div className="contact-item-content">
                    <div className="contact-label">联系电话</div>
                    <div className="contact-value">13989648964</div>
                    <div className="contact-note">工作时间内接听</div>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-content">
                    <div className="contact-label">联系微信</div>
                    <div className="contact-value">1234567890</div>
                    <div className="contact-note">扫码或搜索添加</div>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-content">
                    <div className="contact-label">商务邮箱</div>
                    <div className="contact-value">XXXXXX@dhtravel.com</div>
                    <div className="contact-note">1-2个工作日内回复</div>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-content">
                    <div className="contact-label">办公地址</div>
                    <div className="contact-value">北京市东城区</div>
                    <div className="contact-note">北京国际俱乐部大厦</div>
                  </div>
                </div>
              </div>

              <div className="contact-divider"></div>

              <div className="office-hours-section">
                <div className="office-hours-header">
                  <h4>办公时间</h4>
                </div>
                <div className="office-hours-grid">
                  <div className="office-hour-item">
                    <span className="day-label">工作日</span>
                    <span className="time-label">09:00 - 18:00</span>
                  </div>
                  <div className="office-hour-item weekend">
                    <span className="day-label">周末</span>
                    <span className="time-label">10:00 - 17:00</span>
                  </div>
                </div>
                <div className="office-note">
                  <span>注意：法定节假日休息，紧急事务请电话咨询</span>
                </div>
              </div>
            </div>

            <div className="contact-modal-footer">
              <button className="btn-primary" onClick={() => setShowModal(false)}>
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactButton;


