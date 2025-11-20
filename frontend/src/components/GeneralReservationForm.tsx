import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Input, Select, DatePicker, Button, TextArea } from '@douyinfe/semi-ui';
import { deviceApi, reservationApi, locationApi, typeApi } from '../services/api';
import type { Device, DeviceType, LocationInfo, ReservationFormData as ApiReservationFormData, ApiResponse } from '../types';

// FormData接口扩展了API所需的数据结构，增加了界面需要的字段
interface FormData extends ApiReservationFormData {
  locationId?: number;
  typeId?: number;
}

interface GeneralReservationFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // 可选的预填充设备ID，用于从其他页面跳转过来时预先选择设备
  preSelectedDeviceId?: number;
  // 可选的预填充开始时间，用于从日历视图选择时间后自动填充
  preSelectedStartTime?: string;
  // 可选的预填充结束时间，用于从日历视图选择时间后自动填充
  preSelectedEndTime?: string;
}

interface ErrorState {
  [key: string]: string;
}

/**
 * 通用预约表单组件
 * 提供设备选择、时间选择和表单验证功能
 */
const GeneralReservationForm: React.FC<GeneralReservationFormProps> = ({ 
  visible, 
  onClose, 
  onSuccess,
  preSelectedDeviceId,
  preSelectedStartTime,
  preSelectedEndTime 
}) => {
  // 创建ref用于解决findDOMNode弃用警告
  const locationSelectRef = useRef<HTMLDivElement>(null);
  const typeSelectRef = useRef<HTMLDivElement>(null);
  const deviceSelectRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [types, setTypes] = useState<DeviceType[]>([]);
  const [deviceLoadError, setDeviceLoadError] = useState<string | null>(null);
  // 表单数据状态 - 使用预定义的默认值初始化
  const [formData, setFormData] = useState<FormData>({
    locationId: undefined,
    typeId: undefined,
    deviceId: preSelectedDeviceId,
    startTime: preSelectedStartTime || '',
    endTime: preSelectedEndTime || '',
    userName: '',
    userContact: '',
    reason: ''
  });
  
  // 监听默认时间值变化，当组件接收到新的默认时间时更新表单
  useEffect(() => {
    if (preSelectedStartTime || preSelectedEndTime) {
      setFormData(prev => ({
        ...prev,
        startTime: preSelectedStartTime || prev.startTime,
        endTime: preSelectedEndTime || prev.endTime
      }));
    }
  }, [preSelectedStartTime, preSelectedEndTime]);
  // 定义错误状态
  const [errors, setErrors] = useState<ErrorState>({});

  /**
   * 加载数据
   */
  useEffect(() => {
    if (visible) {
      // 当模态框显示时，加载所有必要的数据
      Promise.all([
        loadLocations(),
        loadTypes()
      ]).then(() => {
        // 地点和类型加载完成后，加载设备列表
        loadDevices();
      });
    }
  }, [visible]);

  // 创建防抖计时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 防抖版本的loadDevices函数
  const debouncedLoadDevices = useCallback((locationId?: number, typeId?: number) => {
    // 清除之前的计时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 设置新的计时器，延迟执行设备加载
    debounceTimerRef.current = setTimeout(() => {
      loadDevices(locationId, typeId);
    }, 300); // 300ms防抖延迟
  }, []); // 空依赖数组，确保函数引用稳定
  
  // 监听地点或类型变化，更新设备列表（使用防抖）
  useEffect(() => {
    // 清理函数，确保组件卸载时清除计时器
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // 监听地点或类型变化，更新设备列表
  useEffect(() => {
    const locationId = formData.locationId;
    const typeId = formData.typeId;
    
    // 只有当模态框可见时，才处理设备加载
    if (visible) {
      // 如果地点和类型都未选择，重置设备列表
      if (!locationId && !typeId) {
        setDevices([]);
        setFormData(prev => ({ ...prev, deviceId: undefined }));
      } else {
        // 使用防抖版本加载设备
        debouncedLoadDevices(locationId, typeId);
      }
    }
  }, [visible, formData.locationId, formData.typeId, debouncedLoadDevices]);

  /**
   * 加载地点列表
   */
  const loadLocations = async () => {
    try {
      setLocationsLoading(true);
      const response = await locationApi.getLocations();
      let locationArray: LocationInfo[] = [];
      // 处理可能的嵌套响应格式
      if (response?.data) {
        if (Array.isArray(response.data)) {
          locationArray = response.data;
        } else if (typeof response.data === 'object' && Array.isArray(response.data.data)) {
          locationArray = response.data.data;
        }
      }
      setLocations(locationArray);
    } catch (error) {
      console.error('加载地点列表失败:', error);
    } finally {
      setLocationsLoading(false);
    }
  };

  /**
   * 加载类型列表
   */
  const loadTypes = async () => {
    try {
      setTypesLoading(true);
      const response = await typeApi.getTypes();
      let typeArray: DeviceType[] = [];
      // 处理可能的嵌套响应格式
      if (response?.data) {
        if (Array.isArray(response.data)) {
          typeArray = response.data;
        } else if (typeof response.data === 'object' && Array.isArray(response.data.data)) {
          typeArray = response.data.data;
        }
      }
      setTypes(typeArray);
    } catch (error) {
      console.error('加载设备类型列表失败:', error);
    } finally {
      setTypesLoading(false);
    }
  };

  /**
   * 加载设备列表
   * 增强版设备加载函数，提供更健壮的API调用和响应处理
   */
  const loadDevices = async (locationId?: number, typeId?: number) => {
    // 重置错误状态
    setDeviceLoadError(null);
    
    try {
      setLoading(true);
      
      // 构建查询参数 - 使用增强的参数验证逻辑
      const params: { locationId?: number; typeId?: number } = {};
      
      // 更严格的参数验证
      if (locationId !== undefined && typeof locationId === 'number' && locationId > 0 && !isNaN(locationId)) {
        params.locationId = locationId;
      }
      
      if (typeId !== undefined && typeof typeId === 'number' && typeId > 0 && !isNaN(typeId)) {
        params.typeId = typeId;
      }
      
      console.log('加载设备列表，参数:', params);
      
      // 调用设备API获取数据
      const response = await deviceApi.getDevices(params);
      
      // 增强的响应数据处理，支持多种响应格式
      const deviceArray = processDeviceResponse(response);
      
      if (!Array.isArray(deviceArray) || deviceArray.length === 0) {
        // 如果没有找到匹配的设备，提供友好提示
        setDeviceLoadError(`没有找到匹配条件的设备`);
        setDevices([]);
        return;
      }
      
      // 过滤出可用状态的设备并增强数据
      const availableDevices = filterAndEnhanceDevices(deviceArray);
      
      // 对设备进行排序，提高用户体验
      const sortedDevices = sortDevices(availableDevices);
      
      // 为每个设备添加displayName属性，用于搜索和展示
      const devicesWithDisplayName = sortedDevices.map(device => ({
        ...device,
        displayName: `${device.name} (${device.typeName || '未知类型'}) - ${device.locationName || '未知地点'}`
      }));
      
      setDevices(devicesWithDisplayName);
      
      // 重置设备选择，因为设备列表可能已变化
      setFormData(prev => ({ ...prev, deviceId: undefined }));
      
      // 清除设备相关错误
      if (errors.deviceId) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.deviceId;
          return newErrors;
        });
      }
    } catch (error: any) {
      console.error('加载设备列表失败:', error);
      
      // 设置具体的错误信息
      let errorMessage = '获取设备列表失败，请稍后重试';
      
      // 根据不同类型的错误提供更具体的提示
      if (error instanceof Error) {
        if (error.message.includes('Network Error')) {
          errorMessage = '网络连接异常，请检查网络设置后重试';
        } else if (error.message.includes('timeout')) {
          errorMessage = '请求超时，请稍后重试';
        }
      }
      
      // 设置错误状态，提供具体错误信息
      setDeviceLoadError(errorMessage);
      
      // 出错时清空设备列表
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理设备API响应数据
   * 支持多种响应格式，确保数据完整性
   */
  const processDeviceResponse = (response: any): any[] => {
    // 安全检查
    if (!response || !response.data) {
      console.warn('设备API响应为空');
      return [];
    }
    
    // 标准化响应格式处理
    try {
      // 处理标准API响应格式 (code, data, message)
      if (typeof response.data === 'object') {
        // 处理带code字段的标准格式
        if (response.data.code === 200 || response.data.success) {
          if (Array.isArray(response.data.data)) {
            return response.data.data;
          }
        }
        // 处理直接包含数据数组的情况
        else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      // 处理直接返回数组的情况
      else if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (parseError) {
      console.error('解析设备响应数据失败:', parseError);
    }
    
    console.warn('无法识别的设备API响应格式');
    return [];
  };

  /**
   * 过滤可用设备并增强设备数据
   * 添加必要的关联信息，确保显示完整性
   */
  const filterAndEnhanceDevices = (devices: any[]): any[] => {
    return devices.filter((device: any) => {
      // 确保设备对象有效且状态为可用(0)
      return device && typeof device === 'object' && device.status === 0;
    }).map((device: any) => ({
      ...device,
      // 增强设备数据，添加关联信息
      typeName: getTypeName(device),
      locationName: getLocationName(device),
      // 添加设备标识信息，用于唯一区分
      displayId: device.id || device.deviceId || Math.random().toString(36).substr(2, 9),
      // 确保name字段存在
      name: device.name || `未命名设备-${device.id || ''}`
    }));
  };

  /**
   * 获取设备类型名称
   * 从设备对象的不同可能位置提取类型名称
   */
  const getTypeName = (device: any): string => {
    if (!device) return '';
    // 尝试从关联对象获取
    if (device.type && typeof device.type === 'object') {
      return device.type.name || device.type.typeName || '';
    }
    // 尝试直接获取
    return device.typeName || device.type || '';
  };

  /**
   * 获取设备地点名称
   * 从设备对象的不同可能位置提取地点名称
   */
  const getLocationName = (device: any): string => {
    if (!device) return '';
    // 尝试从关联对象获取
    if (device.location && typeof device.location === 'object') {
      return device.location.name || device.location.locationName || '';
    }
    // 尝试直接获取
    return device.locationName || device.location || '';
  };

  /**
   * 对设备列表进行排序
   * 提高用户体验，使设备更易查找
   */
  const sortDevices = (devices: any[]): any[] => {
    return [...devices].sort((a, b) => {
      // 按类型名称排序
      const typeCompare = (a.typeName || '').localeCompare(b.typeName || '');
      if (typeCompare !== 0) return typeCompare;
      // 按设备名称排序
      return (a.name || '').localeCompare(b.name || '');
    });
  };

  /**
   * 处理表单输入变化
   */
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误信息
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // 移除直接在这里调用loadDevices，因为已经在useEffect中使用防抖处理了
    // 这样可以避免重复调用，提高性能
  };

  // 移除handleDateChange函数，因为我们现在只使用handleDateTimeChange来处理所有日期时间相关的变更
  // 这样可以确保日期和时间信息总是被一起处理，避免单独的日期字段

    // 计算下一个整点时间
  const getNextHour = (): Date => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour;
  };

  // 根据开始时间计算默认结束时间
  const calculateEndTime = (startTime?: Date | null): Date => {
    if (startTime) {
      // 如果有开始时间，结束时间为开始时间加1小时
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      return endTime;
    } else {
      // 如果没有开始时间，结束时间为当前时间的下一个整点加1小时
      const nextHour = getNextHour();
      nextHour.setHours(nextHour.getHours() + 1);
      return nextHour;
    }
  };

  /**
   * 处理日期时间选择变化
   */
  const handleDateTimeChange = (field: keyof FormData, value: string | string[] | Date | Date[] | undefined) => {
    let targetValue: Date;
    
    // 如果没有提供值，根据字段类型设置默认值
    if (!value || (Array.isArray(value) && value.length === 0)) {
      if (field === 'startTime') {
        // 开始时间设置为下一个整点
        targetValue = getNextHour();
      } else if (field === 'endTime') {
        // 结束时间根据是否已设置开始时间来决定
        const startTimeValue = formData.startTime ? new Date(formData.startTime) : null;
        targetValue = calculateEndTime(startTimeValue);
      } else {
        // 其他字段不处理
        return;
      }
      const formattedDateTime = targetValue.toISOString();
      handleInputChange(field, formattedDateTime);
    } else if (value && !Array.isArray(value) && value instanceof Date) {
      // 保存为ISO格式的日期时间字符串
      handleInputChange(field, value.toISOString());
    } else if (value && !Array.isArray(value) && typeof value === 'string') {
      handleInputChange(field, value);
    }
  };

  /**
   * 验证表单数据
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // 验证设备选择
    if (!formData.deviceId) {
      newErrors.deviceId = '请选择设备';
    }
    
    // 验证开始时间和结束时间
    if (!formData.startTime) {
      newErrors.startTime = '请选择开始时间';
    } else {
      // 验证开始时间是否为未来时间
      const startTime = new Date(formData.startTime);
      const now = new Date();
      if (startTime <= now) {
        newErrors.startTime = '开始时间必须为未来时间';
      }
    }
    
    if (!formData.endTime) {
      newErrors.endTime = '请选择结束时间';
    } else {
      // 验证结束时间是否晚于开始时间
      if (formData.startTime) {
        const startTime = new Date(formData.startTime);
        const endTime = new Date(formData.endTime);
        if (endTime <= startTime) {
          newErrors.endTime = '结束时间必须晚于开始时间';
        }
      }
    }
    
    // 验证用户姓名
    if (!formData.userName || formData.userName.trim().length === 0) {
      newErrors.userName = '请输入预约人姓名';
    }
    
    // 验证联系方式
    if (!formData.userContact || formData.userContact.trim().length === 0) {
      newErrors.userContact = '请输入联系方式';
    } else {
      // 简单的联系方式验证
      const contactRegex = /^[\w.+-]+@[\w-]+\.[\w.-]+$|^\d{11}$/;
      if (!contactRegex.test(formData.userContact)) {
        newErrors.userContact = '请输入有效的手机号码或邮箱';
      }
    }
    
    // 验证预约理由
    if (!formData.reason || formData.reason.trim().length === 0) {
      newErrors.reason = '请输入预约理由';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('请填写所有必填字段并确保信息正确');
      return;
    }

    try {
      setLoading(true);
      // 确保deviceId是数字类型，符合API要求
      const deviceId = formData.deviceId as number;
      
      // 构建符合API要求的预约数据
      // startTime和endTime已经是包含日期的完整时间
      const reservationData: ApiReservationFormData = {
        deviceId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        userName: formData.userName,
        userContact: formData.userContact,
        reason: formData.reason
      };

      await reservationApi.createReservation(reservationData);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      
      // 重置表单
      resetForm();
    } catch (error: any) {
      console.error('创建预约失败:', error);
      // 显示友好的错误信息
      if (error.message) {
        alert(`预约失败: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重置表单数据
   */
  const resetForm = () => {
    setFormData({
      locationId: undefined,
      typeId: undefined,
      deviceId: undefined,
      startTime: '',
      endTime: '',
      userName: '',
      userContact: '',
      reason: ''
    });
    setErrors({});
  };

  /**
   * 处理关闭
   */
  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <>
      <style>{`
        .device-option-item {
          padding: 8px 0;
        }
        .device-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .device-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 4px;
          font-size: 13px;
          color: #666;
        }
        .meta-item {
          display: inline-flex;
          align-items: center;
        }
        .device-status {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-available {
          background-color: #e6f7ff;
          color: #1890ff;
        }
        .device-description {
          font-size: 13px;
          color: #999;
          margin-top: 4px;
          line-height: 1.4;
        }
        .retry-button {
          margin-top: 8px;
        }
      `}</style>
      <Modal
        title="设备预约"
        visible={visible}
        onCancel={handleClose}
        footer={[
          <Button key="cancel" onClick={handleClose} disabled={loading}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmit} 
            loading={loading}
          >
            确认
          </Button>
        ]}
        width={600}
      >
        <div className="form-container">
          {/* 地点选择 */}
          <div className="form-item" ref={locationSelectRef}>
            <label className="form-label">地点 {errors.locationId && <span className="error-text">{errors.locationId}</span>}</label>
            <Select
              placeholder="请选择设备地点"
              value={formData.locationId}
              onChange={(value) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  handleInputChange('locationId', value);
                }
              }}
              loading={locationsLoading}
              getPopupContainer={() => {
                // 安全地使用ref，如果不存在则返回body
                return locationSelectRef.current || document.body;
              }}
            >
              {locations.map(location => (
                <Select.Option 
                  key={location.id} 
                  value={location.id}
                >
                  {location.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* 类型选择 */}
          <div className="form-item" ref={typeSelectRef}>
            <label className="form-label">设备类型 {errors.typeId && <span className="error-text">{errors.typeId}</span>}</label>
            <Select
              placeholder="请选择设备类型"
              value={formData.typeId}
              onChange={(value) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  handleInputChange('typeId', value);
                }
              }}
              loading={typesLoading}
              getPopupContainer={() => {
                // 安全地使用ref，如果不存在则返回body
                return typeSelectRef.current || document.body;
              }}
            >
              {types.map(type => (
                <Select.Option 
                  key={type.id} 
                  value={type.id}
                >
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* 设备选择 */}
          <div className="form-item" ref={deviceSelectRef}>
            <label className="form-label">设备选择 {errors.deviceId && <span className="error-text">{errors.deviceId}</span>}</label>
            <Select
              placeholder={deviceLoadError ? deviceLoadError : "请选择要预约的设备"}
              value={formData.deviceId}
              onChange={(value) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  handleInputChange('deviceId', value);
                }
              }}
              loading={loading}
              disabled={!formData.locationId && !formData.typeId || deviceLoadError !== null}
              getPopupContainer={() => {
                // 安全地使用ref，如果不存在则返回body
                return deviceSelectRef.current || document.body;
              }}
            >
              {loading ? (
                <Select.Option value={undefined} disabled>
                  正在加载设备信息...
                </Select.Option>
              ) : devices.length > 0 ? (
                devices.map(device => (
                  <Select.Option 
                    key={device.id} 
                    value={device.id}
                  >
                    {device.name} (${device.typeName || ''} - ${device.location?.name || ''})
                  </Select.Option>
                ))
              ) : (
                <Select.Option value={undefined} disabled>
                  {deviceLoadError ? deviceLoadError : '无可用设备，请检查地点和类型选择'}
                </Select.Option>
              )}
            </Select>
            {deviceLoadError && (
              <Button 
                size="small" 
                onClick={() => loadDevices(formData.locationId, formData.typeId)}
                style={{ marginTop: '8px' }}
              >
                重试
              </Button>
            )}
          </div>

          {/* 日期时间选择 */}
          <div className="form-item">
            <label className="form-label">开始时间 {errors.startTime && <span className="error-text">{errors.startTime}</span>}</label>
            <DatePicker
              placeholder="请选择开始日期和时间"
              format="yyyy-MM-dd HH:mm"
              type="dateTime"
              value={formData.startTime ? new Date(formData.startTime) : undefined}
              onChange={(value) => handleDateTimeChange('startTime', value)}
              onSelect={(value: Date) => {
                // 当用户选择具体时间时，自动填充并关闭选择器
                if (value instanceof Date) {
                  handleDateTimeChange('startTime', value);
                }
              }}
              onOpenChange={(open) => {
                // 当选择器打开且当前没有选择值时，自动设置默认时间
                if (open && !formData.startTime) {
                  const defaultTime = getNextHour();
                  handleDateTimeChange('startTime', defaultTime);
                }
              }}
              disabledDate={(currentDate) => {
                // 禁用今天之前的日期
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return !!currentDate && currentDate < today;
              }}
            />
          </div>

          <div className="form-item">
            <label className="form-label">结束时间 {errors.endTime && <span className="error-text">{errors.endTime}</span>}</label>
            <DatePicker
              placeholder="请选择结束日期和时间"
              format="yyyy-MM-dd HH:mm"
              type="dateTime"
              value={formData.endTime ? new Date(formData.endTime) : undefined}
              onChange={(value) => handleDateTimeChange('endTime', value)}
              onSelect={(value: Date) => {
                // 当用户选择具体时间时，自动填充并关闭选择器
                if (value instanceof Date) {
                  handleDateTimeChange('endTime', value);
                }
              }}
              onOpenChange={(open) => {
                // 当选择器打开且当前没有选择值时，自动设置默认结束时间
                if (open && !formData.endTime) {
                  const startTimeValue = formData.startTime ? new Date(formData.startTime) : null;
                  const defaultEndTime = calculateEndTime(startTimeValue);
                  handleDateTimeChange('endTime', defaultEndTime);
                }
              }}
              disabledDate={(currentDate) => {
                // 禁用今天之前的日期
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return !!currentDate && currentDate < today;
              }}
            />
          </div>

          {/* 预约人信息 */}
          <div className="form-item">
            <label className="form-label">预约人姓名 {errors.userName && <span className="error-text">{errors.userName}</span>}</label>
            <Input
              placeholder="请输入预约人姓名"
              value={formData.userName}
              onChange={(value) => handleInputChange('userName', value)}
            />
          </div>

          <div className="form-item">
            <label className="form-label">联系方式 {errors.userContact && <span className="error-text">{errors.userContact}</span>}</label>
            <Input
              placeholder="请输入手机号或邮箱"
              value={formData.userContact}
              onChange={(value) => handleInputChange('userContact', value)}
            />
            <div className="form-help">请输入手机号或邮箱</div>
          </div>

          {/* 预约理由 */}
          <div className="form-item">
            <label className="form-label">预约事由 {errors.reason && <span className="error-text">{errors.reason}</span>}</label>
            <TextArea
              placeholder="请输入预约理由"
              value={formData.reason}
              onChange={(e: any) => handleInputChange('reason', e.target?.value || '')}
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </>
  );

}

export default GeneralReservationForm;