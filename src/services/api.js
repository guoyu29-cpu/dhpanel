import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'https://dhapp.rgm.games/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    // 后端返回格式: { success: true, message: "...", data: {...} }
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || '请求失败');
    }
    // 返回响应数据而不是整个响应对象
    return response.data;
  },
  (error) => {
    console.error('API请求错误:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userAPI = {
  // 获取所有用户（分页）
  getUsers: (params = {}) => api.get('/users', { params }),
  
  // 获取活跃用户
  getActiveUsers: () => api.get('/users/active'),
  
  // 根据邮箱获取用户
  getUserByEmail: (email) => api.get(`/users/email/${email}`),
  
  // 根据ID获取用户
  getUserById: (id) => api.get(`/users/${id}`),
  
  // 创建用户
  createUser: (userData) => api.post('/users', userData),
  
  // 更新用户
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // 删除用户
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// 行程相关API
export const itineraryAPI = {
  // 获取所有行程（分页）
  getItineraries: (params = {}) => api.get('/itineraries', { params }),
  
  // 搜索行程
  searchItineraries: (params = {}) => api.get('/itineraries/search', { params }),
  
  // 获取已发布的行程
  getPublishedItineraries: (params = {}) => api.get('/itineraries/published', { params }),
  
  // 获取热门行程
  getPopularItineraries: (params = {}) => api.get('/itineraries/popular', { params }),
  
  // 获取推荐行程
  getRecommendations: (params = {}) => api.get('/itineraries/recommendations', { params }),
  
  // 根据ID获取行程
  getItineraryById: (id) => api.get(`/itineraries/${id}`),
  
  // 创建行程
  createItinerary: (itineraryData) => api.post('/itineraries', itineraryData),
  
  // 更新行程
  updateItinerary: (id, itineraryData) => api.put(`/itineraries/${id}`, itineraryData),
  
  // 更新行程状态
  updateItineraryStatus: (id, status) => api.patch(`/itineraries/${id}/status`, { status }),
  
  // 删除行程
  deleteItinerary: (id) => api.delete(`/itineraries/${id}`),
  
  // 预订行程
  bookItinerary: (id, bookingData) => api.post(`/itineraries/${id}/book`, bookingData),
  
  // 行程景点关联
  addAttraction: (id, attractionData) => api.post(`/itineraries/${id}/attractions`, attractionData),
  removeAttraction: (id, dayIndex, waypointIndex) => api.delete(`/itineraries/${id}/attractions/${dayIndex}/${waypointIndex}`),
  
  // 行程管理功能
  getFeatured: () => api.get('/itineraries/featured'),
  getStatistics: () => api.get('/itineraries/statistics'),
  getItineraryStatistics: () => api.get('/itineraries/statistics'),
  duplicate: (id) => api.post(`/itineraries/${id}/duplicate`)
};

// 景点相关API
export const attractionAPI = {
  // 获取所有景点（分页）
  getAttractions: (params = {}) => api.get('/attractions', { params }),
  
  // 搜索景点
  searchAttractions: (params = {}) => api.get('/attractions/search', { params }),
  
  // 获取附近景点
  getNearbyAttractions: (params = {}) => api.get('/attractions/nearby', { params }),
  
  // 根据类别获取景点
  getAttractionsByCategory: (category, params = {}) => api.get(`/attractions/category/${category}`, { params }),
  
  // 根据ID获取景点
  getAttractionById: (id) => api.get(`/attractions/${id}`),
  
  // 创建景点
  createAttraction: (attractionData) => api.post('/attractions', attractionData),
  
  // 更新景点
  updateAttraction: (id, attractionData) => api.put(`/attractions/${id}`, attractionData),
  
  // 更新景点状态
  updateAttractionStatus: (id, status) => api.patch(`/attractions/${id}/status`, { status }),
  
  // 删除景点
  deleteAttraction: (id) => api.delete(`/attractions/${id}`),
  
  // 获取景点统计信息
  getAttractionStatistics: () => api.get('/attractions/statistics')
};

// 为了向后兼容，导出单独的函数
export const searchAttractions = attractionAPI.searchAttractions;
export const createAttraction = attractionAPI.createAttraction;
export const updateAttraction = attractionAPI.updateAttraction;
export const deleteAttraction = attractionAPI.deleteAttraction;
export const getAttractionById = attractionAPI.getAttractionById;

// 餐厅相关API
export const restaurantAPI = {
  // 获取所有餐厅（分页）
  getRestaurants: (params = {}) => api.get('/restaurants', { params }),
  
  // 搜索餐厅
  searchRestaurants: (params = {}) => api.get('/restaurants/search', { params }),
  
  // 根据ID获取餐厅
  getRestaurantById: (id) => api.get(`/restaurants/${id}`),
  
  // 创建餐厅
  createRestaurant: (restaurantData) => api.post('/restaurants', restaurantData),
  
  // 更新餐厅
  updateRestaurant: (id, restaurantData) => api.put(`/restaurants/${id}`, restaurantData),
  
  // 删除餐厅
  deleteRestaurant: (id) => api.delete(`/restaurants/${id}`),
  
  // 获取餐厅统计信息
  getRestaurantStats: () => api.get('/restaurants/stats')
};

// 为了向后兼容，导出单独的函数
export const searchRestaurants = restaurantAPI.searchRestaurants;
export const createRestaurant = restaurantAPI.createRestaurant;
export const updateRestaurant = restaurantAPI.updateRestaurant;
export const deleteRestaurant = restaurantAPI.deleteRestaurant;
export const getRestaurantById = restaurantAPI.getRestaurantById;

// 酒店相关API
export const hotelAPI = {
  // 获取所有酒店（分页）
  getHotels: (params = {}) => api.get('/hotels', { params }),
  
  // 搜索酒店
  searchHotels: (params = {}) => api.get('/hotels/search', { params }),
  
  // 根据ID获取酒店
  getHotelById: (id) => api.get(`/hotels/${id}`),
  
  // 创建酒店
  createHotel: (hotelData) => api.post('/hotels', hotelData),
  
  // 更新酒店
  updateHotel: (id, hotelData) => api.put(`/hotels/${id}`, hotelData),
  
  // 删除酒店
  deleteHotel: (id) => api.delete(`/hotels/${id}`),
  
  // 获取酒店统计信息
  getHotelStats: () => api.get('/hotels/stats')
};

// 文件上传API
export const uploadAPI = {
  // 上传单个图片（通用）
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 上传多个图片（通用）
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 上传行程图片
  uploadItineraryImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/itinerary/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  uploadItineraryImages: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/itinerary/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 上传餐厅图片
  uploadRestaurantImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/restaurant/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  uploadRestaurantImages: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/restaurant/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 上传景点图片
  uploadAttractionImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/attraction/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  uploadAttractionImages: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/attraction/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 上传酒店图片
  uploadHotelImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/hotel/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  uploadHotelImages: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/hotel/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// 健康检查API
export const healthAPI = {
  checkHealth: () => api.get('/health'),
  getRootInfo: () => api.get('/')
};

export default api;