import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Space,
  Popconfirm,
  message,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Switch,
  Descriptions,
  Image,
  Tooltip,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  UploadOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { restaurantAPI, uploadAPI } from '../services/api';

const { TextArea } = Input;
const { TabPane } = Tabs;

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [viewingRestaurant, setViewingRestaurant] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    costCovered: 0,
    costNotCovered: 0,
    avgPrice: 0
  });
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 获取餐厅列表
  const fetchRestaurants = async (params = {}) => {
    setLoading(true);
    try {
      const response = await restaurantAPI.getRestaurants({
        page: pagination.current,
        limit: pagination.pageSize,
        ...params
      });

      if (response.success) {
        setRestaurants(response.data.restaurants);
        setPagination({
          ...pagination,
          current: response.data.pagination.currentPage,
          total: response.data.pagination.totalRestaurants
        });
      }
    } catch (error) {
      message.error('获取餐厅列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await restaurantAPI.getRestaurantStats();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchStatistics();
  }, []);

  // 搜索餐厅
  const handleSearch = async (values) => {
    setLoading(true);
    try {
      const params = {};
      if (values.search) {
        params.search = values.search;
      }
      if (values.cost_covered !== undefined) {
        params.cost_covered = values.cost_covered;
      }

      const response = await restaurantAPI.searchRestaurants({
        ...params,
        page: 1,
        limit: pagination.pageSize
      });

      if (response.success) {
        setRestaurants(response.data.restaurants);
        setPagination({
          ...pagination,
          current: response.data.pagination.currentPage,
          total: response.data.pagination.totalRestaurants
        });
      }
    } catch (error) {
      message.error('搜索餐厅失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    fetchRestaurants();
  };

  // 打开创建/编辑模态框
  const showModal = (restaurant = null) => {
    setEditingRestaurant(restaurant);
    if (restaurant) {
      form.setFieldsValue({
        ...restaurant,
        images: restaurant.images || []
      });
      // 设置文件列表用于显示
      setFileList(
        (restaurant.images || []).map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done',
          url: url
        }))
      );
    } else {
      form.resetFields();
      setFileList([]);
    }
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingRestaurant(null);
    form.resetFields();
    setFileList([]);
  };

  // 处理图片上传
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 自定义上传
  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const response = await uploadAPI.uploadRestaurantImage(file);
      if (response.success) {
        onSuccess(response);
        message.success('图片上传成功');
      }
    } catch (error) {
      onError(error);
      message.error('图片上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 从fileList中提取图片URL
      const images = fileList
        .filter(file => file.status === 'done')
        .map(file => {
          if (file.url) {
            return file.url;
          } else if (file.response?.success && file.response?.data?.url) {
            return `https://dhapp.rgm.games${file.response.data.url}`;
          }
          return null;
        })
        .filter(Boolean);

      const restaurantData = {
        ...values,
        images
      };

      if (editingRestaurant) {
        // 更新餐厅
        const response = await restaurantAPI.updateRestaurant(editingRestaurant.id, restaurantData);
        if (response.success) {
          message.success('更新餐厅成功');
          fetchRestaurants();
          fetchStatistics();
          handleCancel();
        }
      } else {
        // 创建餐厅
        const response = await restaurantAPI.createRestaurant(restaurantData);
        if (response.success) {
          message.success('创建餐厅成功');
          fetchRestaurants();
          fetchStatistics();
          handleCancel();
        }
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写所有必填字段');
      } else {
        message.error('操作失败: ' + error.message);
      }
    }
  };

  // 删除餐厅
  const handleDelete = async (id) => {
    try {
      const response = await restaurantAPI.deleteRestaurant(id);
      if (response.success) {
        message.success('删除餐厅成功');
        fetchRestaurants();
        fetchStatistics();
      }
    } catch (error) {
      message.error('删除餐厅失败: ' + error.message);
    }
  };

  // 查看详情
  const showDetail = async (restaurant) => {
    setViewingRestaurant(restaurant);
    setDetailModalVisible(true);
  };

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchRestaurants({ page: newPagination.current, limit: newPagination.pageSize });
  };

  // 表格列定义
  const columns = [
    {
      title: '餐厅名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '人均价格',
      dataIndex: 'price_per_person',
      key: 'price_per_person',
      width: 120,
      render: (price) => (
        <Tag color="green" icon={<DollarOutlined />}>
          ¥{price}
        </Tag>
      ),
      sorter: (a, b) => a.price_per_person - b.price_per_person
    },
    {
      title: '营业时间',
      dataIndex: 'time_range',
      key: 'time_range',
      width: 150,
      render: (time) => (
        <span>
          <ClockCircleOutlined /> {time}
        </span>
      )
    },
    {
      title: '主打菜品',
      dataIndex: 'main_dishes',
      key: 'main_dishes',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '特色',
      dataIndex: 'specialty',
      key: 'specialty',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '团餐',
      dataIndex: 'cost_covered',
      key: 'cost_covered',
      width: 100,
      render: (covered) => (
        <Tag color={covered ? 'success' : 'default'} icon={covered ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {covered ? '包含' : '不包含'}
        </Tag>
      ),
      filters: [
        { text: '包含团餐', value: true },
        { text: '不包含团餐', value: false }
      ],
      onFilter: (value, record) => record.cost_covered === value
    },
    {
      title: '图片数量',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => <Tag>{images?.length || 0} 张</Tag>
    },
    {
      title: '报价单',
      dataIndex: 'calculated_price',
      key: 'calculated_price',
      width: 100,
      render: (prices) => (
        <Tag color={prices && prices.length > 0 ? 'blue' : 'default'}>
          {prices?.length || 0} 项
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个餐厅吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
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
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="餐厅总数"
              value={statistics.total}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="包含团餐"
              value={statistics.costCovered}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="不包含团餐"
              value={statistics.costNotCovered}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均价格"
              value={statistics.avgPrice}
              prefix="¥"
              suffix="/ 人"
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
          <Form.Item name="search">
            <Input
              placeholder="搜索餐厅名称、菜品或特色"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
          </Form.Item>
          <Form.Item name="cost_covered" label="团餐">
            <Switch
              checkedChildren="包含"
              unCheckedChildren="不包含"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleResetSearch}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            添加餐厅
          </Button>
        </div>

        {/* 餐厅列表表格 */}
        <Table
          columns={columns}
          dataSource={restaurants}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingRestaurant ? '编辑餐厅' : '添加餐厅'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        confirmLoading={uploading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Form.Item
                name="name"
                label="餐厅名称"
                rules={[{ required: true, message: '请输入餐厅名称' }]}
              >
                <Input placeholder="请输入餐厅名称" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price_per_person"
                    label="人均价格（元）"
                    rules={[{ required: true, message: '请输入人均价格' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="请输入人均价格"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="time_range"
                    label="营业时间"
                    rules={[{ required: true, message: '请输入营业时间' }]}
                  >
                    <Input placeholder="例如: 10:00-22:00" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="main_dishes"
                label="主打菜品"
                rules={[{ required: true, message: '请输入主打菜品' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="请输入主打菜品，多个菜品用逗号分隔"
                />
              </Form.Item>

              <Form.Item
                name="specialty"
                label="餐厅特色"
                rules={[{ required: true, message: '请输入餐厅特色' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="请输入餐厅特色"
                />
              </Form.Item>

              <Form.Item
                name="cost_covered"
                label="是否包含团餐"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>

              <Form.Item
                name="actual_cost"
                label="实际成本（元）"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="请输入实际成本"
                />
              </Form.Item>

              <Form.Item label="餐厅图片">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  customRequest={customUpload}
                  accept="image/*"
                  multiple
                >
                  {fileList.length >= 8 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </TabPane>

            <TabPane tab="报价单" key="pricing">
              <Form.List name="calculated_price">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={16} style={{ marginBottom: 8 }}>
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            rules={[{ required: true, message: '请输入项目名称' }]}
                          >
                            <Input placeholder="项目名称（如：特色套餐A）" />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'price']}
                            rules={[{ required: true, message: '请输入价格' }]}
                          >
                            <InputNumber
                              style={{ width: '100%' }}
                              placeholder="价格"
                              min={0}
                              step={0.01}
                              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/¥\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Button type="link" onClick={() => remove(name)} danger>
                            删除
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        添加报价项目
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="餐厅详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setDetailModalVisible(false);
              showModal(viewingRestaurant);
            }}
          >
            编辑
          </Button>
        ]}
        width={800}
      >
        {viewingRestaurant && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="餐厅名称" span={2}>
                <strong>{viewingRestaurant.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="人均价格">
                <Tag color="green" icon={<DollarOutlined />}>
                  ¥{viewingRestaurant.price_per_person}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="营业时间">
                <ClockCircleOutlined /> {viewingRestaurant.time_range}
              </Descriptions.Item>
              <Descriptions.Item label="主打菜品" span={2}>
                {viewingRestaurant.main_dishes}
              </Descriptions.Item>
              <Descriptions.Item label="餐厅特色" span={2}>
                {viewingRestaurant.specialty}
              </Descriptions.Item>
              <Descriptions.Item label="团餐" span={2}>
                <Tag
                  color={viewingRestaurant.cost_covered ? 'success' : 'default'}
                  icon={viewingRestaurant.cost_covered ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                  {viewingRestaurant.cost_covered ? '包含团餐' : '不包含团餐'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="实际成本" span={2}>
                <Tag color="orange">¥{viewingRestaurant.actual_cost || 0}</Tag>
              </Descriptions.Item>
            </Descriptions>

            {viewingRestaurant.calculated_price && viewingRestaurant.calculated_price.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>报价单</h4>
                <Descriptions column={1} bordered>
                  {viewingRestaurant.calculated_price.map((item, index) => (
                    <Descriptions.Item key={index} label={item.name}>
                      <Tag color="green" icon={<DollarOutlined />}>¥{item.price}</Tag>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            )}

            {viewingRestaurant.images && viewingRestaurant.images.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>餐厅图片</h4>
                <Image.PreviewGroup>
                  <Space wrap>
                    {viewingRestaurant.images.map((url, index) => (
                      <Image
                        key={index}
                        width={150}
                        height={150}
                        src={url}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RestaurantManagement;
