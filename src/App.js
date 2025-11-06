import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, theme, Avatar, Dropdown, Space, Typography, Breadcrumb, message, Modal } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  EnvironmentOutlined,
  CompassOutlined,
  PlusOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  ShopOutlined,
  HomeOutlined,
  BookOutlined
} from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ItineraryManagement from './components/ItineraryManagement';
import ItineraryCreator from './components/ItineraryCreator';
import ItineraryEditor from './components/ItineraryEditor';
import AttractionManagement from './components/AttractionManagement';
import RestaurantManagement from './components/RestaurantManagement';
import HotelManagement from './components/HotelManagement';
import Documentation from './components/Documentation';
import MerchantRegister from './components/MerchantRegister';
import MerchantLogin from './components/MerchantLogin';
import MerchantDashboard from './components/MerchantDashboard';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// 导航组件
function AppNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: 'management',
      icon: <EnvironmentOutlined />,
      label: '内容管理',
      children: [
        {
          key: '/itineraries',
          icon: <CompassOutlined />,
          label: '行程管理',
        },
        {
          key: '/itineraries/create',
          icon: <PlusOutlined />,
          label: '创建行程',
        },
        {
          key: '/attractions',
          icon: <EnvironmentOutlined />,
          label: '景点/项目管理',
        },
        {
          key: '/restaurants',
          icon: <ShopOutlined />,
          label: '餐饮管理',
        },
        {
          key: '/hotels',
          icon: <HomeOutlined />,
          label: '酒店/民宿管理',
        },
      ],
    },
    {
      key: '/documentation',
      icon: <BookOutlined />,
      label: '系统文档',
    },
    // {
    //   key: '/users',
    //   icon: <UserOutlined />,
    //   label: '用户管理',
    // },
    // {
    //   key: '/settings',
    //   icon: <SettingOutlined />,
    //   label: '系统设置',
    // },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const getBreadcrumbItems = () => {
    const pathMap = {
      '/': ['仪表板'],
      '/itineraries': ['内容管理', '行程管理'],
      '/itineraries/create': ['内容管理', '行程管理', '创建行程'],
      '/attractions': ['内容管理', '景点/项目管理'],
      '/restaurants': ['内容管理', '餐饮管理'],
      '/hotels': ['内容管理', '酒店/民宿管理'],
      '/documentation': ['系统文档'],
      '/users': ['用户管理'],
      '/settings': ['系统设置'],
    };
    
    // Check for edit route pattern
    if (location.pathname.match(/^\/itineraries\/edit\/[^/]+$/)) {
      return ['内容管理', '行程管理', '编辑行程'];
    }
    
    return pathMap[location.pathname] || ['未知页面'];
  };

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={256}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 64, 
          margin: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: collapsed ? '14px' : '16px'
        }}>
          {collapsed ? '敦煌' : '敦煌APP管理面板'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['management']}
          items={menuItems}
          onClick={({ key }) => {
            if (key !== 'management') {
              navigate(key);
            }
          }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            position: 'fixed',
            top: 0,
            zIndex: 1,
            width: `calc(100% - ${collapsed ? 80 : 256}px)`,
            background: '#fff',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div>
          </div>
          
          <Space size="large">
            <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            <SearchOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    // 处理退出登录
                    message.success('退出登录成功！');
                    // 这里可以添加清除token、跳转到登录页等逻辑
                    console.log('退出登录');
                  }
                }
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content
          style={{
            margin: '88px 24px 24px',
            padding: 0,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Breadcrumb
              items={getBreadcrumbItems().map(item => ({ title: item }))}
            />
          </div>
          
          <div
            style={{
              padding: 24,
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: 'calc(100vh - 160px)',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/itineraries" element={<ItineraryManagement />} />
              <Route path="/itineraries/create" element={<ItineraryCreator />} />
              <Route path="/itineraries/edit/:id" element={<ItineraryEditor />} />
              <Route path="/attractions" element={<AttractionManagement />} />
              <Route path="/restaurants" element={<RestaurantManagement />} />
              <Route path="/hotels" element={<HotelManagement />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </>
  );
}

// 商家路由组件（无导航栏）
function MerchantRoutes() {
  return (
    <Routes>
      <Route path="register" element={<MerchantRegister />} />
      <Route path="login" element={<MerchantLogin />} />
      <Route path="dashboard" element={<MerchantDashboard />} />
      <Route path="*" element={<Navigate to="/merchant/login" replace />} />
    </Routes>
  );
}

function App() {
  const [isMobileModalVisible, setIsMobileModalVisible] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) {
      setIsMobileModalVisible(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* 商家路由 - 独立页面，不显示后台导航 */}
        <Route path="/merchant/*" element={<MerchantRoutes />} />
        
        {/* 管理后台路由 - 包含导航栏 */}
        <Route path="/*" element={<AppNavigation />} />
      </Routes>
      
      <Modal
        title="提示"
        open={isMobileModalVisible}
        onOk={() => setIsMobileModalVisible(false)}
        onCancel={() => setIsMobileModalVisible(false)}
        okText="我知道了"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <p style={{ fontSize: '16px', textAlign: 'center', margin: '20px 0' }}>
          请用电脑访问控制面板
        </p>
      </Modal>
    </Router>
  );
}

export default App;
