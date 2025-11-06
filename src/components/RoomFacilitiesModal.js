import React, { useState, useEffect } from 'react';
import HotelFacilitiesSelector from './HotelFacilitiesSelector';
import './RoomFacilitiesModal.css';

const RoomFacilitiesModal = ({ 
  isOpen, 
  onClose, 
  roomName, 
  facilities = [], 
  onChange,
  allRooms = [], // 所有房型数据，用于复制功能
  currentRoomIndex = -1 // 当前房型索引，避免复制自己
}) => {
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // 初始化设施数据
  useEffect(() => {
    if (isOpen) {
      setSelectedFacilities(facilities || []);
    }
  }, [isOpen, facilities]);

  // 处理设施变化
  const handleFacilitiesChange = (newFacilities) => {
    setSelectedFacilities(newFacilities);
  };

  // 保存设施
  const handleSave = () => {
    if (onChange) {
      onChange(selectedFacilities);
    }
    onClose();
  };

  // 取消编辑
  const handleCancel = () => {
    setSelectedFacilities(facilities || []);
    onClose();
  };

  // 复制其他房型的设施
  const handleCopyFromRoom = (roomIndex) => {
    const targetRoom = allRooms[roomIndex];
    if (targetRoom && targetRoom.roomFacilities) {
      setSelectedFacilities([...targetRoom.roomFacilities]);
      setShowCopyModal(false);
    }
  };

  // 获取可复制的房型列表（排除当前房型）
  const getAvailableRooms = () => {
    return allRooms
      .map((room, index) => ({ ...room, originalIndex: index }))
      .filter((room, index) => index !== currentRoomIndex && room.roomFacilities && room.roomFacilities.length > 0);
  };

  if (!isOpen) return null;

  return (
    <div className="room-facilities-modal-overlay">
      <div className="room-facilities-modal">
        <div className="modal-header">
          <h2>🏨 {roomName} - 房间设施配置</h2>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <div className="modal-content">
          <div className="facilities-actions">
            <div className="facilities-info">
              <span className="current-count">
                已选择 {selectedFacilities.length} 项设施
              </span>
            </div>
            
            {getAvailableRooms().length > 0 && (
              <button 
                className="copy-facilities-btn"
                onClick={() => setShowCopyModal(true)}
              >
                <span className="copy-icon">📋</span>
                复制其他房型设施
              </button>
            )}
          </div>

          <div className="facilities-selector-container">
            <HotelFacilitiesSelector
              value={selectedFacilities}
              onChange={handleFacilitiesChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleCancel}>
            取消
          </button>
          <button className="save-btn" onClick={handleSave}>
            保存设施配置
          </button>
        </div>

        {/* 复制房型设施弹窗 */}
        {showCopyModal && (
          <div className="copy-modal-overlay">
            <div className="copy-modal">
              <div className="copy-modal-header">
                <h3>选择要复制的房型</h3>
                <button 
                  className="copy-close-btn" 
                  onClick={() => setShowCopyModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="copy-modal-content">
                {getAvailableRooms().length === 0 ? (
                  <div className="no-rooms-message">
                    <span className="empty-icon">📭</span>
                    <p>暂无其他房型可复制</p>
                    <small>其他房型需要先配置设施才能复制</small>
                  </div>
                ) : (
                  <div className="rooms-list">
                    {getAvailableRooms().map((room) => (
                      <div 
                        key={room.originalIndex} 
                        className="room-item"
                        onClick={() => handleCopyFromRoom(room.originalIndex)}
                      >
                        <div className="room-info">
                          <div className="room-name">{room.name}</div>
                          <div className="room-details">
                            <span className="facilities-count">
                              {room.roomFacilities.length} 项设施
                            </span>
                            <span className="room-price">¥{room.price}</span>
                          </div>
                        </div>
                        
                        <div className="room-facilities-preview">
                          {room.roomFacilities.slice(0, 3).map((facility, index) => (
                            <span key={index} className="facility-preview-tag">
                              {facility.name}
                              {facility.subtype && `(${facility.subtype})`}
                            </span>
                          ))}
                          {room.roomFacilities.length > 3 && (
                            <span className="more-facilities">
                              +{room.roomFacilities.length - 3}项
                            </span>
                          )}
                        </div>

                        <div className="copy-arrow">→</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="copy-modal-footer">
                <button 
                  className="copy-cancel-btn" 
                  onClick={() => setShowCopyModal(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomFacilitiesModal;
