import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
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
  Tabs,
  TimePicker,
  Switch,
  Rate,
  Descriptions,
  Image,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  StarOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { searchAttractions, createAttraction, updateAttraction, deleteAttraction, getAttractionById, attractionAPI, uploadAPI } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AttractionManagement = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState(null);
  const [viewingAttraction, setViewingAttraction] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  // 已移除分页功能
  const [statistics, setStatistics] = useState({
    total: 0
  });
  const [selectedSearchType, setSelectedSearchType] = useState(null);
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 景点/项目类型选项
  const typeOptions = [
    { value: '景点', label: '景点' },
    { value: '活动', label: '活动' }
  ];

  // 景点/项目子类型选项
  const subtypeOptions = {
    '景点': ['文保景点', '名胜景点', '热门景点'],
    '活动': ['休闲地点', '项目化行程', '体验化行程', '打卡类行程', '文化体验', '文化实践']
  };

  // 获取所有子类型选项（用于初始显示）
  const allSubtypeOptions = [...subtypeOptions['景点'], ...subtypeOptions['活动']];

  // 根据类型获取对应的子类型选项
  const getSubtypeOptions = (type) => {
    if (!type) return allSubtypeOptions;
    return subtypeOptions[type] || [];
  };

  // 处理搜索表单中类型变化
  const handleSearchTypeChange = (value) => {
    setSelectedSearchType(value);
    // 清空子类型选择
    searchForm.setFieldsValue({ subtype: undefined });
  };

  // 处理创建/编辑表单中类型变化
  const handleFormTypeChange = (value) => {
    setSelectedFormType(value);
    // 清空子类型选择
    form.setFieldsValue({ subtype: undefined });
  };

  // 获取景点/项目列表（无分页）
  const fetchAttractions = async (params = {}) => {
    setLoading(true);
    try {
      const response = await attractionAPI.getAttractions(params);
      
      if (response.success) {
        const attractions = response.data.attractions || [];
        const total = response.data.total || attractions.length;
        
        setAttractions(attractions);
        
        // 更新统计信息
        setStatistics({
          total: total
        });
        
        console.log(`已加载 ${attractions.length} 个景点/项目`);
      }
    } catch (error) {
      message.error('获取景点/项目列表失败');
      console.error('获取景点/项目列表失败:', error);
      setStatistics({ total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 加载统计信息
  const loadStatistics = async () => {
    try {
      const response = await attractionAPI.getAttractionStatistics();
      if (response.success) {
        setStatistics({
          total: response.data.total || 0
        });
      }
    } catch (error) {
      console.error('获取景点/项目统计失败:', error);
      // 如果统计API失败，保持当前统计信息
    }
  };

  useEffect(() => {
    fetchAttractions();
    loadStatistics(); // 同时加载统计信息
  }, []);

  // 搜索处理
  const handleSearch = (values) => {
    fetchAttractions(values);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setSelectedSearchType(null);
    fetchAttractions();
  };

  // 创建景点/项目
  const handleCreate = () => {
    setEditingAttraction(null);
    setSelectedFormType(null);
    setModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  // 编辑景点/项目
  const handleEdit = async (record) => {
    try {
      const response = await getAttractionById(record.id || record._id);
      if (response.success) {
        setEditingAttraction(response.data);
        setModalVisible(true);
        
        // 设置表单类型状态
        setSelectedFormType(response.data.type);
        
        // 填充表单数据
        const formData = {
          ...response.data,
          opening_hours: response.data.opening_hours ? {
            weekday: response.data.opening_hours.weekday,
            weekend: response.data.opening_hours.weekend
          } : undefined,
          ticket_price: response.data.pricing?.ticket_price,
          group_discount: response.data.pricing?.group_discount,
          student_discount: response.data.pricing?.student_discount,
          tags: response.data.tags || []
        };
        
        // 设置图片列表
        const images = response.data.images || [];
        setFileList(images.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done',
          url: url
        })));
        
        form.setFieldsValue(formData);
      }
    } catch (error) {
      message.error('获取景点/项目详情失败');
    }
  };

  // 查看详情
  const handleView = async (record) => {
    try {
      const response = await getAttractionById(record.id || record._id);
      if (response.success) {
        setViewingAttraction(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error('获取景点/项目详情失败');
    }
  };

  // 删除景点/项目
  const handleDelete = async (id) => {
    try {
      const response = await deleteAttraction(id);
      if (response.success) {
        message.success('删除成功');
        fetchAttractions();
        loadStatistics(); // 刷新统计信息
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理图片上传变化
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 自定义上传请求
  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const response = await uploadAPI.uploadAttractionImage(file);
      onSuccess(response, file);
      setUploading(false);
    } catch (error) {
      onError(error);
      message.error('上传失败：' + (error.message || '未知错误'));
      setUploading(false);
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

  // 提交表单
  const handleSubmit = async (values) => {
    try {
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

      const formData = {
        ...values,
        images: images
      };

      let response;
      if (editingAttraction) {
        response = await updateAttraction(editingAttraction.id || editingAttraction._id, formData);
      } else {
        response = await createAttraction(formData);
      }

      if (response.success) {
        message.success(editingAttraction ? '更新成功' : '创建成功');
        setModalVisible(false);
        form.resetFields();
        setEditingAttraction(null);
        setFileList([]);
        fetchAttractions();
        loadStatistics(); // 刷新统计信息
      }
    } catch (error) {
      message.error(editingAttraction ? '更新失败' : '创建失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '景点/项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{name}</span>
          <Space size={4}>
            <Tag color="blue" size="small">{record.type || '景点'}</Tag>
            <Tag color="green" size="small">{record.subtype}</Tag>
          </Space>
        </Space>
      )
    },

    {
      title: '评分系统',
      key: 'ratings',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <span style={{ fontSize: '12px' }}>开发: {record.development_level || 0}/5</span>
            <span style={{ fontSize: '12px' }}>内容: {record.content_richness || 0}/5</span>
          </Space>
          <Space size={4}>
            <span style={{ fontSize: '12px' }}>人流: {record.visitor_density || 0}/5</span>
            <span style={{ fontSize: '12px' }}>体力: {record.physical_demand || 0}/5</span>
          </Space>
        </Space>
      )
    },
    {
      title: '票价信息',
      key: 'ticketPrice',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.need_purchase ? (
            <>
              <span style={{ fontSize: '12px' }}>
                普通票: ¥{record.ticket_price_normal || 0}
              </span>
              <span style={{ fontSize: '12px' }}>
                优惠票: ¥{record.ticket_price_discounted || 0}
              </span>
            </>
          ) : (
            <Tag color="green" size="small">免费</Tag>
          )}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'actions',
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
            title="确定要删除这个景点/项目吗？"
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
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总景点/项目数"
              value={statistics.total}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索表单 */}
      <Card style={{ marginBottom: 24 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="search" style={{ width: 200 }}>
            <Input
              placeholder="搜索景点/项目名称"
              prefix={<SearchOutlined />}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              placeholder="选择类型"
              style={{ width: 120 }}
              allowClear
              onChange={handleSearchTypeChange}
            >
              {typeOptions.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="subtype">
            <Select
              placeholder="选择子类型"
              style={{ width: 150 }}
              allowClear
            >
              {getSubtypeOptions(selectedSearchType).map(subtype => (
                <Option key={subtype} value={subtype}>
                  {subtype}
                </Option>
              ))}
            </Select>
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
          新建景点/项目
        </Button>
      </div>

      {/* 景点/项目表格 */}
      <Table
        columns={columns}
        dataSource={attractions}
        rowKey={(record) => record.id || record._id}
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
      />

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingAttraction ? '编辑景点/项目' : '新建景点/项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="景点/项目名称"
                    rules={[{ required: true, message: '请输入景点/项目名称' }]}
                  >
                    <Input placeholder="请输入景点/项目名称" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="type"
                    label="类型"
                    rules={[{ required: true, message: '请选择类型' }]}
                  >
                    <Select placeholder="请选择类型" onChange={handleFormTypeChange}>
                      {typeOptions.map(type => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="subtype"
                    label="子类型"
                    rules={[{ required: true, message: '请选择子类型' }]}
                  >
                    <Select placeholder="请选择子类型">
                      {getSubtypeOptions(selectedFormType).map(subtype => (
                        <Option key={subtype} value={subtype}>
                          {subtype}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="景点/项目描述"
                rules={[{ required: true, message: '请输入景点/项目描述' }]}
              >
                <TextArea rows={4} placeholder="请输入景点/项目描述" />
              </Form.Item>

              <Form.Item label="景点/项目图片">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  customRequest={customUploadRequest}
                  beforeUpload={beforeUpload}
                  onChange={handleImageChange}
                  multiple
                  onPreview={(file) => {
                    const url = file.url || (file.response?.success && `https://dhapp.rgm.games${file.response.data.url}`);
                    if (url) {
                      window.open(url, '_blank');
                    }
                  }}
                >
                  {fileList.length >= 10 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                  )}
                </Upload>
                <div style={{ color: '#999', fontSize: '12px', marginTop: 8 }}>
                  {uploading && '上传中...'}
                  {!uploading && '支持上传多张图片，最多10张，每张不超过5MB'}
                </div>
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="need_purchase" label="是否需要购票" valuePropName="checked">
                    <Switch checkedChildren="需要" unCheckedChildren="免费" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="ticket_price_normal" label="普通票价格">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="0"
                      min={0}
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/¥\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="ticket_price_discounted" label="优惠票价格">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="0"
                      min={0}
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/¥\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="dynasty_span" label="朝代跨度">
                    <Input placeholder="如：唐代-宋代" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="car" label="交通信息">
                    <TextArea rows={2} placeholder="交通方式和路线信息" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="评分系统" key="ratings">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="development_level" label="开发程度 (0-5)">
                    <Rate count={5} allowHalf />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="content_richness" label="内容丰富度 (0-5)">
                    <Rate count={5} allowHalf />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="visitor_density" label="游客密度 (0-5)">
                    <Rate count={5} allowHalf />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="physical_demand" label="体力需求 (0-5)">
                    <Rate count={5} allowHalf />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="报价单" key="pricing">
              <Form.Item name="actual_cost" label="实际成本（元）">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
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
                            <Input placeholder="项目名称" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
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

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAttraction ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 详情查看模态框 */}
      <Modal
        title="景点/项目详情"
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
              handleEdit(viewingAttraction);
            }}
          >
            编辑景点/项目
          </Button>
        ]}
        width={800}
      >
        {viewingAttraction && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="基本信息" key="info">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="景点/项目名称" span={2}>
                  {viewingAttraction.name}
                </Descriptions.Item>
                <Descriptions.Item label="类型">
                  <Tag color="blue">{viewingAttraction.type}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="子类型">
                  <Tag color="green">{viewingAttraction.subtype}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="是否需要购票">
                  {viewingAttraction.need_purchase ? '需要购票' : '免费'}
                </Descriptions.Item>
                <Descriptions.Item label="普通票价格">
                  ¥{viewingAttraction.ticket_price_normal || 0}
                </Descriptions.Item>
                <Descriptions.Item label="优惠票价格">
                  ¥{viewingAttraction.ticket_price_discounted || 0}
                </Descriptions.Item>
                <Descriptions.Item label="实际成本">
                  <Tag color="orange">¥{viewingAttraction.actual_cost || 0}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="朝代跨度">
                  {viewingAttraction.dynasty_span || '暂无'}
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {viewingAttraction.description}
                </Descriptions.Item>
                <Descriptions.Item label="交通信息" span={2}>
                  {viewingAttraction.car || '暂无'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="评分系统" key="ratings">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="开发程度">
                  <Rate disabled value={viewingAttraction.development_level || 0} />
                </Descriptions.Item>
                <Descriptions.Item label="内容丰富度">
                  <Rate disabled value={viewingAttraction.content_richness || 0} />
                </Descriptions.Item>
                <Descriptions.Item label="游客密度">
                  <Rate disabled value={viewingAttraction.visitor_density || 0} />
                </Descriptions.Item>
                <Descriptions.Item label="体力需求">
                  <Rate disabled value={viewingAttraction.physical_demand || 0} />
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="图片展示" key="images">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {viewingAttraction.images?.map((image, index) => (
                  <Image
                    key={index}
                    width={200}
                    height={150}
                    src={image}
                    style={{ borderRadius: '8px', objectFit: 'cover' }}
                  />
                )) || <div style={{ color: '#999' }}>暂无图片</div>}
              </div>
            </TabPane>
            
            <TabPane tab="报价单" key="pricing">
              <Descriptions column={1} bordered>
                {viewingAttraction.calculated_price?.map((item, index) => (
                  <Descriptions.Item key={index} label={item.name}>
                    ¥{item.price}
                  </Descriptions.Item>
                )) || <div style={{ color: '#999' }}>暂无报价项目</div>}
              </Descriptions>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default AttractionManagement;