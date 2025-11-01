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
  Select,
  Descriptions,
  Image,
  Tooltip,
  Tabs,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  HomeOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { hotelAPI, uploadAPI } from '../services/api';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const HotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [viewingHotel, setViewingHotel] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    hotelCount: 0,
    guesthouseCount: 0
  });
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [roomImageFileLists, setRoomImageFileLists] = useState({});

  // 获取酒店列表
  const fetchHotels = async (params = {}) => {
    setLoading(true);
    try {
      const response = await hotelAPI.getHotels({
        page: pagination.current,
        limit: pagination.pageSize,
        ...params
      });

      if (response.success) {
        setHotels(response.data.hotels);
        setPagination({
          ...pagination,
          current: response.data.pagination.currentPage,
          total: response.data.pagination.totalHotels
        });
      }
    } catch (error) {
      message.error('获取酒店列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await hotelAPI.getHotelStats();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchStatistics();
  }, []);

  // 搜索酒店
  const handleSearch = async (values) => {
    setLoading(true);
    try {
      const params = {};
      if (values.search) {
        params.search = values.search;
      }
      if (values.tags) {
        params.tags = values.tags;
      }

      const response = await hotelAPI.searchHotels({
        ...params,
        page: 1,
        limit: pagination.pageSize
      });

      if (response.success) {
        setHotels(response.data.hotels);
        setPagination({
          ...pagination,
          current: response.data.pagination.currentPage,
          total: response.data.pagination.totalHotels
        });
      }
    } catch (error) {
      message.error('搜索酒店失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    fetchHotels();
  };

  // 打开创建/编辑模态框
  const showModal = (hotel = null) => {
    setEditingHotel(hotel);
    if (hotel) {
      form.setFieldsValue({
        ...hotel,
        images: hotel.images || []
      });
      // 设置文件列表用于显示
      setFileList(
        (hotel.images || []).map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done',
          url: url
        }))
      );
      
      // 设置房型图片列表
      if (hotel.roomtypes && hotel.roomtypes.length > 0) {
        const roomImageLists = {};
        hotel.roomtypes.forEach((room, index) => {
          if (room.images && room.images.length > 0) {
            roomImageLists[index] = room.images.map((url, imgIndex) => ({
              uid: `-room-${index}-${imgIndex}`,
              name: `room-${index}-image-${imgIndex}`,
              status: 'done',
              url: url
            }));
          }
        });
        setRoomImageFileLists(roomImageLists);
      }
    } else {
      form.resetFields();
      setFileList([]);
      setRoomImageFileLists({});
    }
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingHotel(null);
    form.resetFields();
    setFileList([]);
    setRoomImageFileLists({});
  };

  // 处理图片上传
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 自定义上传
  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const response = await uploadAPI.uploadHotelImage(file);
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
      
      // 从 fileList 中提取图片 URL
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

      // 处理房型图片
      const roomtypes = (values.roomtypes || []).map((room, index) => {
        const roomFileList = roomImageFileLists[index] || [];
        const roomImages = roomFileList
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
        
        return {
          ...room,
          images: roomImages
        };
      });

      const hotelData = {
        ...values,
        images,
        roomtypes
      };

      if (editingHotel) {
        // 更新酒店
        const response = await hotelAPI.updateHotel(editingHotel.id, hotelData);
        if (response.success) {
          message.success('更新酒店成功');
          fetchHotels();
          fetchStatistics();
          handleCancel();
        }
      } else {
        // 创建酒店
        const response = await hotelAPI.createHotel(hotelData);
        if (response.success) {
          message.success('创建酒店成功');
          fetchHotels();
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

  // 删除酒店
  const handleDelete = async (id) => {
    try {
      const response = await hotelAPI.deleteHotel(id);
      if (response.success) {
        message.success('删除酒店成功');
        fetchHotels();
        fetchStatistics();
      }
    } catch (error) {
      message.error('删除酒店失败: ' + error.message);
    }
  };

  // 查看详情
  const showDetail = async (hotel) => {
    setViewingHotel(hotel);
    setDetailModalVisible(true);
  };

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchHotels({ page: newPagination.current, limit: newPagination.pageSize });
  };

  // 表格列定义
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '类型',
      dataIndex: 'tags',
      key: 'tags',
      width: 120,
      render: (tags) => (
        <Tag color={tags === '酒店' ? 'blue' : 'green'}>
          {tags}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
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
      title: '房型数量',
      dataIndex: 'roomtypes',
      key: 'roomtypes',
      width: 100,
      render: (roomtypes) => <Tag>{roomtypes?.length || 0} 种</Tag>
    },
    {
      title: '图片数量',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => <Tag>{images?.length || 0} 张</Tag>
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
            title="确定要删除这个酒店吗？"
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
        <Col span={8}>
          <Card>
            <Statistic
              title="酒店/民宿总数"
              value={statistics.total}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="酒店数量"
              value={statistics.hotelCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="民宿数量"
              value={statistics.guesthouseCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ShopOutlined />}
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
              placeholder="搜索酒店名称或描述"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
          </Form.Item>
          <Form.Item name="tags" label="类型">
            <Select placeholder="选择类型" style={{ width: 150 }} allowClear>
              <Option value="酒店">酒店</Option>
              <Option value="民宿">民宿</Option>
            </Select>
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
            添加酒店/民宿
          </Button>
        </div>

        {/* 酒店列表表格 */}
        <Table
          columns={columns}
          dataSource={hotels}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingHotel ? '编辑酒店/民宿' : '添加酒店/民宿'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={900}
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
                label="酒店/民宿名称"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="请输入酒店/民宿名称" />
              </Form.Item>

              <Form.Item
                name="tags"
                label="类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="选择类型（酒店或民宿）">
                  <Option value="酒店">酒店</Option>
                  <Option value="民宿">民宿</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label="描述"
                rules={[{ required: true, message: '请输入描述' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请输入酒店/民宿描述"
                />
              </Form.Item>

              <Form.Item label="酒店图片">
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

            <TabPane tab="房型管理" key="roomtypes">
              <Form.List name="roomtypes">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} style={{ marginBottom: 16 }} size="small">
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="房型名称"
                              rules={[{ required: true, message: '请输入房型名称' }]}
                            >
                              <Input placeholder="如：标准双人间" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'room_per_night']}
                              label="每晚价格（元）"
                              rules={[{ required: true, message: '请输入价格' }]}
                            >
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="对外显示价格"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'internal_price']}
                              label="内部价格（元）"
                            >
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="内部成本价格"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          {...restField}
                          name={[name, 'tags']}
                          label="房型标签"
                        >
                          <Select mode="tags" placeholder="如：标准型、豪华型">
                            <Option value="标准型">标准型</Option>
                            <Option value="豪华型">豪华型</Option>
                            <Option value="景观房">景观房</Option>
                            <Option value="大床房">大床房</Option>
                            <Option value="双床房">双床房</Option>
                            <Option value="家庭房">家庭房</Option>
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'breakfast_included']}
                          label="是否含早餐"
                          valuePropName="checked"
                        >
                          <Select style={{ width: 120 }}>
                            <Option value={true}>含早餐</Option>
                            <Option value={false}>不含早餐</Option>
                          </Select>
                        </Form.Item>

                        <Form.Item
                          label="房型图片"
                        >
                          <Upload
                            listType="picture-card"
                            fileList={roomImageFileLists[name] || []}
                            onChange={({ fileList: newFileList }) => {
                              setRoomImageFileLists(prev => ({
                                ...prev,
                                [name]: newFileList
                              }));
                            }}
                            customRequest={async ({ file, onSuccess, onError }) => {
                              try {
                                setUploading(true);
                                const response = await uploadAPI.uploadHotelImage(file);
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
                            }}
                            accept="image/*"
                            multiple
                          >
                            {(roomImageFileLists[name] || []).length >= 6 ? null : (
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>上传</div>
                              </div>
                            )}
                          </Upload>
                        </Form.Item>

                        <Button type="link" onClick={() => remove(name)} danger>
                          删除此房型
                        </Button>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        添加房型
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
        title="酒店/民宿详情"
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
              showModal(viewingHotel);
            }}
          >
            编辑
          </Button>
        ]}
        width={900}
      >
        {viewingHotel && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="名称" span={2}>
                <strong>{viewingHotel.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="类型" span={2}>
                <Tag color={viewingHotel.tags === '酒店' ? 'blue' : 'green'}>
                  {viewingHotel.tags}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {viewingHotel.description}
              </Descriptions.Item>
            </Descriptions>

            {viewingHotel.roomtypes && viewingHotel.roomtypes.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>房型信息</h4>
                {viewingHotel.roomtypes.map((room, index) => (
                  <Card key={index} style={{ marginBottom: 16 }} size="small">
                    <Descriptions column={2} bordered>
                      <Descriptions.Item label="房型名称" span={2}>
                        <strong>{room.name}</strong>
                      </Descriptions.Item>
                      <Descriptions.Item label="每晚价格">
                        <Tag color="green">¥{room.room_per_night}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="内部价格">
                        <Tag color="orange">¥{room.internal_price || 0}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="早餐">
                        <Tag color={room.breakfast_included ? 'success' : 'default'}>
                          {room.breakfast_included ? '含早餐' : '不含早餐'}
                        </Tag>
                      </Descriptions.Item>
                      {room.tags && room.tags.length > 0 && (
                        <Descriptions.Item label="标签" span={2}>
                          {room.tags.map((tag, idx) => (
                            <Tag key={idx} color="blue">{tag}</Tag>
                          ))}
                        </Descriptions.Item>
                      )}
                      {room.images && room.images.length > 0 && (
                        <Descriptions.Item label="房型图片" span={2}>
                          <Image.PreviewGroup>
                            <Space wrap>
                              {room.images.map((url, idx) => (
                                <Image
                                  key={idx}
                                  width={100}
                                  height={100}
                                  src={url}
                                  style={{ objectFit: 'cover', borderRadius: 4 }}
                                />
                              ))}
                            </Space>
                          </Image.PreviewGroup>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                ))}
              </div>
            )}

            {viewingHotel.images && viewingHotel.images.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>酒店图片</h4>
                <Image.PreviewGroup>
                  <Space wrap>
                    {viewingHotel.images.map((url, index) => (
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

export default HotelManagement;
