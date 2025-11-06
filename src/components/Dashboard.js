import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, message, Progress } from 'antd';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  ShopOutlined,
  HomeOutlined,
  RightOutlined,
  PlusOutlined,
  FileTextOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userAPI, itineraryAPI, healthAPI, attractionAPI, restaurantAPI, hotelAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalItineraries: 0,
    publishedItineraries: 0,
    totalAttractions: 0,
    totalRestaurants: 0,
    totalHotels: 0,
    draftItineraries: 0
  });
  const [recentItineraries, setRecentItineraries] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 检查系统健康状态
      try {
        const healthResponse = await healthAPI.checkHealth();
        setSystemHealth(healthResponse.data || healthResponse);
      } catch (error) {
        console.warn('健康检查失败:', error);
        setSystemHealth({ status: 'unknown' });
      }

      // 获取行程统计
      try {
        const itinerariesResponse = await itineraryAPI.getItineraries({ page: 1, limit: 5 });
        const publishedResponse = await itineraryAPI.getItineraries({ status: 'published', page: 1, limit: 1 });
        const draftResponse = await itineraryAPI.getItineraries({ status: 'draft', page: 1, limit: 1 });

        // API response structure: { success: true, data: [...], pagination: {...} }
        const itinerariesData = itinerariesResponse;
        const publishedData = publishedResponse;
        const draftData = draftResponse;

        setStats(prev => ({
          ...prev,
          totalItineraries: itinerariesData.pagination?.totalItineraries || 0,
          publishedItineraries: publishedData.pagination?.totalItineraries || 0,
          draftItineraries: draftData.pagination?.totalItineraries || 0
        }));

        const itineraryList = itinerariesData.data || [];
        setRecentItineraries(Array.isArray(itineraryList) ? itineraryList : []);
      } catch (error) {
        console.warn('获取行程数据失败:', error);
      }

      // 获取景点统计
      try {
        const attractionsResponse = await attractionAPI.getAttractions({ page: 1, limit: 1 });
        setStats(prev => ({
          ...prev,
          totalAttractions: attractionsResponse.data?.pagination?.totalAttractions || 0
        }));
      } catch (error) {
        console.warn('获取景点数据失败:', error);
      }

      // 获取餐厅统计
      try {
        const restaurantsResponse = await restaurantAPI.getRestaurants({ page: 1, limit: 1 });
        setStats(prev => ({
          ...prev,
          totalRestaurants: restaurantsResponse.data?.pagination?.totalRestaurants || 0
        }));
      } catch (error) {
        console.warn('获取餐厅数据失败:', error);
      }

      // 获取酒店统计
      try {
        const hotelsResponse = await hotelAPI.getHotels({ page: 1, limit: 1 });
        setStats(prev => ({
          ...prev,
          totalHotels: hotelsResponse.data?.pagination?.totalHotels || 0
        }));
      } catch (error) {
        console.warn('获取酒店数据失败:', error);
      }

    } catch (error) {
      console.error('加载仪表板数据失败:', error);
      message.error('加载数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const itineraryColumns = [
    {
      title: '行程名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '价格',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (price) => `¥${price}`,
    },
    {
      title: '人数范围',
      dataIndex: 'people_range',
      key: 'people_range',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'draft': { color: 'default', text: '草稿' },
          'published': { color: 'success', text: '已发布' },
          'archived': { color: 'warning', text: '已归档' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('zh-CN'),
    },
  ];

  const quickActions = [
    {
      title: '行程管理',
      icon: <CompassOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      description: '管理所有旅游行程',
      count: stats.totalItineraries,
      path: '/itineraries',
      color: '#e6f7ff',
      borderColor: '#91d5ff'
    },
    {
      title: '创建行程',
      icon: <PlusOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      description: '创建新的旅游行程',
      path: '/itineraries/create',
      color: '#f6ffed',
      borderColor: '#b7eb8f'
    },
    {
      title: '景点/项目管理',
      icon: <EnvironmentOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      description: '管理景点和项目',
      count: stats.totalAttractions,
      path: '/attractions',
      color: '#f9f0ff',
      borderColor: '#d3adf7'
    },
    {
      title: '餐饮管理',
      icon: <ShopOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      description: '管理餐厅信息',
      count: stats.totalRestaurants,
      path: '/restaurants',
      color: '#fff7e6',
      borderColor: '#ffd591'
    },
    {
      title: '酒店/民宿管理',
      icon: <HomeOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
      description: '管理酒店和民宿',
      count: stats.totalHotels,
      path: '/hotels',
      color: '#fff0f6',
      borderColor: '#ffadd2'
    }
  ];

  const publishRate = stats.totalItineraries > 0 
    ? Math.round((stats.publishedItineraries / stats.totalItineraries) * 100) 
    : 0;

  return (
    <div>
      {/* 快捷入口 */}
      <Card 
        title={<span><RiseOutlined /> 快捷入口</span>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} lg={8} xl={8} key={index}>
              <Card
                hoverable
                style={{ 
                  background: action.color,
                  borderColor: action.borderColor,
                  cursor: 'pointer'
                }}
                onClick={() => navigate(action.path)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>{action.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                      {action.description}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', visibility: action.count !== undefined ? 'visible' : 'hidden' }}>
                      {action.count !== undefined ? `${action.count} 项` : '0 项'}
                    </div>
                  </div>
                  <RightOutlined style={{ fontSize: 20, color: '#999' }} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span><FileTextOutlined /> 最近行程</span>}
            extra={
              <Button type="link" onClick={loadDashboardData}>
                刷新
              </Button>
            }
          >
            <Table
              columns={itineraryColumns}
              dataSource={recentItineraries}
              rowKey="_id"
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: '暂无行程数据' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<span><CheckCircleOutlined /> 系统状态</span>} style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              {systemHealth ? (
                <>
                  <CheckCircleOutlined 
                    style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} 
                  />
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>系统运行正常</div>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                    {new Date().toLocaleString('zh-CN')}
                  </div>
                </>
              ) : (
                <>
                  <ClockCircleOutlined 
                    style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} 
                  />
                  <div>检查系统状态中...</div>
                </>
              )}
            </div>
          </Card>
          
          <Card title={<span><RiseOutlined /> 发布率</span>}>
            <div style={{ textAlign: 'center' }}>
              <Progress 
                type="circle" 
                percent={publishRate} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: 16, color: '#666' }}>
                {stats.publishedItineraries} / {stats.totalItineraries} 行程已发布
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;