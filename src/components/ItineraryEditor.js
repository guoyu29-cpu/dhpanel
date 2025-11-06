import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Row,
  Col,
  Button,
  Typography,
  Tag,
  Avatar,
  Space,
  message,
  Input,
  Form,
  Modal,
  Select,
  InputNumber,
  Divider,
  Upload
} from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  DragOutlined,
  SaveOutlined,
  EyeOutlined,
  ShopOutlined,
  HomeOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  AppstoreOutlined,
  EditOutlined,
  SendOutlined
} from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { attractionAPI, itineraryAPI, uploadAPI, restaurantAPI } from '../services/api';
import './ItineraryCreator.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 可拖拽的景点/项目卡片组件
const DraggableAttractionCard = ({ attraction, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `attraction-${attraction.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`attraction-card ${isDragging ? 'dragging' : ''}`}
    >
      <Card
        size="small"
        hoverable
        style={{ marginBottom: 8 }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DragOutlined style={{ marginRight: 12, color: '#999', fontSize: '16px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 6 }} />
              <Text strong>{attraction.name}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {attraction.location}
            </Text>
            <div style={{ marginTop: 4 }}>
              <Tag size="small" color="blue">{attraction.type}</Tag>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// 可拖拽的路径点卡片组件
const DraggableWaypointCard = ({ waypoint, index, dayId, onRemove, onTimeUpdate, onEdit, isFirst, isLast, totalWaypoints }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: waypoint.id });

  const [editingTime, setEditingTime] = useState(null); // 'arrival' or 'departure'
  const [tempTime, setTempTime] = useState('');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTimeEdit = (timeType) => {
    setEditingTime(timeType);
    const currentTime = waypoint[`${timeType}_time`] || '';
    // 移除冒号，只保留数字
    setTempTime(currentTime.replace(':', ''));
  };

  const formatTimeInput = (value) => {
    // 只保留数字
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2);
      return `${hours}:${minutes}`;
    }
    
    // 限制最多4位数字
    const hours = numbers.slice(0, 2);
    const minutes = numbers.slice(2, 4);
    return `${hours}:${minutes}`;
  };

  const handleTimeInputChange = (e) => {
    const value = e.target.value;
    const formatted = formatTimeInput(value);
    setTempTime(formatted);
  };

  const validateAndFormatTime = (timeStr) => {
    // 如果没有冒号，自动添加
    let formatted = timeStr;
    if (timeStr.length === 4 && !timeStr.includes(':')) {
      formatted = `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
    }
    
    // 验证时间格式
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(formatted)) {
      return formatted;
    }
    
    // 尝试修正常见错误
    const numbers = timeStr.replace(/\D/g, '');
    if (numbers.length >= 3) {
      const hours = Math.min(parseInt(numbers.slice(0, 2)), 23).toString().padStart(2, '0');
      const minutes = Math.min(parseInt(numbers.slice(2, 4) || '0'), 59).toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    return null;
  };

  const handleTimeSave = (e) => {
    e.stopPropagation();
    const validTime = validateAndFormatTime(tempTime);
    if (validTime) {
      onTimeUpdate(dayId, waypoint.id, editingTime, validTime);
      setEditingTime(null);
      setTempTime('');
    } else {
      message.error('请输入正确的时间格式 (如: 0930 或 09:30)');
    }
  };



  // 创建拖拽监听器，但排除时间区域和按钮
  const dragListeners = {
    ...listeners,
    onPointerDown: (e) => {
      // 如果点击的是时间区域或按钮，不触发拖拽
      if (e.target.closest('.time-area') || e.target.closest('.ant-btn')) {
        return;
      }
      listeners.onPointerDown?.(e);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`waypoint-card ${isDragging ? 'dragging' : ''}`}
    >
      <Card
        size="small"
        style={{ marginBottom: 8, border: '1px solid #d9d9d9' }}
        actions={[
          <Button
            type="text"
            size="small"
            danger
            onClick={(e) => {
              e.stopPropagation();
              onRemove(dayId, waypoint.id);
            }}
          >
            删除
          </Button>
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* 左侧时间区域 */}
          <div 
            className="time-area"
            style={{ 
              width: '80px', 
              marginRight: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '60px'
            }}
          >
            {/* 抵达时间 - 除了第一个waypoint */}
            {!isFirst && (
              <div style={{ 
                marginBottom: '4px',
                padding: '2px 4px', 
                backgroundColor: '#f0f8ff', 
                borderRadius: '4px',
                fontSize: '11px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#666', marginBottom: '2px' }}>抵达</div>
                {editingTime === 'arrival' ? (
                  <Input
                     size="small"
                     value={tempTime}
                     onChange={handleTimeInputChange}
                     placeholder="0930"
                     style={{ width: '60px', fontSize: '11px' }}
                     onPressEnter={handleTimeSave}
                     onBlur={handleTimeSave}
                     onClick={(e) => e.stopPropagation()}
                     maxLength={5}
                     autoFocus
                   />
                ) : (
                  <div 
                    style={{ 
                      cursor: 'pointer', 
                      color: '#1890ff',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimeEdit('arrival');
                    }}
                  >
                    {waypoint.arrival_time || '--:--'}
                  </div>
                )}
              </div>
            )}

            {/* 出发时间 - 除了最后一个waypoint */}
            {!isLast && (
              <div style={{ 
                padding: '2px 4px', 
                backgroundColor: '#fff7e6', 
                borderRadius: '4px',
                fontSize: '11px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#666', marginBottom: '2px' }}>出发</div>
                {editingTime === 'departure' ? (
                  <Input
                     size="small"
                     value={tempTime}
                     onChange={handleTimeInputChange}
                     placeholder="0930"
                     style={{ width: '60px', fontSize: '11px' }}
                     onPressEnter={handleTimeSave}
                     onBlur={handleTimeSave}
                     onClick={(e) => e.stopPropagation()}
                     maxLength={5}
                     autoFocus
                   />
                ) : (
                  <div 
                    style={{ 
                      cursor: 'pointer', 
                      color: '#fa8c16',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimeEdit('departure');
                    }}
                  >
                    {waypoint.departure_time || '--:--'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 中间内容区域 */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }} {...dragListeners}>
            <div style={{ 
              marginRight: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1890ff',
              minWidth: '24px',
              textAlign: 'center'
            }}>
              {index + 1}.
            </div>
            <div style={{ flex: 1 }}>
              <Space>
                {waypoint.type === 'restaurant' && <ShopOutlined style={{ color: '#ff7875' }} />}
                {waypoint.type === 'hotel' && <HomeOutlined style={{ color: '#52c41a' }} />}
                {waypoint.type === 'flight' && <SendOutlined style={{ color: '#1890ff' }} />}
                {waypoint.type === 'spot' && !waypoint.ismultiple && <EnvironmentOutlined style={{ color: '#1890ff' }} />}
                {waypoint.type === 'spot' && waypoint.ismultiple && <AppstoreOutlined style={{ color: '#722ed1' }} />}
                <Text strong>{waypoint.name}</Text>
              </Space>
              <br />
              <Tag 
                size="small" 
                color={
                  waypoint.type === 'restaurant' ? 'red' : 
                  waypoint.type === 'hotel' ? 'green' : 
                  waypoint.type === 'flight' ? 'blue' : 
                  waypoint.ismultiple ? 'purple' : 'blue'
                }
              >
                {waypoint.type === 'restaurant' && waypoint.ismultiple ? '多选餐厅' :
                 waypoint.type === 'restaurant' ? '餐饮' : 
                 waypoint.type === 'hotel' ? '住宿' : 
                 waypoint.type === 'flight' ? '航班' : 
                 waypoint.ismultiple ? '多选景点' : '景点'}
              </Tag>
              {waypoint.ismultiple && waypoint.spot_ids && waypoint.spot_ids.length > 0 && (
                <Tag size="small" color={waypoint.type === 'restaurant' ? 'red' : 'purple'}>
                  {waypoint.spot_ids.length}个{waypoint.type === 'restaurant' ? '餐厅' : '景点'}
                </Tag>
              )}
            </div>
            {waypoint.ismultiple && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(dayId, waypoint);
                }}
                style={{ marginRight: '8px' }}
              >
                编辑
              </Button>
            )}
            <DragOutlined style={{ color: '#999', marginLeft: '8px' }} />
          </div>
        </div>
      </Card>
    </div>
  );
};

