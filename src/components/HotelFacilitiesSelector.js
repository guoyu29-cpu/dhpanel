import React, { useState, useEffect } from 'react';
import './HotelFacilitiesSelector.css';

const HotelFacilitiesSelector = ({ value = [], onChange }) => {
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [customFacilities, setCustomFacilities] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState({});
  const [customInputValue, setCustomInputValue] = useState('');
  const [showSubtypeCustomInput, setShowSubtypeCustomInput] = useState({});
  const [customSubtypeValue, setCustomSubtypeValue] = useState('');

  // 酒店设施数据结构
  const facilitiesData = {
    '基础设施': {
      icon: '🏨',
      items: {
        '免费WiFi': { hasSubtype: true, subtypes: ['全覆盖', '大堂区域', '客房内', '其他'] },
        '停车场': { hasSubtype: true, subtypes: ['免费', '付费', '代客泊车', '地下停车场', '露天停车场', '其他'] },
        '电梯': { hasSubtype: true, subtypes: ['客梯', '货梯', '观光电梯', '其他'] },
        '24小时前台': { hasSubtype: false },
        '行李寄存': { hasSubtype: true, subtypes: ['免费', '付费', '24小时', '其他'] },
        '礼宾服务': { hasSubtype: true, subtypes: ['门童', '行李员', '导游服务', '其他'] },
        '多语言服务': { hasSubtype: true, subtypes: ['英语', '日语', '韩语', '法语', '德语', '俄语', '阿拉伯语', '其他'] },
        '无障碍设施': { hasSubtype: true, subtypes: ['轮椅通道', '无障碍客房', '盲文标识', '助听设备', '其他'] },
        '安全设施': { hasSubtype: true, subtypes: ['监控系统', '门禁卡', '保险箱', '消防设施', '其他'] },
        '空调系统': { hasSubtype: true, subtypes: ['中央空调', '分体空调', '地暖', '其他'] },
        '网络设施': { hasSubtype: true, subtypes: ['光纤宽带', '5G信号', '会议网络', '其他'] }
      }
    },
    '客房设施': {
      icon: '🛏️',
      items: {
        '空调': { hasSubtype: true, subtypes: ['中央空调', '分体空调', '可调温', '变频空调', '其他'] },
        '暖气': { hasSubtype: true, subtypes: ['地暖', '暖气片', '电暖器', '其他'] },
        '电视': { hasSubtype: true, subtypes: ['有线电视', '卫星电视', '智能电视', '国际频道', '4K电视', '投影仪', '其他'] },
        '冰箱': { hasSubtype: true, subtypes: ['迷你吧', '小冰箱', '冷冻室', '酒柜', '其他'] },
        '保险箱': { hasSubtype: true, subtypes: ['房间内', '前台', '电子密码', '指纹识别', '其他'] },
        '吹风机': { hasSubtype: true, subtypes: ['壁挂式', '手持式', '负离子', '其他'] },
        '熨斗/熨衣板': { hasSubtype: true, subtypes: ['房间内', '前台借用', '蒸汽熨斗', '其他'] },
        '拖鞋': { hasSubtype: true, subtypes: ['一次性', '可重复使用', '棉质', '竹纤维', '其他'] },
        '浴袍': { hasSubtype: true, subtypes: ['房间内', '前台借用', '纯棉', '丝质', '其他'] },
        '洗漱用品': { hasSubtype: true, subtypes: ['基础套装', '高档品牌', '环保产品', '有机产品', '其他'] },
        '矿泉水': { hasSubtype: true, subtypes: ['免费', '付费', '每日补充', '品牌水', '其他'] },
        '咖啡/茶具': { hasSubtype: true, subtypes: ['免费', '胶囊咖啡机', '茶包', '现磨咖啡', '茶道套装', '其他'] },
        '书桌': { hasSubtype: true, subtypes: ['办公桌', '梳妆台', '可调节', '其他'] },
        '沙发': { hasSubtype: true, subtypes: ['单人沙发', '双人沙发', '沙发床', '其他'] },
        '阳台': { hasSubtype: true, subtypes: ['私人阳台', '共享阳台', '景观阳台', '法式阳台', '其他'] },
        '床品': { hasSubtype: true, subtypes: ['纯棉床品', '丝质床品', '记忆枕', '羽绒被', '其他'] },
        '窗帘': { hasSubtype: true, subtypes: ['遮光窗帘', '电动窗帘', '纱帘', '其他'] },
        '照明': { hasSubtype: true, subtypes: ['LED灯', '调光灯', '床头灯', '阅读灯', '其他'] },
        '充电设施': { hasSubtype: true, subtypes: ['USB插座', '无线充电', '多国插座', '其他'] }
      }
    },
    '浴室设施': {
      icon: '🚿',
      items: {
        '淋浴': { hasSubtype: true, subtypes: ['花洒', '雨淋式', '按摩喷头', '蒸汽淋浴', '其他'] },
        '浴缸': { hasSubtype: true, subtypes: ['标准浴缸', '按摩浴缸', '深泡浴缸', '圆形浴缸', '其他'] },
        '卫生间': { hasSubtype: true, subtypes: ['独立卫生间', '智能马桶', '坐浴器', '分离式卫生间', '其他'] },
        '毛巾': { hasSubtype: true, subtypes: ['浴巾', '面巾', '地巾', '浴袍', '其他'] },
        '洗发水': { hasSubtype: true, subtypes: ['基础款', '品牌产品', '有机产品', '无硅油', '其他'] },
        '沐浴露': { hasSubtype: true, subtypes: ['基础款', '品牌产品', '有机产品', '香薰型', '其他'] },
        '护发素': { hasSubtype: true, subtypes: ['提供', '品牌产品', '免洗护发素', '其他'] },
        '牙刷牙膏': { hasSubtype: true, subtypes: ['一次性', '品牌产品', '电动牙刷', '其他'] },
        '浴室用品': { hasSubtype: true, subtypes: ['洗手液', '润肤露', '剃须刀', '浴盐', '其他'] },
        '浴室设备': { hasSubtype: true, subtypes: ['浴霸', '排风扇', '防滑垫', '浴室镜', '其他'] },
        '卫浴五金': { hasSubtype: true, subtypes: ['毛巾架', '置物架', '挂钩', '纸巾盒', '其他'] }
      }
    },
    '娱乐设施': {
      icon: '🎮',
      items: {
        '游泳池': { hasSubtype: true, subtypes: ['室内', '室外', '恒温', '儿童池', '无边泳池', '温泉池', '其他'] },
        '健身房': { hasSubtype: true, subtypes: ['24小时', '限时开放', '私人教练', '瑜伽室', '器械齐全', '其他'] },
        '桑拿浴': { hasSubtype: true, subtypes: ['干蒸', '湿蒸', '红外线', '汗蒸房', '其他'] },
        'SPA': { hasSubtype: true, subtypes: ['全身护理', '面部护理', '按摩服务', '足疗', '美容美体', '其他'] },
        '棋牌室': { hasSubtype: true, subtypes: ['麻将', '扑克', '象棋', '围棋', '其他'] },
        'KTV': { hasSubtype: true, subtypes: ['包厢', '大厅', '点歌系统', '私人KTV', '其他'] },
        '台球室': { hasSubtype: true, subtypes: ['美式台球', '英式台球', '斯诺克', '其他'] },
        '网球场': { hasSubtype: true, subtypes: ['室内', '室外', '夜间照明', '红土场地', '其他'] },
        '儿童游乐场': { hasSubtype: true, subtypes: ['室内', '室外', '监护服务', '亲子活动', '其他'] },
        '电影院': { hasSubtype: true, subtypes: ['私人影院', '家庭影院', '3D影院', '其他'] },
        '图书馆': { hasSubtype: true, subtypes: ['安静阅读', '儿童读物', '商务资料', '其他'] },
        '游戏室': { hasSubtype: true, subtypes: ['电子游戏', '桌游', 'VR体验', '其他'] },
        '高尔夫': { hasSubtype: true, subtypes: ['高尔夫球场', '练习场', '迷你高尔夫', '其他'] }
      }
    },
    '餐饮服务': {
      icon: '🍽️',
      items: {
        '餐厅': { hasSubtype: true, subtypes: ['中餐厅', '西餐厅', '自助餐厅', '特色餐厅', '日料', '韩料', '泰料', '其他'] },
        '酒吧': { hasSubtype: true, subtypes: ['大堂酒吧', '屋顶酒吧', '池畔酒吧', '威士忌吧', '鸡尾酒吧', '其他'] },
        '咖啡厅': { hasSubtype: true, subtypes: ['现磨咖啡', '精品咖啡', '下午茶', '轻食', '其他'] },
        '客房送餐': { hasSubtype: true, subtypes: ['24小时', '限时服务', '免费配送', '付费配送', '其他'] },
        '早餐': { hasSubtype: true, subtypes: ['免费', '付费', '自助', '点餐', '中式早餐', '西式早餐', '其他'] },
        '烧烤设施': { hasSubtype: true, subtypes: ['室内', '室外', '设备租借', '自助烧烤', '其他'] },
        '小食店': { hasSubtype: true, subtypes: ['便利店', '零食吧', '夜宵', '其他'] },
        '宴会厅': { hasSubtype: true, subtypes: ['婚宴', '商务宴请', '生日派对', '其他'] },
        '私人订制': { hasSubtype: true, subtypes: ['私人厨师', '定制菜单', '特殊饮食', '其他'] }
      }
    },
    '商务服务': {
      icon: '💼',
      items: {
        '会议室': { hasSubtype: true, subtypes: ['小型会议室', '大型会议室', '多功能厅', '董事会议室', '其他'] },
        '商务中心': { hasSubtype: true, subtypes: ['24小时', '限时开放', '秘书服务', '其他'] },
        '传真/复印': { hasSubtype: true, subtypes: ['免费', '付费', '彩色打印', '其他'] },
        '快递服务': { hasSubtype: true, subtypes: ['国内快递', '国际快递', '代收包裹', '其他'] },
        '租车服务': { hasSubtype: true, subtypes: ['经济型', '商务型', '豪华型', '带司机', '其他'] },
        '旅游咨询': { hasSubtype: true, subtypes: ['行程规划', '票务代订', '导游服务', '其他'] },
        '会议设备': { hasSubtype: true, subtypes: ['投影仪', '音响系统', '视频会议', '同声传译', '其他'] }
      }
    },
    '特色服务': {
      icon: '⭐',
      items: {
        '接送机服务': { hasSubtype: true, subtypes: ['免费', '付费', '豪华轿车', '商务车', '其他'] },
        '洗衣服务': { hasSubtype: true, subtypes: ['免费', '付费', '干洗', '熨烫', '快洗', '其他'] },
        '叫醒服务': { hasSubtype: false },
        '宠物允许入住': { hasSubtype: true, subtypes: ['小型宠物', '大型宠物', '宠物用品', '宠物寄养', '其他'] },
        '无烟房': { hasSubtype: false },
        '禁烟楼层': { hasSubtype: false },
        '管家服务': { hasSubtype: true, subtypes: ['私人管家', '楼层管家', '24小时', '其他'] },
        '婴儿服务': { hasSubtype: true, subtypes: ['婴儿床', '婴儿浴盆', '婴儿餐具', '保姆服务', '其他'] }
      }
    }
  };

  useEffect(() => {
    if (Array.isArray(value)) {
      // 分离预设和自定义设施
      const preset = value.filter(f => !f.isCustom);
      const custom = value.filter(f => f.isCustom);
      setSelectedFacilities(preset);
      setCustomFacilities(custom);
    }
  }, [value]);

  const toggleFacility = (category, facilityName, subtype = null) => {
    if (subtype === '其他') {
      setShowSubtypeCustomInput(prev => ({ 
        ...prev, 
        [`${category}-${facilityName}`]: true 
      }));
      return;
    }

    const facilityId = `${category}-${facilityName}${subtype ? `-${subtype}` : ''}`;
    const newFacility = {
      id: facilityId,
      category,
      name: facilityName,
      subtype,
      isCustom: false
    };

    const isSelected = selectedFacilities.some(f => f.id === facilityId);
    let newSelected;

    if (isSelected) {
      newSelected = selectedFacilities.filter(f => f.id !== facilityId);
    } else {
      newSelected = [...selectedFacilities, newFacility];
    }

    setSelectedFacilities(newSelected);
    
    if (onChange) {
      onChange([...newSelected, ...customFacilities]);
    }
  };

  const addCustomSubtype = (category, facilityName) => {
    if (!customSubtypeValue.trim()) return;

    const facilityId = `${category}-${facilityName}-${customSubtypeValue.trim()}`;
    
    const existingFacility = selectedFacilities.find(f => f.id === facilityId);
    if (existingFacility) {
      alert('该自定义选项已存在');
      return;
    }

    const newFacility = {
      id: facilityId,
      category,
      name: facilityName,
      subtype: customSubtypeValue.trim(),
      isCustom: false,
      isCustomSubtype: true
    };

    const newSelected = [...selectedFacilities, newFacility];

    setSelectedFacilities(newSelected);
    setCustomSubtypeValue('');
    setShowSubtypeCustomInput(prev => ({ 
      ...prev, 
      [`${category}-${facilityName}`]: false 
    }));

    if (onChange) {
      onChange([...newSelected, ...customFacilities]);
    }
  };

  const addCustomFacility = () => {
    if (!customInputValue.trim()) return;

    const newFacility = {
      id: `custom-${Date.now()}`,
      name: customInputValue.trim(),
      isCustom: true
    };

    const newCustom = [...customFacilities, newFacility];
    setCustomFacilities(newCustom);
    setCustomInputValue('');

    if (onChange) {
      onChange([...selectedFacilities, ...newCustom]);
    }
  };

  return (
    <div className="hotel-facilities-selector">
      <div className="facilities-header">
        <h3>房间设施配置</h3>
        <div className="selected-count">
          已选择 {selectedFacilities.length + customFacilities.length} 项设施
        </div>
      </div>

      <div className="facilities-categories">
        {Object.entries(facilitiesData).map(([categoryName, categoryData]) => (
          <div key={categoryName} className="facility-category">
            <div className="category-header">
              <span className="category-icon">{categoryData.icon}</span>
              <h4 className="category-title">{categoryName}</h4>
            </div>
            
            <div className="facility-list">
              {Object.entries(categoryData.items).map(([facilityName, facilityConfig]) => (
                <div key={facilityName} className="facility-item">
                  {!facilityConfig.hasSubtype ? (
                    <label className="facility-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedFacilities.some(f => 
                          f.category === categoryName && f.name === facilityName && !f.subtype
                        )}
                        onChange={() => toggleFacility(categoryName, facilityName)}
                      />
                      <span className="facility-label">{facilityName}</span>
                    </label>
                  ) : (
                    <div className="facility-with-subtypes">
                      <div className="facility-main-name">{facilityName}</div>
                      <div className="subtype-options">
                        {facilityConfig.subtypes.map(subtype => (
                          <label key={subtype} className="subtype-option">
                            <input
                              type="checkbox"
                              checked={selectedFacilities.some(f => 
                                f.category === categoryName && 
                                f.name === facilityName && 
                                f.subtype === subtype
                              )}
                              onChange={() => toggleFacility(categoryName, facilityName, subtype)}
                            />
                            <span className="subtype-label">{subtype}</span>
                          </label>
                        ))}
                        
                        {selectedFacilities
                          .filter(f => f.category === categoryName && f.name === facilityName && f.isCustomSubtype)
                          .map(customFacility => (
                            <label key={customFacility.id} className="subtype-option">
                              <input
                                type="checkbox"
                                checked={true}
                                onChange={() => {
                                  const newSelected = selectedFacilities.filter(f => f.id !== customFacility.id);
                                  setSelectedFacilities(newSelected);
                                  if (onChange) {
                                    onChange([...newSelected, ...customFacilities]);
                                  }
                                }}
                              />
                              <span className="subtype-label">{customFacility.subtype}</span>
                            </label>
                          ))}
                        
                        {showSubtypeCustomInput[`${categoryName}-${facilityName}`] && (
                          <div className="custom-subtype-input">
                            <input
                              type="text"
                              value={customSubtypeValue}
                              onChange={(e) => setCustomSubtypeValue(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addCustomSubtype(categoryName, facilityName)}
                              placeholder="输入自定义选项"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => addCustomSubtype(categoryName, facilityName)}
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowSubtypeCustomInput(prev => ({ 
                                  ...prev, 
                                  [`${categoryName}-${facilityName}`]: false 
                                }));
                                setCustomSubtypeValue('');
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="custom-facility-section">
        <h4>添加完全自定义设施</h4>
        <div className="custom-input-group">
          <input
            type="text"
            value={customInputValue}
            onChange={(e) => setCustomInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomFacility()}
            placeholder="输入自定义设施名称"
          />
          <button type="button" onClick={addCustomFacility}>
            添加
          </button>
        </div>
      </div>

      {(selectedFacilities.length > 0 || customFacilities.length > 0) && (
        <div className="selected-facilities-preview">
          <h4>已选择的设施：</h4>
          <div className="selected-tags">
            {selectedFacilities.map(facility => (
              <span key={facility.id} className="facility-tag">
                {facility.name}
                {facility.subtype && (
                  <span className="subtype-text">
                    ({facility.subtype})
                  </span>
                )}
                <button
                  type="button"
                  className="remove-tag-btn"
                  onClick={() => {
                    const newSelected = selectedFacilities.filter(f => f.id !== facility.id);
                    setSelectedFacilities(newSelected);
                    if (onChange) {
                      onChange([...newSelected, ...customFacilities]);
                    }
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            {customFacilities.map(facility => (
              <span key={facility.id} className="facility-tag">
                {facility.name}
                <button
                  type="button"
                  className="remove-tag-btn"
                  onClick={() => {
                    const newCustom = customFacilities.filter(f => f.id !== facility.id);
                    setCustomFacilities(newCustom);
                    if (onChange) {
                      onChange([...selectedFacilities, ...newCustom]);
                    }
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelFacilitiesSelector;
