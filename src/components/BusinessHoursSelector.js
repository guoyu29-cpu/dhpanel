import React, { useState, useEffect, useRef } from 'react';
import './BusinessHoursSelector.css';

const BusinessHoursSelector = ({ value, onChange }) => {
  const [businessHours, setBusinessHours] = useState({
    monday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '18:00' }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [linkedEditing, setLinkedEditing] = useState(true); // 是否联动编辑
  const [firstEditedDay, setFirstEditedDay] = useState(null); // 第一个被编辑的日期
  const [dragState, setDragState] = useState(null); // 拖拽状态

  const dayNames = {
    monday: '周一',
    tuesday: '周二',
    wednesday: '周三',
    thursday: '周四',
    friday: '周五',
    saturday: '周六',
    sunday: '周日'
  };

  // 解析传入的营业时间字符串
  useEffect(() => {
    if (value && typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
          setBusinessHours(prev => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        // 如果解析失败，尝试解析传统格式
        parseTraditionalFormat(value);
      }
    }
  }, [value]);

  // 解析传统格式的营业时间
  const parseTraditionalFormat = (timeString) => {
    // 例如："周一至周日 9:00-21:00" 或 "每天 10:00-22:00"
    const newHours = { ...businessHours };
    
    if (timeString.includes('周一至周日') || timeString.includes('每天')) {
      const timeMatch = timeString.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const openTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
        const closeTime = `${timeMatch[3].padStart(2, '0')}:${timeMatch[4]}`;
        
        Object.keys(newHours).forEach(day => {
          newHours[day] = { isOpen: true, openTime, closeTime };
        });
        
        setBusinessHours(newHours);
      }
    }
  };

  // 更新单个工作日
  const updateDay = (day, field, value, skipLinked = false) => {
    const newHours = { ...businessHours };
    
    // 更新当前日期
    newHours[day] = {
      ...newHours[day],
      [field]: value
    };

    // 如果是联动编辑且不是跳过联动
    if (linkedEditing && !skipLinked) {
      if (firstEditedDay === null) {
        // 第一次编辑，记录第一个编辑的日期
        setFirstEditedDay(day);
        // 将相同的时间应用到所有营业日
        Object.keys(newHours).forEach(dayKey => {
          if (newHours[dayKey].isOpen) {
            newHours[dayKey] = {
              ...newHours[dayKey],
              [field]: value
            };
          }
        });
      } else if (firstEditedDay === day) {
        // 继续编辑第一个日期，同步到其他营业日
        Object.keys(newHours).forEach(dayKey => {
          if (newHours[dayKey].isOpen && dayKey !== day) {
            newHours[dayKey] = {
              ...newHours[dayKey],
              [field]: value
            };
          }
        });
      } else {
        // 编辑了其他日期，取消联动
        setLinkedEditing(false);
        setFirstEditedDay(null);
      }
    }
    
    setBusinessHours(newHours);
    
    // 通知父组件
    if (onChange) {
      onChange(JSON.stringify(newHours));
    }
  };

  // 时间转换为分钟数
  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 分钟数转换为时间
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // 处理时间条拖拽
  const handleTimeBarDrag = (day, type, trackElement, event) => {
    const rect = trackElement.getBoundingClientRect();
    const containerWidth = rect.width;
    const offsetX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / containerWidth));
    
    // 将百分比转换为时间（0-24小时，15分钟间隔）
    const totalMinutes = Math.round(percentage * 24 * 60 / 15) * 15;
    const newTime = minutesToTime(totalMinutes);
    
    // 确保开始时间小于结束时间
    const currentDay = businessHours[day];
    if (type === 'start') {
      const endMinutes = timeToMinutes(currentDay.closeTime);
      if (totalMinutes < endMinutes) {
        updateDay(day, 'openTime', newTime);
      }
    } else {
      const startMinutes = timeToMinutes(currentDay.openTime);
      if (totalMinutes > startMinutes) {
        updateDay(day, 'closeTime', newTime);
      }
    }
  };

  // 处理轨道点击
  const handleTrackClick = (day, event) => {
    // 如果点击的是拖拽手柄，不处理
    if (event.target.classList.contains('time-handle')) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const containerWidth = rect.width;
    const offsetX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / containerWidth));
    
    const totalMinutes = Math.round(percentage * 24 * 60 / 15) * 15;
    const newTime = minutesToTime(totalMinutes);
    
    const currentDay = businessHours[day];
    const startMinutes = timeToMinutes(currentDay.openTime);
    const endMinutes = timeToMinutes(currentDay.closeTime);
    
    // 判断点击位置更接近开始时间还是结束时间
    const distanceToStart = Math.abs(totalMinutes - startMinutes);
    const distanceToEnd = Math.abs(totalMinutes - endMinutes);
    
    if (distanceToStart < distanceToEnd) {
      // 更接近开始时间，调整开始时间
      if (totalMinutes < endMinutes) {
        updateDay(day, 'openTime', newTime);
      }
    } else {
      // 更接近结束时间，调整结束时间
      if (totalMinutes > startMinutes) {
        updateDay(day, 'closeTime', newTime);
      }
    }
  };

  // 开始编辑
  const startEditing = () => {
    setIsEditing(true);
    setLinkedEditing(true);
    setFirstEditedDay(null);
  };

  // 结束编辑
  const stopEditing = () => {
    setIsEditing(false);
    setLinkedEditing(true);
    setFirstEditedDay(null);
  };

  // 切换营业状态
  const toggleDayOpen = (day) => {
    updateDay(day, 'isOpen', !businessHours[day].isOpen, true);
  };

  // 设置全周营业 (7*24小时)
  const setFullWeekOpen = () => {
    const newHours = { ...businessHours };
    Object.keys(newHours).forEach(day => {
      newHours[day] = { 
        isOpen: true, 
        openTime: '00:00', 
        closeTime: '23:59' 
      };
    });
    
    setBusinessHours(newHours);
    setLinkedEditing(true);
    setFirstEditedDay('monday'); // 设置周一为主控日期
    
    if (onChange) {
      onChange(JSON.stringify(newHours));
    }
  };

  // 渲染时间条
  const renderTimeBar = (day, dayData) => {
    if (!dayData.isOpen) return null;

    const startMinutes = timeToMinutes(dayData.openTime);
    const endMinutes = timeToMinutes(dayData.closeTime);
    const totalMinutes = 24 * 60;
    
    const startPercentage = (startMinutes / totalMinutes) * 100;
    const endPercentage = (endMinutes / totalMinutes) * 100;
    const widthPercentage = endPercentage - startPercentage;

    return (
      <div className="time-bar-container">
        <div 
          className="time-bar-track"
          onClick={(e) => handleTrackClick(day, e)}
        >
          <div 
            className="time-bar-range"
            style={{
              left: `${startPercentage}%`,
              width: `${widthPercentage}%`
            }}
          >
            <div 
              className="time-handle time-handle-start"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const trackElement = e.currentTarget.parentElement.parentElement;
                const handleMouseMove = (moveEvent) => {
                  handleTimeBarDrag(day, 'start', trackElement, moveEvent);
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            <div 
              className="time-handle time-handle-end"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const trackElement = e.currentTarget.parentElement.parentElement;
                const handleMouseMove = (moveEvent) => {
                  handleTimeBarDrag(day, 'end', trackElement, moveEvent);
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>
        </div>
        <div className="time-labels">
          <span className="time-label-start">{dayData.openTime}</span>
          <span className="time-label-end">{dayData.closeTime}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="business-hours-selector">
      <div className="selector-header">
        <div className="current-status">
          {Object.entries(businessHours).some(([_, day]) => day.isOpen) ? (
            <span className="status-open">已设置营业时间</span>
          ) : (
            <span className="status-closed">未设置营业时间</span>
          )}
        </div>
        
        <button 
          type="button" 
          className={`edit-btn ${isEditing ? 'editing' : ''}`}
          onClick={isEditing ? stopEditing : startEditing}
        >
          {isEditing ? '完成编辑' : '编辑营业时间'}
        </button>
      </div>

      {isEditing && (
        <div className="editing-panel">
          <div className="editing-actions">
            <button 
              type="button" 
              className="action-btn full-week-btn"
              onClick={setFullWeekOpen}
            >
              <span className="btn-icon">🕐</span>
              设置全周营业 (7×24小时)
            </button>
          </div>

          {linkedEditing && firstEditedDay && (
            <div className="linked-notice">
              <span className="link-icon">🔗</span>
              正在联动编辑所有营业日，编辑其他日期将取消联动
            </div>
          )}

          <div className="days-editor">
            {Object.entries(dayNames).map(([dayKey, dayName]) => (
              <div key={dayKey} className="day-editor-row">
                <div className="day-header">
                  <label className="day-toggle">
                    <input
                      type="checkbox"
                      checked={businessHours[dayKey]?.isOpen || false}
                      onChange={() => toggleDayOpen(dayKey)}
                    />
                    <span className="day-name">{dayName}</span>
                  </label>
                  
                  {businessHours[dayKey]?.isOpen && (
                    <div className="day-status">
                      {dayKey === firstEditedDay && linkedEditing && (
                        <span className="master-day">主控</span>
                      )}
                    </div>
                  )}
                </div>

                {businessHours[dayKey]?.isOpen ? (
                  renderTimeBar(dayKey, businessHours[dayKey])
                ) : (
                  <div className="closed-day">
                    <span>休息日</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="preview-summary">
          {Object.entries(businessHours).some(([_, day]) => day.isOpen) ? (
            <div className="summary-list">
              {Object.entries(businessHours)
                .filter(([_, day]) => day.isOpen)
                .map(([dayKey, day]) => (
                  <div key={dayKey} className="summary-item">
                    <span className="summary-day">{dayNames[dayKey]}</span>
                    <span className="summary-time">{day.openTime} - {day.closeTime}</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="no-hours-message">
              <span className="empty-icon">🕐</span>
              <p>点击"编辑营业时间"开始设置</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessHoursSelector;