// 餐饮拖拽卡片
const DraggableDiningCard = () => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: 'dining-item' });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card 
        size="small" 
        style={{ 
          marginBottom: 8, 
          cursor: 'grab',
          border: '1px solid #ff7875',
          backgroundColor: '#fff2f0'
        }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <Space>
          <ShopOutlined style={{ color: '#ff7875' }} />
          <Text strong style={{ color: '#ff7875' }}>餐厅</Text>
          <DragOutlined style={{ color: '#ff7875' }} />
        </Space>
      </Card>
    </div>
  );
};

// 住宿拖拽卡片
const DraggableHotelCard = () => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: 'hotel-item' });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card 
        size="small" 
        style={{ 
          marginBottom: 8, 
          cursor: 'grab',
          border: '1px solid #52c41a',
          backgroundColor: '#f6ffed'
        }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <Space>
          <HomeOutlined style={{ color: '#52c41a' }} />
          <Text strong style={{ color: '#52c41a' }}>住宿</Text>
          <DragOutlined style={{ color: '#52c41a' }} />
        </Space>
      </Card>
    </div>
  );
};

// 多选拖拽卡片
const DraggableMultipleCard = () => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: 'multiple-item' });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card 
        size="small" 
        style={{ 
          marginBottom: 8, 
          cursor: 'grab',
          border: '1px solid #722ed1',
          backgroundColor: '#f9f0ff'
        }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <Space>
          <AppstoreOutlined style={{ color: '#722ed1' }} />
          <Text strong style={{ color: '#722ed1' }}>多选</Text>
          <DragOutlined style={{ color: '#722ed1' }} />
        </Space>
      </Card>
    </div>
  );
};

