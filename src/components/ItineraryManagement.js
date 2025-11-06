import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  Image,
  Divider,
  List,
  Steps
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  HomeOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { itineraryAPI } from '../services/api';
import moment from 'moment';

const { Option } = Select;

const ItineraryManagement = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingItinerary, setViewingItinerary] = useState(null);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    themeDistribution: [],
    goalDistribution: [],
    priceStatistics: {},
    dayDistribution: []
  });

  // 主题标签选项
  const themeTagOptions = [
    '石窟', '壁画', '戈壁', '沙漠', '自然', '冥想', '古迹'
  ];

  // 目标标签选项
  const goalTagOptions = [
    '摄影旅拍', '休闲度假', '探索冒险', '文化学习', '亲子游'
  ];

  // 路径点类型选项
  const waypointTypeOptions = [
    { value: 'hotel', label: '酒店' },
    { value: 'spot', label: '景点' },
    { value: 'restaurant', label: '餐厅' }
  ];

  useEffect(() => {
    fetchItineraries();
    fetchStatistics();
  }, [pagination.current, pagination.pageSize]);

  // 获取行程列表
  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const response = await itineraryAPI.getItineraries({
        page: pagination.current,
        limit: pagination.pageSize
      });
      
      if (response?.success) {
        setItineraries(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.totalItineraries || 0
        }));
      }
    } catch (error) {
      message.error('获取行程列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await itineraryAPI.getItineraryStatistics();
      if (response?.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  // 搜索行程
  const handleSearch = async (values) => {
    setLoading(true);
    try {
      const response = await itineraryAPI.searchItineraries({
        ...values,
        page: 1,
        limit: pagination.pageSize
      });
      
      if (response?.success) {
        setItineraries(response.data || []);
        setPagination(prev => ({
          ...prev,
          current: 1,
          total: response.pagination?.totalItineraries || 0
        }));
      }
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchItineraries();
  };

  // 创建行程 - 跳转到创建行程页面
  const handleCreate = () => {
    navigate('/itineraries/create');
  };

  // 编辑行程 - 跳转到编辑页面
  const handleEdit = (record) => {
    navigate(`/itineraries/edit/${record.id || record._id}`);
  };

  // 查看详情
  const handleView = (record) => {
    setViewingItinerary(record);
    setDetailModalVisible(true);
  };

  // 删除行程
  const handleDelete = async (id) => {
    try {
      const response = await itineraryAPI.deleteItinerary(id);
      if (response.success) {
        message.success('删除成功');
        fetchItineraries();
        fetchStatistics();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };


  // 表格列定义
  const columns = [
    {
      title: '行程名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.description?.substring(0, 50)}...
          </div>
        </Space>
      )
    },
    {
      title: '天数',
      key: 'days',
      width: 80,
      render: (_, record) => (
        <Tag icon={<CalendarOutlined />} color="blue">
          {record.days?.length || 0}天
        </Tag>
      )
    },
    {
      title: '基础价格',
      dataIndex: 'base_price',
      key: 'base_price',
      width: 100,
      render: (price) => (
        <span style={{ color: '#f50', fontWeight: 'bold' }}>
          ¥{price || 0}
        </span>
      )
    },
    {
      title: '人数范围',
      dataIndex: 'people_range',
      key: 'people_range',
      width: 120,
      render: (range) => (
        <Tag icon={<TeamOutlined />} color="green">
          {range || '未设置'}
        </Tag>
      )
    },
    {
      title: '主题标签',
      dataIndex: 'theme_tags',
      key: 'theme_tags',
      width: 200,
      render: (tags) => (
        <div>
          {(tags || []).slice(0, 3).map(tag => (
            <Tag key={tag} color="blue" style={{ marginBottom: 2 }}>
              {tag}
            </Tag>
          ))}
          {tags && tags.length > 3 && (
            <Tag color="default">+{tags.length - 3}</Tag>
          )}
        </div>
      )
    },
    {
      title: '目标标签',
      dataIndex: 'goal_tags',
      key: 'goal_tags',
      width: 200,
      render: (tags) => (
        <div>
          {(tags || []).slice(0, 2).map(tag => (
            <Tag key={tag} color="orange" style={{ marginBottom: 2 }}>
              {tag}
            </Tag>
          ))}
          {tags && tags.length > 2 && (
            <Tag color="default">+{tags.length - 2}</Tag>
          )}
        </div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个行程吗？"
            onConfirm={() => handleDelete(record.id || record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总行程数"
              value={statistics.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均价格"
              value={statistics.priceStatistics?.avgPrice || 0}
              prefix={<DollarOutlined />}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最高价格"
              value={statistics.priceStatistics?.maxPrice || 0}
              prefix={<DollarOutlined />}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最低价格"
              value={statistics.priceStatistics?.minPrice || 0}
              prefix={<DollarOutlined />}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="搜索行程名称或描述" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="theme_tags" label="主题标签">
            <Select
              mode="multiple"
              placeholder="选择主题标签"
              style={{ width: 200 }}
            >
              {themeTagOptions.map(tag => (
                <Option key={tag} value={tag}>{tag}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="goal_tags" label="目标标签">
            <Select
              mode="multiple"
              placeholder="选择目标标签"
              style={{ width: 200 }}
            >
              {goalTagOptions.map(tag => (
                <Option key={tag} value={tag}>{tag}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="minPrice" label="最低价格">
            <InputNumber placeholder="最低价格" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="maxPrice" label="最高价格">
            <InputNumber placeholder="最高价格" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          新建行程
        </Button>
      </div>

      {/* 行程表格 */}
      <Table
        columns={columns}
        dataSource={itineraries}
        rowKey={(record) => record.id || record._id}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }));
          }
        }}
      />

      {/* 详情模态框 */}
      <Modal
        title="行程详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {viewingItinerary && (
          <>
            {viewingItinerary.image && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Image
                  src={viewingItinerary.image}
                  alt={viewingItinerary.name}
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
                  preview={{
                    mask: <div>查看大图</div>
                  }}
                />
              </div>
            )}
            <Descriptions column={2} bordered>
              <Descriptions.Item label="行程名称" span={2}>
                <strong style={{ fontSize: '16px' }}>{viewingItinerary.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {viewingItinerary.description}
              </Descriptions.Item>
              <Descriptions.Item label="基础价格">
                <span style={{ color: '#f50', fontWeight: 'bold', fontSize: '16px' }}>
                  ¥{viewingItinerary.base_price}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="人数范围">
                <Tag icon={<TeamOutlined />} color="green" style={{ fontSize: '14px' }}>
                  {viewingItinerary.people_range}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="主题标签" span={2}>
                {(viewingItinerary.theme_tags || []).map(tag => (
                  <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>{tag}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="目标标签" span={2}>
                {(viewingItinerary.goal_tags || []).map(tag => (
                  <Tag key={tag} color="orange" style={{ marginBottom: 4 }}>{tag}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="行程天数">
                <Tag icon={<CalendarOutlined />} color="blue">
                  {viewingItinerary.days?.length || 0}天
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {viewingItinerary.created_at ? moment(viewingItinerary.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* 行程亮点 */}
            {viewingItinerary.appeals && viewingItinerary.appeals.length > 0 && (
              <>
                <Divider orientation="left">行程亮点</Divider>
                <List
                  dataSource={viewingItinerary.appeals}
                  renderItem={(appeal) => (
                    <List.Item>
                      <List.Item.Meta
                        description={appeal.description}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}

            {/* 行程安排 */}
            {viewingItinerary.days && viewingItinerary.days.length > 0 && (
              <>
                <Divider orientation="left">行程安排</Divider>
                <Steps
                  direction="vertical"
                  current={-1}
                  items={viewingItinerary.days.map((day, index) => ({
                    title: `第 ${day.day} 天`,
                    description: (
                      <div>
                        {day.waypoints && day.waypoints.length > 0 ? (
                          <List
                            size="small"
                            dataSource={day.waypoints}
                            renderItem={(waypoint) => (
                              <List.Item>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                  <Space>
                                    {waypoint.type === 'hotel' && <HomeOutlined style={{ color: '#52c41a' }} />}
                                    {waypoint.type === 'restaurant' && <ShopOutlined style={{ color: '#ff7875' }} />}
                                    {waypoint.type === 'spot' && <EnvironmentOutlined style={{ color: '#1890ff' }} />}
                                    <span>{waypoint.name || '未命名'}</span>
                                    {waypoint.arrival_time && (
                                      <Tag size="small" color="blue">抵达 {waypoint.arrival_time}</Tag>
                                    )}
                                    {waypoint.departure_time && (
                                      <Tag size="small" color="orange">出发 {waypoint.departure_time}</Tag>
                                    )}
                                  </Space>
                                  {waypoint.ismultiple && waypoint.spot_ids && waypoint.spot_ids.length > 0 && (
                                    <div style={{ marginLeft: 24, paddingLeft: 12, borderLeft: '2px solid #f0f0f0' }}>
                                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                                        {waypoint.type === 'restaurant' ? '多选餐厅：' : '多选景点：'}
                                      </div>
                                      {waypoint.spot_ids.map((spot, idx) => (
                                        <Tag key={idx} color={waypoint.type === 'restaurant' ? 'red' : 'cyan'} style={{ marginBottom: 4 }}>
                                          {typeof spot === 'object' ? spot.name : spot}
                                        </Tag>
                                      ))}
                                    </div>
                                  )}
                                </Space>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <span style={{ color: '#999' }}>暂无安排</span>
                        )}
                      </div>
                    )
                  }))}
                />
              </>
            )}

            {/* 价格明细 */}
            {viewingItinerary.priceSheet && viewingItinerary.priceSheet.length > 0 && (
              <>
                <Divider orientation="left">价格明细</Divider>
                <List
                  dataSource={viewingItinerary.priceSheet}
                  renderItem={(item) => (
                    <List.Item>
                      <span>{item.name}</span>
                      <span style={{ color: '#f50', fontWeight: 'bold' }}>¥{item.price}</span>
                    </List.Item>
                  )}
                />
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default ItineraryManagement;