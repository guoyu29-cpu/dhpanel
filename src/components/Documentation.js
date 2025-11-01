import React, { useState } from 'react';
import { Card, Collapse, Typography, Tag, Space, Divider, Table, Alert, Tabs, Button, message, Steps, List } from 'antd';
import { 
  BookOutlined, 
  ApiOutlined, 
  DatabaseOutlined,
  FileTextOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const Documentation = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    message.success('已复制到剪贴板');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'javascript', copyKey }) => (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <pre style={{ 
        background: '#f6f8fa', 
        padding: '16px', 
        borderRadius: '6px',
        overflow: 'auto',
        border: '1px solid #e1e4e8'
      }}>
        <code style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '13px' }}>
          {code}
        </code>
      </pre>
      <Button
        size="small"
        icon={copiedCode === copyKey ? <CheckCircleOutlined /> : <CopyOutlined />}
        onClick={() => copyToClipboard(code, copyKey)}
        style={{ position: 'absolute', top: 8, right: 8 }}
      >
        {copiedCode === copyKey ? '已复制' : '复制'}
      </Button>
    </div>
  );

  // API Endpoints Documentation
  const apiEndpoints = [
    {
      category: '行程管理',
      endpoints: [
        {
          method: 'GET',
          path: '/api/itineraries',
          description: '获取所有行程列表',
          params: 'page, limit, status',
          response: '{ success: true, data: [...], pagination: {...} }'
        },
        {
          method: 'GET',
          path: '/api/itineraries/:id',
          description: '获取单个行程详情',
          params: 'id (路径参数)',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'POST',
          path: '/api/itineraries',
          description: '创建新行程',
          params: 'title, description, days, status, etc.',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'PUT',
          path: '/api/itineraries/:id',
          description: '更新行程',
          params: 'id (路径参数) + 更新字段',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'DELETE',
          path: '/api/itineraries/:id',
          description: '删除行程',
          params: 'id (路径参数)',
          response: '{ success: true, message: "..." }'
        }
      ]
    },
    {
      category: '景点管理',
      endpoints: [
        {
          method: 'GET',
          path: '/api/attractions',
          description: '获取所有景点列表',
          params: 'page, limit, category',
          response: '{ success: true, data: [...], pagination: {...} }'
        },
        {
          method: 'POST',
          path: '/api/attractions',
          description: '创建新景点',
          params: 'name, description, category, location, etc.',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'PUT',
          path: '/api/attractions/:id',
          description: '更新景点',
          params: 'id (路径参数) + 更新字段',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'DELETE',
          path: '/api/attractions/:id',
          description: '删除景点',
          params: 'id (路径参数)',
          response: '{ success: true, message: "..." }'
        }
      ]
    },
    {
      category: '餐饮管理',
      endpoints: [
        {
          method: 'GET',
          path: '/api/restaurants',
          description: '获取所有餐厅列表',
          params: 'page, limit',
          response: '{ success: true, data: [...], pagination: {...} }'
        },
        {
          method: 'POST',
          path: '/api/restaurants',
          description: '创建新餐厅',
          params: 'name, cuisine, location, etc.',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'PUT',
          path: '/api/restaurants/:id',
          description: '更新餐厅',
          params: 'id (路径参数) + 更新字段',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'DELETE',
          path: '/api/restaurants/:id',
          description: '删除餐厅',
          params: 'id (路径参数)',
          response: '{ success: true, message: "..." }'
        }
      ]
    },
    {
      category: '酒店管理',
      endpoints: [
        {
          method: 'GET',
          path: '/api/hotels',
          description: '获取所有酒店列表',
          params: 'page, limit',
          response: '{ success: true, data: [...], pagination: {...} }'
        },
        {
          method: 'POST',
          path: '/api/hotels',
          description: '创建新酒店',
          params: 'name, type, location, etc.',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'PUT',
          path: '/api/hotels/:id',
          description: '更新酒店',
          params: 'id (路径参数) + 更新字段',
          response: '{ success: true, data: {...} }'
        },
        {
          method: 'DELETE',
          path: '/api/hotels/:id',
          description: '删除酒店',
          params: 'id (路径参数)',
          response: '{ success: true, message: "..." }'
        }
      ]
    }
  ];

  const apiColumns = [
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
      render: (method) => {
        const colors = {
          GET: 'blue',
          POST: 'green',
          PUT: 'orange',
          DELETE: 'red'
        };
        return <Tag color={colors[method]}>{method}</Tag>;
      }
    },
    {
      title: 'API 路径',
      dataIndex: 'path',
      key: 'path',
      render: (path) => <Text code>{path}</Text>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '参数',
      dataIndex: 'params',
      key: 'params',
      render: (params) => <Text type="secondary" style={{ fontSize: '12px' }}>{params}</Text>
    }
  ];

  const quickStartGuide = `// 1. 安装依赖
npm install

// 2. 启动开发服务器
npm start

// 3. 构建生产版本
npm run build

// 4. 运行测试
npm test`;

  const apiUsageExample = `import { itineraryAPI } from '../services/api';

// 获取行程列表
const getItineraries = async () => {
  try {
    const response = await itineraryAPI.getItineraries({
      page: 1,
      limit: 10,
      status: 'published'
    });
    console.log(response.data);
  } catch (error) {
    console.error('获取失败:', error);
  }
};

// 创建新行程
const createItinerary = async () => {
  try {
    const newItinerary = {
      title: '敦煌三日游',
      description: '探索敦煌的历史文化',
      days: 3,
      status: 'draft'
    };
    const response = await itineraryAPI.createItinerary(newItinerary);
    console.log('创建成功:', response.data);
  } catch (error) {
    console.error('创建失败:', error);
  }
};`;

  const componentExample = `import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message } from 'antd';
import { itineraryAPI } from '../services/api';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await itineraryAPI.getItineraries();
      setData(response.data);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="我的组件">
      <Table 
        dataSource={data} 
        loading={loading}
        rowKey="_id"
      />
    </Card>
  );
};

export default MyComponent;`;

  const tabItems = [
    {
      key: 'guide',
      label: <span><FileTextOutlined /> 操作指南</span>,
      children: (
        <div>
          <Alert
            message="内容管理操作指南"
            description="详细说明如何创建和管理行程、景点、餐厅和酒店信息"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Collapse defaultActiveKey={['itinerary']} style={{ marginBottom: 24 }}>
          {/* 行程管理 */}
          <Panel 
            header={<span><EnvironmentOutlined style={{ marginRight: 8 }} />行程管理</span>}
            key="itinerary"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 基础信息 */}
              <div>
                <Title level={4}>基础信息</Title>
                <List
                  dataSource={[
                    { label: '行程名称', desc: '该行程线路的名称', required: true },
                    { label: '人数范围', desc: '示例: 2-6人', required: true },
                    { label: '行程描述', desc: '该行程线路的描述', required: true },
                    { label: '行程封面图', desc: '要求：横屏，5MB以内', icon: <PictureOutlined />, required: true },
                    { label: '基础价格', desc: '用作内部查看的线路执行成本价。不包括住宿费用，不包括可能被可选项改变成本的费用', icon: <DollarOutlined />, required: true }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" style={{ width: '100%' }} size={2}>
                        <Space>
                          {item.icon}
                          <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                          {item.required && <Tag color="red">必填</Tag>}
                        </Space>
                        <Text style={{ paddingLeft: item.icon ? 24 : 0, fontSize: 14 }}>
                          {item.desc}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <Divider />

              {/* 标签系统 */}
              <div>
                <Title level={4}>标签系统</Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: 15 }}>主题标签（多选）</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 12 }}>用于分类行程主题</Paragraph>
                    <Space wrap>
                      <Tag color="blue">石窟</Tag>
                      <Tag color="green">壁画</Tag>
                      <Tag color="orange">戈壁</Tag>
                      <Tag color="gold">沙漠</Tag>
                      <Tag color="cyan">自然</Tag>
                      <Tag color="purple">冥想</Tag>
                      <Tag color="magenta">古迹</Tag>
                    </Space>
                    <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                      注：选项仍需要调整
                    </Paragraph>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: 15 }}>目标标签（多选）</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 12 }}>用于定位目标用户群体</Paragraph>
                    <Space wrap>
                      <Tag color="blue">摄影旅拍</Tag>
                      <Tag color="green">休闲度假</Tag>
                      <Tag color="orange">探索冒险</Tag>
                      <Tag color="purple">文化学习</Tag>
                      <Tag color="magenta">亲子游</Tag>
                    </Space>
                    <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                      注：选项仍需要调整
                    </Paragraph>
                  </div>
                </Space>
              </div>

              <Divider />

              {/* 行程亮点 */}
              <div>
                <Title level={4}>行程亮点</Title>
                <Paragraph style={{ fontSize: 14 }}>
                  <StarOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  可添加多条，描述线路吸引点。行程亮点是吸引用户的关键，建议添加3-5个核心亮点。
                </Paragraph>
              </div>

              <Divider />

              {/* 价格明细 */}
              <div>
                <Title level={4}>价格明细</Title>
                <Paragraph style={{ fontSize: 14 }}>
                  <DollarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  该项为向用户显示的线路报价单
                </Paragraph>
                <Alert
                  message="重要说明"
                  description="行程中景点/项目等内容的报价单会自动加入总报价单，此处只列举除此以外的额外内容"
                  type="warning"
                  showIcon
                />
              </div>

              <Divider />

              {/* 行程路线编辑器 */}
              <div>
                <Title level={4}>行程路线编辑器</Title>
                <Paragraph style={{ fontSize: 14, marginBottom: 16 }}>右侧有景点/项目列表和行程元素列表</Paragraph>

                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 15 }}>可用行程元素</Text>
                  <List
                    style={{ marginTop: 12 }}
                    dataSource={[
                      { name: '景点/项目', desc: '从右侧列表选择已创建的景点或项目' },
                      { name: '餐厅', desc: '可指定或多选餐厅可选项' },
                      { name: '住宿', desc: '非指定住宿地点（等待用户明确），建议在每天行程开始与结束时使用' },
                      { name: '多选', desc: '当一个时间段需要用户从多个选项中选择时使用' },
                      { name: '航班', desc: '用来占位抵达和离开' }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Space direction="vertical" size={2}>
                          <Text strong style={{ fontSize: 14 }}>{item.name}</Text>
                          <Text style={{ fontSize: 14 }}>{item.desc}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>

                <div>
                  <Text strong style={{ fontSize: 15 }}>操作步骤</Text>
                  <List
                    style={{ marginTop: 12 }}
                    dataSource={[
                      { title: '增加天数', desc: '在页面标签页顶端可以增加天数' },
                      { title: '拖拽添加', desc: '将右侧卡片拖拽至左边，添加到行程中' },
                      { title: '调整顺序', desc: '拖拽卡片调整在行程中的顺序' },
                      { title: '设置时间', desc: '出发和抵达时间点以24小时制纯数字填写（例：0930）' }
                    ]}
                    renderItem={(item, index) => (
                      <List.Item>
                        <Space>
                          <Tag color="blue">{index + 1}</Tag>
                          <Space direction="vertical" size={2}>
                            <Text strong style={{ fontSize: 14 }}>{item.title}</Text>
                            <Text style={{ fontSize: 14 }}>{item.desc}</Text>
                          </Space>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            </Space>
          </Panel>

          {/* 景点/项目管理 */}
          <Panel 
            header={<span><EnvironmentOutlined style={{ marginRight: 8 }} />景点/项目管理</span>}
            key="attraction"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 基础信息 */}
              <div>
                <Title level={4}>基础信息</Title>
                <List
                  dataSource={[
                    { label: '景点/项目名称', desc: '名称', required: true },
                    { label: '类型', desc: '选择为景点还是项目', required: true },
                    { label: '景点/项目描述', desc: '详细描述', required: true },
                    { label: '景点/项目图片', desc: '要求横屏，每张最多5MB，最多十张', icon: <PictureOutlined />, required: true }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" style={{ width: '100%' }} size={2}>
                        <Space>
                          {item.icon}
                          <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                          {item.required && <Tag color="red">必填</Tag>}
                        </Space>
                        <Text style={{ paddingLeft: item.icon ? 24 : 0, fontSize: 14 }}>
                          {item.desc}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <Divider />

              {/* 子类型 */}
              <div>
                <Title level={4}>子类型</Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: 15 }}>景点类型</Text>
                    <div style={{ marginTop: 12 }}>
                      <Space wrap>
                        <Tag color="blue">文保景点</Tag>
                        <Tag color="green">名胜景点</Tag>
                        <Tag color="orange">热门景点</Tag>
                      </Space>
                    </div>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: 15 }}>项目类型</Text>
                    <div style={{ marginTop: 12 }}>
                      <Space wrap>
                        <Tag color="purple">休闲地点</Tag>
                        <Tag color="magenta">项目化行程</Tag>
                        <Tag color="cyan">体验化行程</Tag>
                        <Tag color="gold">打卡类行程</Tag>
                        <Tag color="red">文化体验</Tag>
                        <Tag color="volcano">文化实践</Tag>
                      </Space>
                      <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                        注：选项仍需要调整
                      </Paragraph>
                    </div>
                  </div>
                </Space>
              </div>

              <Divider />

              {/* 票务信息 */}
              <div>
                <Title level={4}>票务信息</Title>
                <List
                  dataSource={[
                    { label: '是否需要购票', desc: '选择是否需要购票' },
                    { label: '普通票价格', desc: '普通票价格（元）', icon: <DollarOutlined /> },
                    { label: '优惠票价格', desc: '优惠票价格（元）', icon: <DollarOutlined /> }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" size={2}>
                        <Space>
                          {item.icon}
                          <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                        </Space>
                        <Text style={{ paddingLeft: item.icon ? 24 : 0, fontSize: 14 }}>{item.desc}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <Divider />

              {/* 附加信息 */}
              <div>
                <Title level={4}>附加信息（可选）</Title>
                <List
                  dataSource={[
                    { label: '朝代跨度', desc: '如汉代，或汉代-宋代' },
                    { label: '交通信息', desc: '填写交通方式和路线' }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" size={2}>
                        <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                        <Text style={{ fontSize: 14 }}>{item.desc}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <Divider />

              {/* 评分系统 */}
              <div>
                <Title level={4}>评分系统</Title>
                <Paragraph style={{ fontSize: 14, marginBottom: 16 }}>
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                  所有评分范围为 0-5 分
                </Paragraph>
                <List
                  dataSource={[
                    { label: '开发程度 (0-5)', desc: '景点的开发和设施完善程度' },
                    { label: '内容丰富度 (0-5)', desc: '景点内容的丰富性和多样性' },
                    { label: '游客密度 (0-5)', desc: '景点的拥挤程度' },
                    { label: '体力需求 (0-5)', desc: '游览所需的体力消耗程度' }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" size={2}>
                        <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                        <Text style={{ fontSize: 14 }}>{item.desc}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <Divider />

              {/* 价格信息 */}
              <div>
                <Title level={4}>价格信息</Title>
                <List
                  dataSource={[
                    { label: '报价单', desc: '向用户展示的报价，会自动加入最终行程报价单', icon: <DollarOutlined /> },
                    { label: '实际成本', desc: '如果本景点/项目需要经由我们购买，在此处填写实际成本（元）', icon: <DollarOutlined /> }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" style={{ width: '100%' }} size={2}>
                        <Space>
                          {item.icon}
                          <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                        </Space>
                        <Text style={{ paddingLeft: item.icon ? 24 : 0, fontSize: 14 }}>{item.desc}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            </Space>
          </Panel>

          {/* 餐厅管理 */}
          <Panel 
            header={<span><ShopOutlined style={{ marginRight: 8 }} />餐厅管理</span>}
            key="restaurant"
          >
            <List
              dataSource={[
                { label: '餐厅名称', desc: '餐厅的名称', required: true },
                { label: '人均价格（元）', desc: '人均消费价格', icon: <DollarOutlined />, required: true },
                { label: '营业时间', desc: '例如10:00-23:00', icon: <ClockCircleOutlined />, required: true },
                { label: '主打菜品', desc: '请输入主打菜品，多个用逗号分隔', required: true },
                { label: '餐厅特色', desc: '文字描述餐厅特色', required: true },
                { label: '是否包含团餐', desc: '正常需要自费的情况选否', required: true },
                { label: '实际成本（元）', desc: '如有团餐，填入实际成本', icon: <DollarOutlined /> },
                { label: '餐厅图片', desc: '最多十张，每张最多5MB', icon: <PictureOutlined /> },
                { label: '报价单', desc: '如有团餐在此处填写报价内容', icon: <DollarOutlined /> }
              ]}
              renderItem={item => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }} size={2}>
                    <Space>
                      {item.icon}
                      <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                      {item.required && <Tag color="red">必填</Tag>}
                    </Space>
                    <Text style={{ paddingLeft: item.icon ? 24 : 0, fontSize: 14 }}>
                      {item.desc}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          </Panel>

          {/* 酒店民宿管理 */}
          <Panel 
            header={<span><HomeOutlined style={{ marginRight: 8 }} />酒店/民宿管理</span>}
            key="hotel"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 基础信息 */}
              <div>
                <Title level={4}>基础信息</Title>
                <List
                  dataSource={[
                    { label: '酒店/民宿名称', desc: '酒店或民宿的名称', required: true },
                    { label: '类型', desc: '选择酒店或民宿', required: true },
                    { label: '描述', desc: '酒店文字描述', required: true },
                    { label: '酒店图片', desc: '最多十张，每张最多5MB', icon: <PictureOutlined />, required: true }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" style={{ width: '100%' }} size={2}>
                        <Space>
                          {item.icon}
                          <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                          {item.required && <Tag color="red">必填</Tag>}
                        </Space>
                        <Text style={{ paddingLeft: item.icon ? 24 : 0, fontSize: 14 }}>
                          {item.desc}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <Divider />

              {/* 房型管理 */}
              <div>
                <Title level={4}>房型管理</Title>
                <Paragraph style={{ fontSize: 14, marginBottom: 16 }}>为每个酒店/民宿添加不同的房型选项</Paragraph>
                <List
                  dataSource={[
                    { label: '房型名称', desc: '房型的名称', required: true },
                    { label: '每晚价格（元）', desc: '对外显示价格', icon: <DollarOutlined />, required: true },
                    { label: '内部价格（元）', desc: '实际成本价格', icon: <DollarOutlined />, required: true },
                    { label: '是否含早餐', desc: '选是或否', required: true },
                    { label: '房型图片', desc: '最多十张，每张最多5MB', icon: <PictureOutlined />, required: true }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" style={{ width: '100%' }} size={2}>
                        <Space>
                          {item.icon}
                          <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                          {item.required && <Tag color="red">必填</Tag>}
                        </Space>
                        <Text style={{ paddingLeft: item.icon ? 24 : 0, fontSize: 14 }}>
                          {item.desc}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />

                <div style={{ marginTop: 24 }}>
                  <Text strong style={{ fontSize: 15 }}>房型标签（多选）</Text>
                  <div style={{ marginTop: 12 }}>
                    <Space wrap>
                      <Tag color="blue">标准型</Tag>
                      <Tag color="green">豪华型</Tag>
                      <Tag color="orange">景观房</Tag>
                      <Tag color="purple">大床房</Tag>
                      <Tag color="magenta">双床房</Tag>
                      <Tag color="cyan">家庭房</Tag>
                    </Space>
                    <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                      注：选项仍需要调整
                    </Paragraph>
                  </div>
                </div>
              </div>
            </Space>
          </Panel>
          </Collapse>
        </div>
      )
    },
    {
      key: 'api',
      label: <span><ApiOutlined /> API 文档</span>,
      children: (
        <div>
          {apiEndpoints.map((category, index) => (
            <Card 
              key={index}
              title={category.category} 
              style={{ marginBottom: 24 }}
            >
              <Table
                dataSource={category.endpoints}
                columns={apiColumns}
                pagination={false}
                rowKey={(record) => `${record.method}-${record.path}`}
              />
            </Card>
          ))}

          <Card title="API 使用示例">
            <CodeBlock 
              code={apiUsageExample}
              language="javascript"
              copyKey="api-usage"
            />
          </Card>
        </div>
      )
    },
    {
      key: 'database',
      label: <span><DatabaseOutlined /> 数据库结构</span>,
      children: (
        <div>
          <Alert
            message="数据库架构说明"
            description="系统使用 MongoDB 数据库，以下是主要集合的结构说明"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Card title="Itineraries (行程)" style={{ marginBottom: 24 }}>
            <CodeBlock 
              code={`{
  _id: ObjectId,
  name: String,               // 行程名称 (required)
  description: String,        // 行程描述 (required)
  base_price: Number,         // 基础价格 (required)
  people_range: String,       // 人数范围 (required, 如 "2-6人")
  theme_tags: [String],       // 主题标签数组
  goal_tags: [String],        // 目标标签数组
  image: String,              // 封面图片URL
  icon: String,               // 图标URL
  appeals: [{                 // 行程亮点
    description: String       // 亮点描述 (required)
  }],
  days: [{                    // 每日行程
    day: Number,              // 天数 (required)
    waypoints: [{             // 路径点
      spot_ids: [ObjectId],   // 景点ID数组 (ref: 'Attraction')
      name: String,           // 名称
      type: String,           // 类型: "hotel" | "spot" | "restaurant" (required)
      ismultiple: Boolean,    // 是否多选 (default: false)
      arrival_time: String,   // 到达时间
      departure_time: String, // 出发时间
      distance_from_previous_km: Number,      // 距离上一点的公里数
      travel_time_from_previous_min: Number   // 距离上一点的分钟数
    }]
  }],
  priceSheet: [{              // 价格明细
    name: String,             // 项目名称 (required)
    price: Number             // 价格 (required)
  }],
  status: String,             // 状态: "draft" | "published" | "archived" (default: "draft")
  created_at: Date,           // 创建时间
  updated_at: Date            // 更新时间
}`}
              language="javascript"
              copyKey="db-itinerary"
            />
          </Card>

          <Card title="Attractions (景点/项目)" style={{ marginBottom: 24 }}>
            <CodeBlock 
              code={`{
  _id: ObjectId,
  name: String,               // 景点/项目名称 (required)
  type: String,               // 类型: "活动" | "景点" (required)
  subtype: String,            // 子类型 (required)
                              // 可选值: "文保景点", "名胜景点", "热门景点", 
                              //        "休闲地点", "项目化行程", "体验化行程",
                              //        "打卡类行程", "文化体验", "文化实践"
  images: [String],           // 图片URLs (最多10张)
  description: String,        // 描述 (required)
  need_purchase: Boolean,     // 是否需要购票 (default: false)
  ticket_price_normal: Number,      // 普通票价格 (default: 0)
  ticket_price_discounted: Number,  // 优惠票价格 (default: 0)
  actual_cost: Number,        // 实际成本 (default: 0, min: 0)
  calculated_price: [{        // 报价单
    name: String,             // 项目名称 (required)
    price: Number,            // 价格 (required)
    description: String       // 描述 (default: "")
  }],
  development_level: Number,  // 开发程度 (0-5, default: 0)
  content_richness: Number,   // 内容丰富度 (0-5, default: 0)
  visitor_density: Number,    // 游客密度 (0-5, default: 0)
  physical_demand: Number,    // 体力需求 (0-5, default: 0)
  dynasty_span: String,       // 朝代跨度 (default: "")
  car: String,                // 交通信息 (default: "")
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}`}
              language="javascript"
              copyKey="db-attraction"
            />
          </Card>

          <Card title="Restaurants (餐厅)" style={{ marginBottom: 24 }}>
            <CodeBlock 
              code={`{
  _id: ObjectId,
  name: String,               // 餐厅名称 (required)
  images: [String],           // 餐厅图片 (最多10张)
  price_per_person: Number,   // 人均价格 (required, min: 0)
  time_range: String,         // 营业时间 (required, 如 "10:00-23:00")
  main_dishes: String,        // 主打菜品 (required)
  specialty: String,          // 餐厅特色 (required)
  cost_covered: Boolean,      // 是否包含团餐 (default: false)
  actual_cost: Number,        // 实际成本 (default: 0, min: 0)
  calculated_price: [{        // 报价单
    name: String,             // 项目名称 (required)
    price: Number             // 价格 (required)
  }],
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}`}
              language="javascript"
              copyKey="db-restaurant"
            />
          </Card>

          <Card title="Hotels (酒店/民宿)" style={{ marginBottom: 24 }}>
            <CodeBlock 
              code={`{
  _id: ObjectId,
  name: String,               // 酒店/民宿名称 (required)
  images: [String],           // 酒店图片 (最多10张)
  description: String,        // 描述 (required)
  roomtypes: [{               // 房型列表
    name: String,             // 房型名称 (required)
    tags: [String],           // 房型标签
    images: [String],         // 房型图片 (最多10张)
    room_per_night: Number,   // 每晚价格（对外）(required, min: 0)
    internal_price: Number,   // 内部价格 (default: 0, min: 0)
    breakfast_included: Boolean // 是否含早餐 (default: false)
  }],
  tags: String,               // 类型: "酒店" | "民宿" (required)
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}`}
              language="javascript"
              copyKey="db-hotel"
            />
          </Card>

          <Card title="索引说明">
            <Paragraph>
              <Text strong>系统已创建以下索引以优化查询性能：</Text>
            </Paragraph>
            <CodeBlock 
              code={`// Itineraries (行程)
db.itineraries.createIndex({ name: 1 })
db.itineraries.createIndex({ base_price: 1 })
db.itineraries.createIndex({ theme_tags: 1 })
db.itineraries.createIndex({ goal_tags: 1 })
db.itineraries.createIndex({ created_at: -1 })

// Attractions (景点/项目)
db.attractions.createIndex({ name: "text", description: "text" })
db.attractions.createIndex({ type: 1, subtype: 1 })

// Restaurants (餐厅)
db.restaurants.createIndex({ name: "text", main_dishes: "text", specialty: "text" })
db.restaurants.createIndex({ price_per_person: 1 })
db.restaurants.createIndex({ cost_covered: 1 })

// Hotels (酒店/民宿)
db.hotels.createIndex({ name: "text", description: "text" })
db.hotels.createIndex({ tags: 1 })`}
              language="javascript"
              copyKey="db-indexes"
            />
          </Card>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BookOutlined style={{ marginRight: 12 }} />
          系统文档
        </Title>
        <Paragraph type="secondary">
          敦煌APP管理面板完整文档，包含 API 参考、开发指南和使用说明
        </Paragraph>
      </div>

      <Tabs
        defaultActiveKey="guide"
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default Documentation;