// 航班拖拽卡片
const DraggableFlightCard = () => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: 'flight-item' });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card 
        size="small" 
        style={{ 
          marginBottom: 8, 
          cursor: 'grab',
          border: '1px solid #1890ff',
          backgroundColor: '#e6f7ff'
        }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <Space>
          <SendOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ color: '#1890ff' }}>航班</Text>
          <DragOutlined style={{ color: '#1890ff' }} />
        </Space>
      </Card>
    </div>
  );
};

// 可放置区域组件
const DroppableArea = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? '#f0f8ff' : 'transparent',
    border: isOver ? '2px dashed #1890ff' : '2px dashed transparent',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    minHeight: '200px',
    padding: '8px'
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

// 精确的插入位置感应区域
const InsertDropZone = ({ id, position, isVisible }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    height: isVisible ? '8px' : '2px',
    backgroundColor: isOver ? '#1890ff' : 'transparent',
    border: isOver ? '2px solid #1890ff' : '1px dashed transparent',
    borderRadius: '4px',
    margin: '2px 0',
    transition: 'all 0.2s ease',
    opacity: isVisible ? (isOver ? 1 : 0.3) : 0,
    transform: isOver ? 'scaleY(2)' : 'scaleY(1)',
  };

  return <div ref={setNodeRef} style={style} />;
};

const ItineraryEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [activeDay, setActiveDay] = useState('1');
  const [days, setDays] = useState([
    { id: '1', name: '第1天', waypoints: [] }
  ]);
  const [attractions, setAttractions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [form] = Form.useForm();
  const [multipleModalVisible, setMultipleModalVisible] = useState(false);
  const [editingMultipleWaypoint, setEditingMultipleWaypoint] = useState(null);
  const [multipleForm] = Form.useForm();
  const [restaurantModalVisible, setRestaurantModalVisible] = useState(false);
  const [editingRestaurantWaypoint, setEditingRestaurantWaypoint] = useState(null);
  const [restaurantForm] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 减少到3px以提高响应性
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 主题标签选项
  const themeTagOptions = [
    '石窟', '壁画', '戈壁', '沙漠', '自然', '冥想', '古迹'
  ];

  // 目标标签选项
  const goalTagOptions = [
    '摄影旅拍', '休闲度假', '探索冒险', '文化学习', '亲子游'
  ];

  useEffect(() => {
    fetchAttractions();
    fetchRestaurants();
    if (id) {
      setIsEditMode(true);
      fetchItinerary();
    }
  }, [id]);

  // 获取行程详情
  const fetchItinerary = async () => {
    setLoadingItinerary(true);
    try {
      const response = await itineraryAPI.getItineraryById(id);
      if (response?.success && response?.data) {
        const itinerary = response.data;
        
        // 设置表单基本信息
        form.setFieldsValue({
          name: itinerary.name,
          description: itinerary.description,
          base_price: itinerary.base_price,
          people_range: itinerary.people_range,
          theme_tags: itinerary.theme_tags || [],
          goal_tags: itinerary.goal_tags || [],
          appeals: itinerary.appeals || [],
          priceSheet: itinerary.priceSheet || [],
          image: itinerary.image
        });
        
        // 设置封面图
        if (itinerary.image) {
          setImageUrl(itinerary.image);
        }
        
        // 转换天数数据为组件状态
        if (itinerary.days && itinerary.days.length > 0) {
          const convertedDays = itinerary.days.map((day, index) => ({
            id: (index + 1).toString(),
            name: `第${index + 1}天`,
            waypoints: (day.waypoints || []).map((wp, wpIndex) => ({
              id: wp.id || `waypoint-${Date.now()}-${wpIndex}`,
              spot_ids: wp.spot_ids || [],
              name: wp.name,
              type: wp.type,
              ismultiple: wp.ismultiple || false,
              arrival_time: wp.arrival_time,
              departure_time: wp.departure_time,
              distance_from_previous_km: wp.distance_from_previous_km,
              travel_time_from_previous_min: wp.travel_time_from_previous_min
            }))
          }));
          setDays(convertedDays);
          setActiveDay('1');
        }
        
        message.success('行程加载成功');
      }
    } catch (error) {
      console.error('Failed to fetch itinerary:', error);
      message.error('加载行程失败');
    } finally {
      setLoadingItinerary(false);
    }
  };

  // 获取景点/项目列表
  const fetchAttractions = async () => {
    setLoading(true);
    try {
      const response = await attractionAPI.getAttractions({ limit: 50 });
      console.log('Attractions API response:', response);
      if (response?.success) {
        // 后端返回的数据结构是 { success: true, data: { attractions: [...], pagination: {...} } }
        const attractionsData = response.data?.attractions || response.data || [];
        setAttractions(Array.isArray(attractionsData) ? attractionsData : []);
      } else {
        console.warn('API response success is false or missing');
        setAttractions([]);
      }
    } catch (error) {
      console.error('Failed to fetch attractions:', error);
      message.error('获取景点/项目列表失败');
      setAttractions([]); // Ensure attractions is always an array
    } finally {
      setLoading(false);
    }
  };

  // 获取餐厅列表
  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const response = await restaurantAPI.getRestaurants({ limit: 50 });
      console.log('Restaurants API response:', response);
      if (response?.success) {
        const restaurantsData = response.data?.restaurants || response.data || [];
        setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
      } else {
        console.warn('API response success is false or missing');
        setRestaurants([]);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      message.error('获取餐厅列表失败');
      setRestaurants([]);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // 添加新的一天
  const addDay = () => {
    const newDayNumber = days.length + 1;
    const newDay = {
      id: newDayNumber.toString(),
      name: `第${newDayNumber}天`,
      waypoints: []
    };
    setDays([...days, newDay]);
    setActiveDay(newDay.id);
  };

  // 删除一天
  const removeDay = (dayId) => {
    if (days.length <= 1) {
      message.warning('至少需要保留一天行程');
      return;
    }
    const newDays = days.filter(day => day.id !== dayId);
    setDays(newDays);
    if (activeDay === dayId) {
      setActiveDay(newDays[0].id);
    }
  };

  // 拖拽开始
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // 拖拽结束处理
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // 从景点/项目列表或其他项目拖拽到行程中
    if ((active.id.startsWith('attraction-') || active.id.startsWith('dining-') || active.id.startsWith('hotel-') || active.id.startsWith('multiple-') || active.id.startsWith('flight-')) && 
        (over.id === `day-${activeDay}` || over.id.startsWith('waypoint-') || over.id.startsWith('insert-'))) {
      
      let newItem;
      
      if (active.id.startsWith('attraction-')) {
        const attractionId = active.id.replace('attraction-', '');
        const attraction = attractions.find(attr => attr.id === attractionId);
        if (!attraction) return;
        
        newItem = {
          id: `waypoint-${Date.now()}`,
          spot_ids: [attraction.id],
          name: attraction.name,
          type: 'spot',
          ismultiple: false,
          arrival_time: null,
          departure_time: null,
          distance_from_previous_km: null,
          travel_time_from_previous_min: null
        };
      } else if (active.id.startsWith('dining-')) {
        newItem = {
          id: `waypoint-${Date.now()}`,
          spot_ids: [],
          name: '多选餐厅',
          type: 'restaurant',
          ismultiple: true,
          arrival_time: null,
          departure_time: null,
          distance_from_previous_km: null,
          travel_time_from_previous_min: null
        };
      } else if (active.id.startsWith('hotel-')) {
        newItem = {
          id: `waypoint-${Date.now()}`,
          spot_ids: [],
          name: '住宿安排',
          type: 'hotel',
          ismultiple: false,
          arrival_time: null,
          departure_time: null,
          distance_from_previous_km: null,
          travel_time_from_previous_min: null
        };
      } else if (active.id.startsWith('multiple-')) {
        newItem = {
          id: `waypoint-${Date.now()}`,
          spot_ids: [],
          name: '多选景点',
          type: 'spot',
          ismultiple: true,
          arrival_time: null,
          departure_time: null,
          distance_from_previous_km: null,
          travel_time_from_previous_min: null
        };
      } else if (active.id.startsWith('flight-')) {
        newItem = {
          id: `waypoint-${Date.now()}`,
          spot_ids: [],
          name: '航班',
          type: 'flight',
          ismultiple: false,
          arrival_time: null,
          departure_time: null,
          distance_from_previous_km: null,
          travel_time_from_previous_min: null
        };
      }

      const currentDay = days.find(d => d.id === activeDay);
      if (!currentDay) return;

      let insertIndex = currentDay.waypoints.length; // 默认添加到末尾
      
      // 如果拖拽到精确插入区域
      if (over.id.startsWith('insert-')) {
        const parts = over.id.split('-');
        if (parts.length >= 3) {
          insertIndex = parseInt(parts[2], 10);
        }
      }
      // 如果拖拽到特定waypoint上，插入到该waypoint之前
      else if (over.id.startsWith('waypoint-')) {
        insertIndex = currentDay.waypoints.findIndex(wp => wp.id === over.id);
        if (insertIndex === -1) insertIndex = currentDay.waypoints.length;
      }

      const newWaypoints = [...currentDay.waypoints];
      newWaypoints.splice(insertIndex, 0, newItem);

      setDays(prevDays => 
        prevDays.map(day => 
          day.id === activeDay 
            ? { ...day, waypoints: newWaypoints }
            : day
        )
      );
      message.success(`已添加 ${newItem.name} 到 ${currentDay.name} 的位置 ${insertIndex + 1}`);
      
      // 如果是多选项，自动打开编辑模态框
      if (newItem.ismultiple) {
        setTimeout(() => {
          if (newItem.type === 'restaurant') {
            handleEditRestaurant(activeDay, newItem);
          } else {
            handleEditMultiple(activeDay, newItem);
          }
        }, 100);
      }
    }

    // 在行程内重新排序 - 支持精确插入位置
    if (active.id !== over.id && active.id.startsWith('waypoint-')) {
      const currentDay = days.find(d => d.id === activeDay);
      if (!currentDay) return;

      const oldIndex = currentDay.waypoints.findIndex(wp => wp.id === active.id);
      if (oldIndex === -1) return;

      let newIndex = currentDay.waypoints.length - 1;

      // 拖拽到精确插入区域
      if (over.id.startsWith('insert-')) {
        const parts = over.id.split('-');
        if (parts.length >= 3) {
          newIndex = parseInt(parts[2], 10);
          // 如果新位置在原位置之后，需要调整索引
          if (newIndex > oldIndex) {
            newIndex = newIndex - 1;
          }
        }
      }
      // 拖拽到其他waypoint上
      else if (over.id.startsWith('waypoint-')) {
        newIndex = currentDay.waypoints.findIndex(wp => wp.id === over.id);
        if (newIndex === -1) return;
      }

      if (oldIndex !== newIndex) {
        const newWaypoints = arrayMove(currentDay.waypoints, oldIndex, newIndex);
        setDays(prevDays =>
          prevDays.map(d =>
            d.id === activeDay ? { ...d, waypoints: newWaypoints } : d
          )
        );
        message.success(`已移动到位置 ${newIndex + 1}`);
      }
    }
  };

  // 删除路径点
  const removeWaypoint = (dayId, waypointId) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? { ...day, waypoints: day.waypoints.filter(wp => wp.id !== waypointId) }
          : day
      )
    );
    message.success('景点/项目已从行程中移除！');
  };

  // 更新路径点时间
  const updateWaypointTime = (dayId, waypointId, timeType, timeValue) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? {
              ...day,
              waypoints: day.waypoints.map(wp =>
                wp.id === waypointId
                  ? { ...wp, [`${timeType}_time`]: timeValue }
                  : wp
              )
            }
          : day
      )
    );
    message.success(`${timeType === 'arrival' ? '抵达' : '出发'}时间更新成功！`);
  };

  // 打开编辑多选景点/项目的模态框
  const handleEditMultiple = (dayId, waypoint) => {
    setEditingMultipleWaypoint({ dayId, waypoint });
    multipleForm.setFieldsValue({
      name: waypoint.name,
      spot_ids: waypoint.spot_ids || []
    });
    setMultipleModalVisible(true);
  };

  // 保存多选景点/项目编辑
  const handleSaveMultiple = async () => {
    try {
      const values = await multipleForm.validateFields();
      const { dayId, waypoint } = editingMultipleWaypoint;
      
      setDays(prevDays =>
        prevDays.map(day =>
          day.id === dayId
            ? {
                ...day,
                waypoints: day.waypoints.map(wp =>
                  wp.id === waypoint.id
                    ? { 
                        ...wp, 
                        name: values.name,
                        spot_ids: values.spot_ids 
                      }
                    : wp
                )
              }
            : day
        )
      );
      
      message.success('多选景点/项目更新成功！');
      setMultipleModalVisible(false);
      setEditingMultipleWaypoint(null);
      multipleForm.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 打开编辑多选餐厅的模态框
  const handleEditRestaurant = (dayId, waypoint) => {
    setEditingRestaurantWaypoint({ dayId, waypoint });
    restaurantForm.setFieldsValue({
      name: waypoint.name,
      spot_ids: waypoint.spot_ids || []
    });
    setRestaurantModalVisible(true);
  };

  // 保存餐厅编辑
  const handleSaveRestaurant = async () => {
    try {
      const values = await restaurantForm.validateFields();
      const { dayId, waypoint } = editingRestaurantWaypoint;
      
      setDays(prevDays =>
        prevDays.map(day =>
          day.id === dayId
            ? {
                ...day,
                waypoints: day.waypoints.map(wp =>
                  wp.id === waypoint.id
                    ? { 
                        ...wp, 
                        name: values.name,
                        spot_ids: values.spot_ids 
                      }
                    : wp
                )
              }
            : day
        )
      );
      
      message.success('多选餐厅更新成功！');
      setRestaurantModalVisible(false);
      setEditingRestaurantWaypoint(null);
      restaurantForm.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      // 获取上传后的URL
      const response = info.file.response;
      if (response?.success && response?.data?.url) {
        const fullUrl = `https://dhapp.rgm.games${response.data.url}`;
        setImageUrl(fullUrl);
        form.setFieldsValue({ image: fullUrl });
        message.success('图片上传成功！');
      }
      setUploading(false);
    } else if (info.file.status === 'error') {
      message.error('图片上传失败！');
      setUploading(false);
    }
  };

  // 自定义上传请求
  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    try {
      const response = await uploadAPI.uploadItineraryImage(file);
      onSuccess(response, file);
    } catch (error) {
      onError(error);
      message.error('上传失败：' + (error.message || '未知错误'));
    }
  };

  // 上传前的验证
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
    return true;
  };

  // 保存行程
  const saveItinerary = async (values) => {
    try {
      const itineraryData = {
        ...values,
        days: days.map((day, index) => ({
          day: index + 1,
          waypoints: day.waypoints
        })),
        appeals: values.appeals || [],
        priceSheet: values.priceSheet || []
      };

      let response;
      if (isEditMode) {
        response = await itineraryAPI.updateItinerary(id, itineraryData);
        if (response?.success) {
          message.success('行程更新成功！');
          navigate('/itineraries');
        }
      } else {
        response = await itineraryAPI.createItinerary(itineraryData);
        if (response?.success) {
          message.success('行程创建成功！');
          navigate('/itineraries');
        }
      }
    } catch (error) {
      message.error((isEditMode ? '更新' : '保存') + '失败：' + (error.message || '未知错误'));
    }
  };

  const currentDay = days.find(day => day.id === activeDay);

  return (
    <div className="itinerary-creator">
      <Form
        form={form}
        layout="vertical"
        onFinish={saveItinerary}
      >
        {/* 行程基本信息表单 */}
        <Card style={{ marginBottom: 16 }} loading={loadingItinerary}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={3}>{isEditMode ? '编辑行程' : '创建行程'}</Title>
            <Button onClick={() => navigate('/itineraries')}>返回列表</Button>
          </div>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="行程名称"
                rules={[{ required: true, message: '请输入行程名称' }]}
              >
                <Input placeholder="请输入行程名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="people_range"
                label="人数范围"
                rules={[{ required: true, message: '请输入人数范围' }]}
              >
                <Input placeholder="例如：2-6人" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={18}>
              <Form.Item
                name="description"
                label="行程描述"
                rules={[{ required: true, message: '请输入行程描述' }]}
              >
                <Input.TextArea rows={4} placeholder="请输入行程描述" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="image" label="行程封面图">
                <Upload
                  name="image"
                  listType="picture-card"
                  showUploadList={false}
                  customRequest={customUploadRequest}
                  beforeUpload={beforeUpload}
                  onChange={handleImageUpload}
                  style={{ width: '100%' }}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="行程封面" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8, fontSize: '12px' }}>上传封面</div>
                    </div>
                  )}
                </Upload>
                {uploading && <div style={{ fontSize: '12px', color: '#1890ff', marginTop: 4 }}>上传中...</div>}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="base_price"
                label="基础价格"
                rules={[{ required: true, message: '请输入基础价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入基础价格"
                  min={0}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="theme_tags"
                label="主题标签"
              >
                <Select
                  mode="multiple"
                  placeholder="选择主题标签"
                  options={themeTagOptions.map(tag => ({ label: tag, value: tag }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="goal_tags"
                label="目标标签"
              >
                <Select
                  mode="multiple"
                  placeholder="选择目标标签"
                  options={goalTagOptions.map(tag => ({ label: tag, value: tag }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 行程亮点 */}
          <Form.Item label="行程亮点">
            <Form.List name="appeals">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        rules={[{ required: true, message: '请输入描述' }]}
                      >
                        <Input placeholder="亮点描述" style={{ width: 500 }} />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                      添加亮点
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          {/* 价格明细 */}
          <Form.Item label="价格明细">
            <Form.List name="priceSheet">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '请输入项目名称' }]}
                      >
                        <Input placeholder="项目名称" style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'price']}
                        rules={[{ required: true, message: '请输入价格' }]}
                      >
                        <InputNumber placeholder="价格" style={{ width: 150 }} min={0} />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                      添加价格项目
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<EyeOutlined />}>预览</Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                htmlType="submit"
                size="large"
              >
                {isEditMode ? '更新行程' : '保存行程'}
              </Button>
            </Space>
          </div>
        </Card>

        {/* 天数选项卡 */}
        <Tabs
          activeKey={activeDay}
          onChange={setActiveDay}
          type="editable-card"
          onEdit={(targetKey, action) => {
            if (action === 'add') {
              addDay();
            } else {
              removeDay(targetKey);
            }
          }}
          style={{ marginBottom: 16 }}
        >
          {days.map(day => (
            <TabPane tab={day.name} key={day.id}>
              <Text type="secondary">
                当前行程包含 {day.waypoints.length} 个地点
              </Text>
            </TabPane>
          ))}
        </Tabs>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Row gutter={16} style={{ height: 'calc(100vh - 200px)' }}>
          {/* 左侧：行程序列 */}
          <Col span={12}>
            <Card
              title={`${currentDay?.name} - 行程安排`}
              style={{ height: '100%' }}
              bodyStyle={{ height: 'calc(100% - 57px)', overflowY: 'auto', padding: '16px' }}
            >
              <DroppableArea id={`day-${activeDay}`}>
                <div className="itinerary-timeline">
                  {currentDay?.waypoints.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#999', 
                      padding: '40px 0'
                    }}>
                      <EnvironmentOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <br />
                      将右侧景点/项目拖拽到这里开始规划行程
                    </div>
                  ) : (
                    <SortableContext 
                      items={currentDay.waypoints.map(wp => wp.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {/* 第一个插入区域 - 在所有waypoint之前 */}
                      <InsertDropZone 
                        id={`insert-${activeDay}-0`} 
                        position={0}
                        isVisible={!!activeId}
                      />
                      
                      {currentDay.waypoints.map((waypoint, index) => (
                        <React.Fragment key={waypoint.id}>
                          <DraggableWaypointCard
                            waypoint={waypoint}
                            index={index}
                            dayId={activeDay}
                            onRemove={removeWaypoint}
                            onTimeUpdate={updateWaypointTime}
                            onEdit={(dayId, waypoint) => {
                              if (waypoint.type === 'restaurant' && waypoint.ismultiple) {
                                handleEditRestaurant(dayId, waypoint);
                              } else {
                                handleEditMultiple(dayId, waypoint);
                              }
                            }}
                            isFirst={index === 0}
                            isLast={index === currentDay.waypoints.length - 1}
                            totalWaypoints={currentDay.waypoints.length}
                          />
                          {/* 在每个waypoint之后添加插入区域 */}
                          <InsertDropZone 
                            id={`insert-${activeDay}-${index + 1}`} 
                            position={index + 1}
                            isVisible={!!activeId}
                          />
                        </React.Fragment>
                      ))}
                    </SortableContext>
                  )}
                </div>
              </DroppableArea>
            </Card>
          </Col>

          {/* 右侧：景点/项目列表 */}
          <Col span={12}>
            <Card
              title="景点/项目库"
              extra={
                <Button size="small" onClick={fetchAttractions} loading={loading}>
                  刷新
                </Button>
              }
              style={{ height: '100%' }}
              bodyStyle={{ height: 'calc(100% - 57px)', overflowY: 'auto', padding: '16px' }}
            >
              {/* 餐饮和住宿拖拽项 */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                  行程元素
                </Text>
                <SortableContext 
                  items={['dining-item', 'hotel-item', 'multiple-item', 'flight-item']}
                  strategy={verticalListSortingStrategy}
                >
                  <DraggableDiningCard />
                  <DraggableHotelCard />
                  <DraggableMultipleCard />
                  <DraggableFlightCard />
                </SortableContext>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              {/* 景点/项目列表 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                  景点/项目列表
                </Text>
                <SortableContext 
                  items={Array.isArray(attractions) ? attractions.map(attr => `attraction-${attr.id}`) : []}
                  strategy={verticalListSortingStrategy}
                >
                  {Array.isArray(attractions) ? attractions.map((attraction, index) => (
                    <DraggableAttractionCard
                      key={`attraction-${attraction.id}`}
                      attraction={attraction}
                      index={index}
                    />
                  )) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      {loading ? '加载中...' : '暂无景点/项目数据'}
                    </div>
                  )}
                </SortableContext>
              </div>
            </Card>
          </Col>
        </Row>

        <DragOverlay 
          style={{ 
            cursor: 'grabbing',
            zIndex: 1000
          }}
          dropAnimation={null}
        >
          {activeId ? (
            <div style={{ 
              opacity: 0.9,
              transform: 'rotate(2deg)', // 轻微旋转增加拖拽感
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              pointerEvents: 'none', // 防止拖拽时的鼠标事件干扰
              transformOrigin: 'top left' // 设置变换原点为左上角
            }}>
              {activeId.startsWith('attraction-') ? (
                (() => {
                  const attractionId = activeId.replace('attraction-', '');
                  const attraction = attractions.find(attr => attr.id === attractionId);
                  return (
                    <Card 
                      size="small" 
                      style={{ 
                        width: 220,
                        border: '2px solid #1890ff',
                        backgroundColor: '#f0f8ff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        <div>
                          <Text strong style={{ color: '#1890ff' }}>
                            {attraction?.name || '景点/项目'}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            拖拽到行程中
                          </Text>
                        </div>
                      </div>
                    </Card>
                  );
                })()
              ) : activeId === 'dining-item' ? (
                <Card 
                  size="small" 
                  style={{ 
                    width: 220, 
                    border: '2px solid #ff7875', 
                    backgroundColor: '#fff2f0' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ShopOutlined style={{ color: '#ff7875', marginRight: 8 }} />
                    <div>
                      <Text strong style={{ color: '#ff7875' }}>多选餐厅</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        拖拽到行程中
                      </Text>
                    </div>
                  </div>
                </Card>
              ) : activeId === 'hotel-item' ? (
                <Card 
                  size="small" 
                  style={{ 
                    width: 220, 
                    border: '2px solid #52c41a', 
                    backgroundColor: '#f6ffed' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <HomeOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    <div>
                      <Text strong style={{ color: '#52c41a' }}>住宿安排</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        拖拽到行程中
                      </Text>
                    </div>
                  </div>
                </Card>
              ) : activeId === 'multiple-item' ? (
                <Card 
                  size="small" 
                  style={{ 
                    width: 220, 
                    border: '2px solid #722ed1', 
                    backgroundColor: '#f9f0ff' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AppstoreOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                    <div>
                      <Text strong style={{ color: '#722ed1' }}>多选景点/项目</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        拖拽到行程中
                      </Text>
                    </div>
                  </div>
                </Card>
              ) : activeId === 'flight-item' ? (
                <Card 
                  size="small" 
                  style={{ 
                    width: 220, 
                    border: '2px solid #1890ff', 
                    backgroundColor: '#e6f7ff' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SendOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    <div>
                      <Text strong style={{ color: '#1890ff' }}>航班</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        拖拽到行程中
                      </Text>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card size="small" style={{ width: 220 }}>
                  <Text>移动中...</Text>
                </Card>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 多选景点/项目编辑模态框 */}
      <Modal
        title="编辑多选景点/项目"
        open={multipleModalVisible}
        onOk={handleSaveMultiple}
        onCancel={() => {
          setMultipleModalVisible(false);
          setEditingMultipleWaypoint(null);
          multipleForm.resetFields();
        }}
        width={600}
      >
        <Form
          form={multipleForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="例如：多个景点/项目可选" />
          </Form.Item>
          <Form.Item
            name="spot_ids"
            label="选择景点/项目"
            rules={[{ required: true, message: '请至少选择一个景点/项目' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择多个景点/项目"
              style={{ width: '100%' }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={attractions.map(attr => ({
                label: attr.name,
                value: attr.id
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 餐厅编辑模态框 */}
      <Modal
        title="编辑餐厅"
        open={restaurantModalVisible}
        onOk={handleSaveRestaurant}
        onCancel={() => {
          setRestaurantModalVisible(false);
          setEditingRestaurantWaypoint(null);
          restaurantForm.resetFields();
        }}
        width={600}
      >
        <Form
          form={restaurantForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="例如：多个餐厅可选" />
          </Form.Item>
          <Form.Item
            name="spot_ids"
            label="选择餐厅"
            rules={[{ required: true, message: '请至少选择一个餐厅' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择多个餐厅"
              style={{ width: '100%' }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={restaurants.map(restaurant => ({
                label: restaurant.name,
                value: restaurant.id
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      </Form>
    </div>
  );
};

export default ItineraryEditor;