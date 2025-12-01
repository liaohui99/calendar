import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Input, Select, DatePicker, Button, TextArea } from '@douyinfe/semi-ui';
import { deviceApi, reservationApi, locationApi, typeApi } from '../services/api';
import type { Device, DeviceType, LocationInfo, ReservationFormData as ApiReservationFormData, ApiResponse } from '../types';

// FormData接口扩展API的预约表单数据接口，增加位置和类型字段
interface FormData extends ApiReservationFormData {
  locationId?: number;
  typeId?: number;
}

interface GeneralReservationFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // 预选中的设备ID，可选参数，用于从日历视图选择设备后直接预约
  preSelectedDeviceId?: number;
  // 预选中的开始时间，可选参数，用于从日历视图选择时间后直接预约
  preSelectedStartTime?: string;
  // 预选中的结束时间，可选参数，用于从日历视图选择时间后直接预约
  preSelectedEndTime?: string;
}

interface ErrorState {
  [key: string]: string;
}

/**
 * 通用预约表单组件
 * 提供设备预约的完整功能界面
 */
const GeneralReservationForm: React.FC<GeneralReservationFormProps> = ({ 
  visible, 
  onClose, 
  onSuccess,
  preSelectedDeviceId,
  preSelectedStartTime,
  preSelectedEndTime 
}) => {
  // 使用ref替代findDOMNode获取DOM元素引用
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
  // 表单数据状态 - 设置默认值和类型安全
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
  
  // 当预选中的时间变更时更新表单数据
  useEffect(() => {
    if (preSelectedStartTime || preSelectedEndTime) {
      setFormData(prev => ({
        ...prev,
        startTime: preSelectedStartTime || prev.startTime,
        endTime: preSelectedEndTime || prev.endTime
      }));
    }
  }, [preSelectedStartTime, preSelectedEndTime]);
  // 表单验证错误状态
  const [errors, setErrors] = useState<ErrorState>({});

  /**
   * 组件加载时初始化数据
   */
  useEffect(() => {
    if (visible) {
      // 并行加载位置和类型数据
      Promise.all([
        loadLocations(),
        loadTypes()
      ]).then(() => {
        // 位置和类型数据加载完成后加载设备列表
        loadDevices();
      });
    }
  }, [visible]);

  // ?????????????????
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 防抖处理的设备加载函数
  const debouncedLoadDevices = useCallback((locationId?: number, typeId?: number) => {
    // 清除之前的设备加载错误??
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 设置防抖定时器，延迟执行设备加载
    debounceTimerRef.current = setTimeout(() => {
      loadDevices(locationId, typeId);
    }, 300); // 300ms的防抖延迟时间
  }, []); // 依赖项为空数组，表示只在组件挂载时创建一次
  
  // 清理防抖定时器，防止内存泄漏
  useEffect(() => {
    // 组件卸载时执行清理
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // 根据位置和类型筛选设备列表
  useEffect(() => {
    const locationId = formData.locationId;
    const typeId = formData.typeId;
    
    // 只在组件可见时执行筛选
    if (visible) {
      // 如果位置和类型都未选择，清空设备列表
      if (!locationId && !typeId) {
        setDevices([]);
        setFormData(prev => ({ ...prev, deviceId: undefined }));
      } else {
        // 执行防抖处理的设备加载函数
        debouncedLoadDevices(locationId, typeId);
      }
    }
  }, [visible, formData.locationId, formData.typeId, debouncedLoadDevices]);

  /**
   * 加载位置列表
   */
  const loadLocations = async () => {
    try {
      setLocationsLoading(true);
      const response = await locationApi.getLocations();
      let locationArray: LocationInfo[] = [];
      // 安全地处理API响应数据
      if (response?.data) {
        if (Array.isArray(response.data)) {
          locationArray = response.data;
        } else if (typeof response.data === 'object' && Array.isArray(response.data.data)) {
          locationArray = response.data.data;
        }
      }
      setLocations(locationArray);
    } catch (error) {
      console.error('加载位置列表失败:', error);
    } finally {
      setLocationsLoading(false);
    }
  };

  /**
   * 加载设备类型列表
   */
  const loadTypes = async () => {
    try {
      setTypesLoading(true);
      const response = await typeApi.getTypes();
      let typeArray: DeviceType[] = [];
      // 安全地处理API响应数据
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
   * 根据位置ID和类型ID筛选设备
   */
  const loadDevices = async (locationId?: number, typeId?: number) => {
    // 输入验证???
    setDeviceLoadError(null);
    
    try {
      setLoading(true);
      
      // 构建筛选参数对象 - 确保类型安全
      const params: { locationId?: number; typeId?: number } = {};
      
      // 处理直接的类型属性???
      if (locationId !== undefined && typeof locationId === 'number' && locationId > 0 && !isNaN(locationId)) {
        params.locationId = locationId;
      }
      
      if (typeId !== undefined && typeof typeId === 'number' && typeId > 0 && !isNaN(typeId)) {
        params.typeId = typeId;
      }
      
      console.log('加载设备列表的参数:', params);
      
      // 调用设备API获取数据
      const response = await deviceApi.getDevices(params);
      
      // 防抖定时器引用，用于优化设备加载性能
      const deviceArray = processDeviceResponse(response);
      
      if (!Array.isArray(deviceArray) || deviceArray.length === 0) {
        // 没有找到符合条件的设备
        setDeviceLoadError(`未找到符合条件的设备`);
        setDevices([]);
        return;
      }
      
      // 过滤并增强设备信息
      const availableDevices = filterAndEnhanceDevices(deviceArray);
      
      // 按设备名称排序
      const sortedDevices = sortDevices(availableDevices);
      
      // 为每个设备添加显示名称
      const devicesWithDisplayName = sortedDevices.map(device => ({
        ...device,
        displayName: `${device.name} (${device.typeName || '未分类'}) - ${device.locationName || '未知位置'}`
      }));
      
      setDevices(devicesWithDisplayName);
      
      // 重置已选择的设备ID
      setFormData(prev => ({ ...prev, deviceId: undefined }));
      
      // 清除设备ID错误
      if (errors.deviceId) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.deviceId;
          return newErrors;
        });
      }
    } catch (error: any) {
      console.error('加载设备列表失败:', error);
      
      // 设置默认错误信息
      let errorMessage = '加载设备列表失败，请重试';
      
      // 根据错误类型定制错误消息
      if (error instanceof Error) {
        // 网络错误情况处理
        if (error.message.includes('Network Error')) {
          errorMessage = '网络连接失败，请检查网络';
        } else if (error.message.includes('timeout')) {
          errorMessage = '请求超时，请稍后重试';
        }
      }
      
      // 设置设备加载错误信息
      setDeviceLoadError(errorMessage);
      
      // 清空设备列表
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理设备API响应数据
   * 从各种响应格式中提取设备列表
   */
  const processDeviceResponse = (response: any): any[] => {
    // ??????
    if (!response || !response.data) {
      console.warn('无效的API响应');
      return [];
    }
    
    // 处理嵌套的类型对象?
    try {
      // 表单提交成功后重置表单API?????? (code, data, message)
      if (typeof response.data === 'object') {
        // ??????code??��??????
        if (response.data.code === 200 || response.data.success) {
          if (Array.isArray(response.data.data)) {
            return response.data.data;
          }
        }
        // 处理嵌套的位置对象????????
        else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      // 处理直接的位置属性?????????
      else if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (parseError) {
      console.error('解析API响应失败:', parseError);
    }
    
    console.warn('无法识别的API响应格式');
    return [];
  };

  /**
   * 过滤并增强设备数据
   * 仅保留可用设备并添加必要的显示信息
   */
  const filterAndEnhanceDevices = (devices: any[]): any[] => {
    return devices.filter((device: any) => {
      // 只保留状态为可用(0)的设备
      return device && typeof device === 'object' && device.status === 0;
    }).map((device: any) => ({
      ...device,
      // 验证设备选择????????????
      typeName: getTypeName(device),
      locationName: getLocationName(device),
      // 确保每个设备都有唯一的显示ID
      displayId: device.id || device.deviceId || Math.random().toString(36).substr(2, 9),
      // ???name??��???
      name: device.name || `设备-${device.id || ''}`
    }));
  };

  /**
   * 获取设备类型名称
   * 支持嵌套对象和直接属性两种格式
   */
  const getTypeName = (device: any): string => {
    if (!device) return '';
    // 验证预约人姓名????
    if (device.type && typeof device.type === 'object') {
      return device.type.name || device.type.typeName || '';
    }
    // 验证联系方式
    return device.typeName || device.type || '';
  };

  /**
   * 获取设备位置名称
   * 支持嵌套对象和直接属性两种格式
   */
  const getLocationName = (device: any): string => {
    if (!device) return '';
    // 验证预约事由?????
    if (device.location && typeof device.location === 'object') {
      return device.location.name || device.location.locationName || '';
    }
    // ?????????
    return device.locationName || device.location || '';
  };

  /**
   * 对设备列表进行排序
   * 先按类型名称排序，再按设备名称排序
   */
  const sortDevices = (devices: any[]): any[] => {
    return [...devices].sort((a, b) => {
      // 首先按设备类型名称排序
      const typeCompare = (a.typeName || '').localeCompare(b.typeName || '');
      if (typeCompare !== 0) return typeCompare;
      // 然后按设备名称排序
      return (a.name || '').localeCompare(b.name || '');
    });
  };

  /**
   * 处理表单字段变更
   */
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的验证错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // 注意：位置和类型变更时，设备列表会通过useEffect自动更新
    // 这里不需要额外调用loadDevices
  };

  // 注意：以下方法会被handleDateTimeChange替代
  // 保留注释是为了说明设计思路和历史变更

    // 获取下一个整点时间
  const getNextHour = (): Date => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour;
  };

  // 计算预约结束时间
  const calculateEndTime = (startTime?: Date | null): Date => {
    if (startTime) {
      // 预约时长默认为1小时
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      return endTime;
    } else {
      // 默认从当前时间的下一个整点开始，时长1小时
      const nextHour = getNextHour();
      nextHour.setHours(nextHour.getHours() + 1);
      return nextHour;
    }
  };

  /**
   * 处理日期时间选择变更
   */
  const handleDateTimeChange = (field: keyof FormData, value: string | string[] | Date | Date[] | undefined) => {
    let targetValue: Date;
    
    // 处理空值情况，设置默认值
    if (!value || (Array.isArray(value) && value.length === 0)) {
      if (field === 'startTime') {
        // 默认选择当前时间的下一个整点
        targetValue = getNextHour();
      } else if (field === 'endTime') {
        // 根据开始时间计算结束时间，默认相差1小时
        const startTimeValue = formData.startTime ? new Date(formData.startTime) : null;
        targetValue = calculateEndTime(startTimeValue);
      } else {
        // 忽略其他字段类型
        return;
      }
      const formattedDateTime = targetValue.toISOString();
      handleInputChange(field, formattedDateTime);
    } else if (value && !Array.isArray(value) && value instanceof Date) {
      // 将Date对象转换为ISO字符串格式
      handleInputChange(field, value.toISOString());
    } else if (value && !Array.isArray(value) && typeof value === 'string') {
      handleInputChange(field, value);
    }
  };

  /**
   * 表单验证函数
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // ????��???
    if (!formData.deviceId) {
      newErrors.deviceId = '请选择设备';
    }
    
    // 验证开始时间
    if (!formData.startTime) {
      newErrors.startTime = '请选择开始时间';
    } else {
      // 验证开始时间必须大于当前时间
      const startTime = new Date(formData.startTime);
      const now = new Date();
      if (startTime <= now) {
        newErrors.startTime = '开始时间必须大于当前时间';
      }
    }
    
    if (!formData.endTime) {
      newErrors.endTime = '请选择结束时间';
    } else {
      // 验证结束时间必须大于开始时间
      if (formData.startTime) {
        const startTime = new Date(formData.startTime);
        const endTime = new Date(formData.endTime);
        if (endTime <= startTime) {
          newErrors.endTime = '结束时间必须大于开始时间';
        }
      }
    }
    
    // ??????????
    if (!formData.userName || formData.userName.trim().length === 0) {
      newErrors.userName = '请输入预约人姓名';
    }
    
    // ?????????
    if (!formData.userContact || formData.userContact.trim().length === 0) {
      newErrors.userContact = '请输入联系方式';
    } else {
      // 验证联系方式格式（邮箱或手机号）
      const contactRegex = /^[\w.+-]+@[\w-]+\.[\w.-]+$|^\d{11}$/;
      if (!contactRegex.test(formData.userContact)) {
        newErrors.userContact = '请输入有效的邮箱或手机号';
      }
    }
    
    // ?????????
    if (!formData.reason || formData.reason.trim().length === 0) {
      newErrors.reason = '请输入预约事由';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('请先填写并验证表单中的必填项');
      return;
    }

    try {
      setLoading(true);
      // 确保deviceId为数字类型，以符合API要求
      const deviceId = formData.deviceId as number;
      
      // 准备提交给API的数据对象
      // startTime和endTime已经是ISO格式字符串
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
      
      // ???????
      resetForm();
    } catch (error: any) {
      console.error('预约失败:', error);
      // 显示友好的错误提示
      if (error.message) {
        alert(`错误: ${error.message}`);
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
   * 处理模态框关闭
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
        // 解决React 18兼容性问题
        autoFocus={false}
        getContainer={() => document.body}
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
            提交
          </Button>
        ]}
        width={600}
      >
        <div className="form-container">
          {/* 地点选择 */}
          <div className="form-item" ref={locationSelectRef}>
            <label className="form-label">地点 {errors.locationId && <span className="error-text">{errors.locationId}</span>}</label>
            <Select
              placeholder="请选择地点"
              value={formData.locationId}
              onChange={(value) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  handleInputChange('locationId', value);
                }
              }}
              loading={locationsLoading}
              getPopupContainer={() => {
                // 使用当前ref的父元素挂载到body
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
            <label className="form-label">类型 {errors.typeId && <span className="error-text">{errors.typeId}</span>}</label>
            <Select
              placeholder="请选择类型"
              value={formData.typeId}
              onChange={(value) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  handleInputChange('typeId', value);
                }
              }}
              loading={typesLoading}
              getPopupContainer={() => {
                // 使用当前ref的父元素挂载到body
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
            <label className="form-label">设备 {errors.deviceId && <span className="error-text">{errors.deviceId}</span>}</label>
            <Select
              placeholder={deviceLoadError ? deviceLoadError : "请选择设备"}
              value={formData.deviceId}
              onChange={(value) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  handleInputChange('deviceId', value);
                }
              }}
              loading={loading}
              disabled={!formData.locationId && !formData.typeId || deviceLoadError !== null}
              getPopupContainer={() => {
                // ????????ref??????????????body
                return deviceSelectRef.current || document.body;
              }}
            >
              {loading ? (
                <Select.Option value={undefined} disabled>
                  加载设备中...
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
                  {deviceLoadError ? deviceLoadError : '暂无符合条件的设备'}
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

          {/* 开始时间 */}
          <div className="form-item">
            <label className="form-label">开始时间 {errors.startTime && <span className="error-text">{errors.startTime}</span>}</label>
            <DatePicker
              placeholder="请选择开始时间"
              format="yyyy-MM-dd HH:mm"
              type="dateTime"
              value={formData.startTime ? new Date(formData.startTime) : undefined}
              onChange={(value) => handleDateTimeChange('startTime', value)}
              onOpenChange={(open) => {
                // 当打开日期选择器时，如果没有设置开始时间则设置为下一个整点
                if (open && !formData.startTime) {
                  const defaultTime = getNextHour();
                  handleDateTimeChange('startTime', defaultTime);
                }
              }}
              disabledDate={(currentDate) => {
                // 禁用过去的日期选择
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return !!currentDate && currentDate < today;
              }}
            />
          </div>

          <div className="form-item">
            <label className="form-label">结束时间 {errors.endTime && <span className="error-text">{errors.endTime}</span>}</label>
            <DatePicker
              placeholder="请选择结束时间"
              format="yyyy-MM-dd HH:mm"
              type="dateTime"
              value={formData.endTime ? new Date(formData.endTime) : undefined}
              onChange={(value) => handleDateTimeChange('endTime', value)}
              onOpenChange={(open) => {
                // 当打开日期选择器时，如果没有设置结束时间则根据开始时间计算
                if (open && !formData.endTime) {
                  const startTimeValue = formData.startTime ? new Date(formData.startTime) : null;
                  const defaultEndTime = calculateEndTime(startTimeValue);
                  handleDateTimeChange('endTime', defaultEndTime);
                }
              }}
              disabledDate={(currentDate) => {
                // 禁用过去的日期选择
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return !!currentDate && currentDate < today;
              }}
            />
          </div>

          {/* 用户信息 */}
          <div className="form-item">
            <label className="form-label">预约人 {errors.userName && <span className="error-text">{errors.userName}</span>}</label>
            <Input
              placeholder="请输入预约人姓名"
              value={formData.userName}
              onChange={(value) => handleInputChange('userName', value)}
            />
          </div>

          <div className="form-item">
            <label className="form-label">联系电话 {errors.userContact && <span className="error-text">{errors.userContact}</span>}</label>
            <Input
              placeholder="请输入联系电话"
              value={formData.userContact}
              onChange={(value) => handleInputChange('userContact', value)}
            />
            <div className="form-help">请输入有效的联系电话</div>
          </div>

          {/* 预约事由 */}
          <div className="form-item">
            <label className="form-label">预约事由 {errors.reason && <span className="error-text">{errors.reason}</span>}</label>
            <TextArea
              placeholder="请输入预约事由"
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