import React, { useState, useEffect } from 'react';
import './BedConfiguration.css';

const BedConfiguration = ({ value = [], onChange }) => {
  const [beds, setBeds] = useState([]);
  const [showAddBed, setShowAddBed] = useState(false);
  const [newBed, setNewBed] = useState({
    type: '',
    width: '',
    count: 1
  });

  const bedTypes = [
    { value: 'single', label: '单人床', icon: '🛏️' },
    { value: 'double', label: '双人大床', icon: '🛌' },
    { value: 'sofa', label: '沙发床', icon: '🛋️' },
    { value: 'bunk', label: '上下铺', icon: '🪜' },
    { value: 'tatami', label: '榻榻米', icon: '🏯' }
  ];

  // 初始化床位数据
  useEffect(() => {
    if (value && Array.isArray(value)) {
      setBeds(value);
    }
  }, [value]);

  // 添加床位
  const addBed = () => {
    if (!newBed.type || !newBed.width) {
      alert('请选择床型和输入床宽');
      return;
    }

    const bedToAdd = {
      id: `bed-${Date.now()}`,
      type: newBed.type,
      width: parseFloat(newBed.width),
      count: parseInt(newBed.count) || 1,
      label: bedTypes.find(bt => bt.value === newBed.type)?.label || newBed.type
    };

    const updatedBeds = [...beds, bedToAdd];
    setBeds(updatedBeds);
    
    // 重置表单
    setNewBed({ type: '', width: '', count: 1 });
    setShowAddBed(false);

    // 通知父组件
    if (onChange) {
      onChange(updatedBeds);
    }
  };

  // 删除床位
  const removeBed = (bedId) => {
    const updatedBeds = beds.filter(bed => bed.id !== bedId);
    setBeds(updatedBeds);

    if (onChange) {
      onChange(updatedBeds);
    }
  };

  // 更新床位数量
  const updateBedCount = (bedId, newCount) => {
    if (newCount < 1) return;

    const updatedBeds = beds.map(bed => 
      bed.id === bedId ? { ...bed, count: parseInt(newCount) } : bed
    );
    setBeds(updatedBeds);

    if (onChange) {
      onChange(updatedBeds);
    }
  };

  // 计算总床位数
  const getTotalBeds = () => {
    return beds.reduce((total, bed) => total + bed.count, 0);
  };

  // 获取床型图标
  const getBedIcon = (type) => {
    return bedTypes.find(bt => bt.value === type)?.icon || '🛏️';
  };

  return (
    <div className="bed-configuration">
      <div className="bed-config-header">
        <div className="bed-summary">
          <span className="bed-count">共 {getTotalBeds()} 张床</span>
          <span className="bed-types">{beds.length} 种床型</span>
        </div>
        
        {!showAddBed && (
          <button 
            type="button" 
            className="add-bed-btn"
            onClick={() => setShowAddBed(true)}
          >
            <span className="add-icon">+</span>
            添加床位
          </button>
        )}
      </div>

      {/* 床位列表 */}
      {beds.length > 0 && (
        <div className="beds-list">
          {beds.map(bed => (
            <div key={bed.id} className="bed-item">
              <div className="bed-info">
                <span className="bed-icon">{getBedIcon(bed.type)}</span>
                <div className="bed-details">
                  <span className="bed-label">{bed.label}</span>
                  <span className="bed-specs">{bed.width}m宽</span>
                </div>
              </div>

              <div className="bed-controls">
                <div className="bed-counter">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => updateBedCount(bed.id, bed.count - 1)}
                    disabled={bed.count <= 1}
                  >
                    -
                  </button>
                  <span className="bed-count-display">{bed.count}</span>
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => updateBedCount(bed.id, bed.count + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="remove-bed-btn"
                  onClick={() => removeBed(bed.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加床位表单 */}
      {showAddBed && (
        <div className="add-bed-form">
          <h4>添加床位</h4>
          
          <div className="bed-type-selector">
            <label>床型选择</label>
            <div className="bed-type-options">
              {bedTypes.map(bedType => (
                <label key={bedType.value} className="bed-type-option">
                  <input
                    type="radio"
                    name="bedType"
                    value={bedType.value}
                    checked={newBed.type === bedType.value}
                    onChange={(e) => setNewBed({ ...newBed, type: e.target.value })}
                  />
                  <span className="bed-type-content">
                    <span className="bed-type-icon">{bedType.icon}</span>
                    <span className="bed-type-label">{bedType.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bed-form-row">
            <div className="form-group">
              <label>床宽 (米)</label>
              <input
                type="number"
                step="0.1"
                min="0.8"
                max="3.0"
                placeholder="1.5"
                value={newBed.width}
                onChange={(e) => setNewBed({ ...newBed, width: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>数量</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newBed.count}
                onChange={(e) => setNewBed({ ...newBed, count: e.target.value })}
              />
            </div>
          </div>

          <div className="bed-form-actions">
            <button
              type="button"
              className="confirm-bed-btn"
              onClick={addBed}
            >
              确认添加
            </button>
            <button
              type="button"
              className="cancel-bed-btn"
              onClick={() => {
                setShowAddBed(false);
                setNewBed({ type: '', width: '', count: 1 });
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 床位配置预览 */}
      {beds.length > 0 && (
        <div className="bed-preview">
          <h4>床位配置总览</h4>
          <div className="bed-summary-text">
            {beds.map((bed, index) => (
              <span key={bed.id} className="bed-summary-item">
                {bed.count}张{bed.label}({bed.width}m)
                {index < beds.length - 1 && '、'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BedConfiguration;
