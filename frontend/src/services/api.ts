import axios, { AxiosError } from 'axios';
import type { Device, DeviceType, LocationInfo, Reservation, ReservationFormData, ApiResponse, ReservationStatus } from '../types';

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api', // 基础URL，将通过代理转发到后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log('API请求配置:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 输出日志
    console.log('API响应成功:', {
      url: response.config?.url,
      status: response.status
    });
    
    // 确保响应数据格式一致
    if (response.data && typeof response.data === 'object') {
      // 标准化响应格式，确保始终返回带有data属性的对象
      if (!('data' in response.data)) {
        return {
          ...response,
          data: {
            data: response.data,
            success: true,
            message: '请求成功'
          }
        };
      }
    }
    return response;
  },
  (error: AxiosError) => {
    // 输出详细错误日志
    // 更详细的错误信息记录
    let requestData = null;
    try {
      // 安全地解析请求数据，避免JSON.parse错误
      if (error.config?.data && typeof error.config.data === 'string') {
        try {
          requestData = JSON.parse(error.config.data);
        } catch (parseError) {
          // 如果解析失败，保留原始字符串
          requestData = error.config.data;
        }
      } else {
        requestData = error.config?.data;
      }
    } catch (err) {
      requestData = '无法解析请求数据';
    }
    
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      requestData: requestData,
      responseData: error.response?.data,
      message: error.message
    };
    console.error('API请求错误:', errorDetails);
    
    let errorMessage = '未知错误';
    
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      // 尝试从响应数据中提取错误信息
      const responseError = data as any;
      const serverErrorMessage = responseError?.message || responseError?.error || responseError?.msg || '';
      
      switch (status) {
        case 401:
          errorMessage = '未授权，请重新登录';
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = serverErrorMessage || '请求资源不存在';
          break;
        case 500:
          errorMessage = serverErrorMessage || '服务器内部错误';
          break;
        default:
          errorMessage = serverErrorMessage || `请求失败: 状态码 ${status}`;
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      errorMessage = '网络错误，请检查网络连接或服务器状态';
    } else {
      // 请求配置出错
      errorMessage = `请求配置错误: ${error.message}`;
    }
    
    // 增强错误对象，添加友好的错误消息和详细信息
    const enhancedError = {
      ...error,
      message: errorMessage,
      details: {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status
      }
    };
    
    return Promise.reject(enhancedError);
  }
);

// 设备相关API
export const deviceApi = {
  // 获取设备列表
  getDevices: (params?: { locationId?: number; typeId?: number }) => {
    // 过滤和验证参数，只传递有效的参数
    const filteredParams: { locationId?: number; typeId?: number } = {};
    
    // 只包含有效的、大于0的数字参数
    if (params?.locationId !== undefined && typeof params.locationId === 'number' && params.locationId > 0 && !isNaN(params.locationId)) {
      filteredParams.locationId = params.locationId;
    }
    
    if (params?.typeId !== undefined && typeof params.typeId === 'number' && params.typeId > 0 && !isNaN(params.typeId)) {
      filteredParams.typeId = params.typeId;
    }
    
    console.log('API层过滤后的参数:', filteredParams);
    return apiClient.get<ApiResponse<Device[]>>('/devices', { params: filteredParams });
  },
  
  // 获取设备详情
  getDevice: (id: number) => {
    return apiClient.get<ApiResponse<Device>>(`/devices/${id}`);
  },
  
  // 创建设备
  createDevice: (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<ApiResponse<Device>>('/devices', device);
  },
  
  // 更新设备
  updateDevice: (id: number, device: Partial<Device>) => {
    return apiClient.put<ApiResponse<Device>>(`/devices/${id}`, device);
  },
  
  // 删除设备
  deleteDevice: (id: number) => {
    return apiClient.delete<ApiResponse<void>>(`/devices/${id}`);
  },
};

// 设备类型相关API
export const typeApi = {
  // 获取设备类型列表
  getTypes: () => {
    return apiClient.get<ApiResponse<DeviceType[]>>('/types');
  },
  
  // 创建设备类型
  createType: (type: Omit<DeviceType, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<ApiResponse<DeviceType>>('/types', type);
  },
  
  // 更新设备类型
  updateType: (id: number, type: Partial<DeviceType>) => {
    return apiClient.put<ApiResponse<DeviceType>>(`/types/${id}`, type);
  },
  
  // 删除设备类型
  deleteType: (id: number) => {
    return apiClient.delete<ApiResponse<void>>(`/types/${id}`);
  },
};

// 地点相关API
export const locationApi = {
  // 获取地点列表
  getLocations: () => {
    return apiClient.get<ApiResponse<LocationInfo[]>>('/locations');
  },
  createLocation: (location: Omit<LocationInfo, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<ApiResponse<LocationInfo>>('/locations', location);
  },
  updateLocation: (id: number, location: Partial<LocationInfo>) => {
    return apiClient.put<ApiResponse<LocationInfo>>(`/locations/${id}`, location);
  },
  
  // 删除地点
  deleteLocation: (id: number) => {
    return apiClient.delete<ApiResponse<void>>(`/locations/${id}`);
  },
};

// 预约相关API
export const reservationApi = {
  // 获取预约列表
  getReservations: (params?: { deviceId?: number; date?: string; status?: ReservationStatus }) => {
    // 过滤和验证参数，只传递有效的参数
    const filteredParams: { deviceId?: number; date?: string; status?: ReservationStatus } = {};
    
    // 只包含有效的、大于0的数字参数
    if (params?.deviceId !== undefined && typeof params.deviceId === 'number' && params.deviceId > 0 && !isNaN(params.deviceId)) {
      filteredParams.deviceId = params.deviceId;
    }
    
    if (params?.date) {
      filteredParams.date = params.date;
    }
    
    if (params?.status !== undefined && typeof params.status === 'number') {
      filteredParams.status = params.status;
    }
    
    console.log('API层过滤后的预约查询参数:', filteredParams);
    return apiClient.get<ApiResponse<Reservation[]>>('/reservations', { params: filteredParams });
  },
  
  // 创建预约
  createReservation: (reservation: ReservationFormData) => {
    // 验证必要字段
    if (!reservation || !reservation.deviceId || !reservation.userName || !reservation.userContact || 
        !reservation.startTime || !reservation.endTime || !reservation.reason) {
      return Promise.reject(new Error('缺少必要的预约信息'));
    }
    
    // 验证字段类型
    if (typeof reservation.deviceId !== 'number' || reservation.deviceId <= 0) {
      return Promise.reject(new Error('无效的设备ID'));
    }
    
    return apiClient.post<ApiResponse<Reservation>>('/reservations', reservation);
  },
  
  // 取消预约
  cancelReservation: (id: number) => {
    return apiClient.delete<ApiResponse<void>>(`/reservations/${id}`);
  },
  
  // 更新预约状态
  updateReservationStatus: (id: number, status: ReservationStatus, reason?: string) => {
    // 验证必要字段
    if (typeof id !== 'number' || id <= 0) {
      return Promise.reject(new Error('无效的预约ID'));
    }
    
    if (typeof status !== 'number') {
      return Promise.reject(new Error('无效的预约状态'));
    }
    
    const requestData = { status };
    if (reason) {
      Object.assign(requestData, { reason });
    }
    
    return apiClient.put<ApiResponse<Reservation>>(`/reservations/${id}/status`, requestData);
  },
};

// 导出所有API
export default {
  device: deviceApi,
  type: typeApi,
  location: locationApi,
  reservation: reservationApi,
};