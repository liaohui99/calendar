import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Button, Modal, Card, Typography, Space, Row, Col, Input, Tag, Tooltip, TextArea } from '@douyinfe/semi-ui';
import dayjs, { Dayjs } from 'dayjs';
import { deviceApi, locationApi, typeApi, reservationApi } from '../services/api';
import type { Device, LocationInfo, DeviceType, Reservation } from '../types';
import GeneralReservationForm from './GeneralReservationForm';

const { Text } = Typography;
const { Option } = Select;

const ReservationCalendar: React.FC = () => {
  // 状态管理
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [devices, setDevices] = useState<Device[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(''); // 选中的时间槽
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // 加载基础数据
  useEffect(() => {
    loadBaseData();
  }, []);
  
  // 当日期或筛选条件变化时，加载设备和预约数据
  useEffect(() => {
    loadDevicesAndReservations();
  }, [date, selectedLocation, selectedType]);
  
  /**
   * 加载基础数据：地点和设备类型
   */
  const loadBaseData = async () => {
    try {
      const [locationsRes, typesRes] = await Promise.all([
        locationApi.getLocations(),
        typeApi.getTypes()
      ]);
      // 正确处理ApiResponse类型的数据
      setLocations((locationsRes.data && Array.isArray(locationsRes.data)) ? locationsRes.data : []);
      setDeviceTypes((typesRes.data && Array.isArray(typesRes.data)) ? typesRes.data : []);
      // 设置默认选中第一个地点和类型
      const locationsData = Array.isArray(locationsRes.data) ? locationsRes.data : (locationsRes.data?.data || []);
      const typesData = Array.isArray(typesRes.data) ? typesRes.data : (typesRes.data?.data || []);
      if (locationsData.length > 0) {
        setSelectedLocation(locationsData[0].id.toString());
      }
      if (typesData.length > 0) {
        setSelectedType(typesData[0].id.toString());
      }
    } catch (error) {
      console.error('加载基础数据失败');
    }
  };
  
  /**
   * 加载设备和预约数据
   */
  const loadDevicesAndReservations = async () => {
    setLoading(true);
    try {
      const dateStr = date.format('YYYY-MM-DD');
      
      // 加载设备列表，确保只传递有效的数字参数
      const params: { locationId?: number; typeId?: number } = {};
      if (selectedLocation && !isNaN(parseInt(selectedLocation))) {
        params.locationId = parseInt(selectedLocation);
      }
      if (selectedType && !isNaN(parseInt(selectedType))) {
        params.typeId = parseInt(selectedType);
      }
      const devicesRes = await deviceApi.getDevices(params);
      // 正确处理API响应数据
      const devicesData = Array.isArray(devicesRes.data) ? devicesRes.data : (devicesRes.data?.data || []);
      setDevices(devicesData);
      
      // 加载当天预约
      const reservationsRes = await reservationApi.getReservations({ date: dateStr });
      const reservationsData = Array.isArray(reservationsRes.data) ? reservationsRes.data : (reservationsRes.data?.data || []);
      setReservations(reservationsData);
    } catch (error) {
      console.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 生成时间列（5:00-22:00）
   */
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };
  
  /**
   * 检查时间段是否有预约
   */
  const checkTimeSlot = (deviceId: number, timeStr: string) => {
    const currentTime = dayjs(`${date.format('YYYY-MM-DD')} ${timeStr}`);
    
    for (const reservation of reservations) {
      if (reservation.deviceId === deviceId) {
        const startTime = dayjs(reservation.startTime);
        const endTime = dayjs(reservation.endTime);
        
        // 检查时间是否重叠
        if (currentTime.isAfter(startTime) && currentTime.isBefore(endTime)) {
          return reservation;
        }
      }
    }
    
    return null;
  };
  
  /**
   * 处理设备选择
   */
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
  };
  
  /**
   * 处理日期变化
   */
  const handleDateChange = (value: Dayjs | null) => {
    if (value) {
      setDate(value);
    }
  };
  
  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    loadDevicesAndReservations();
  };
  
  /**
   * 处理预约提交
   */
  const handleNewReservation = async () => {
    try {
      setModalLoading(true);
      
      // 计算预约时间段
      const startHour = selectedTimeSlot ? parseInt(selectedTimeSlot) : 8;
      const endHour = startHour + 1;
      
      // 提交预约信息
      await reservationApi.createReservation({
        deviceId: selectedDevice?.id || 0,
        userName: '', // 简化实现，实际应从表单获取
        userContact: '', // 简化实现，实际应从表单获取
        startTime: `${date.format('YYYY-MM-DD')} ${startHour.toString().padStart(2, '0')}:00:00`,
        endTime: `${date.format('YYYY-MM-DD')} ${endHour.toString().padStart(2, '0')}:00:00`,
        reason: '' // 简化实现，实际应从表单获取
      });
      
      setShowModal(false);
      // 重置选择的时间槽
      setSelectedTimeSlot('');
      loadDevicesAndReservations(); // 重新加载数据
    } catch (error) {
      console.error('预约失败:', error);
    } finally {
      setModalLoading(false);
    }
  };
  
  /**
   * 打开新建预约模态框 - 使用GeneralReservationForm组件
   */
  const openNewReservationModal = () => {
    if (selectedDevice) {
      // 计算预约时间段
      const startHour = selectedTimeSlot ? parseInt(selectedTimeSlot) : 8;
      const endHour = startHour + 1;
      
      // 格式化时间字符串
      const startTime = `${date.format('YYYY-MM-DD')} ${startHour.toString().padStart(2, '0')}:00:00`;
      const endTime = `${date.format('YYYY-MM-DD')} ${endHour.toString().padStart(2, '0')}:00:00`;
      
      // 使用GeneralReservationForm组件
      setShowModal(true);
    } else {
      console.warn('请先选择一个设备');
    }
  };
  
  const timeSlots = generateTimeSlots();
  
  return (
    <div style={{ width: '100%', padding: '16px' }}>
      {/* 筛选条件 */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} md={10}>
            <Space align="center" wrap style={{ width: '100%' }}>
              <Tag color="blue" style={{ borderRadius: '8px' }}>📅</Tag>
              <Text>选择日期:</Text>
              <DatePicker
                value={date.toDate()}
                onChange={(value) => {
                  // 处理可能的多种类型输入
                  if (value instanceof Date) {
                    handleDateChange(dayjs(value));
                  } else if (Array.isArray(value) && value.length > 0) {
                    handleDateChange(dayjs(value[0]));
                  } else if (typeof value === 'string') {
                    handleDateChange(dayjs(value));
                  } else {
                    handleDateChange(null);
                  }
                }}
                style={{ width: '100%', maxWidth: '180px' }}
              />
              <Text type="secondary">({date.format('M月D日')} {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.day()]})</Text>
              <button
                type="button"
                onClick={() => setDate(date.subtract(1, 'day'))}
                style={{ marginRight: '8px' }}
              >
                前一天
              </button>
              <button
                type="button"
                onClick={() => setDate(date.add(1, 'day'))}
                style={{ marginLeft: '8px' }}
              >
                后一天
              </button>
            </Space>
          </Col>
          <Col xs={24} md={14}>
            <Space align="center" wrap style={{ width: '100%' }}>
              <Space align="center" wrap={false}>
                <Text style={{ whiteSpace: 'nowrap' }}>地点:</Text>
                <Select
                  value={selectedLocation}
                  onChange={(value) => setSelectedLocation(String(value))}
                  style={{ width: '100%', maxWidth: '150px' }}
                >
                  {locations.map(location => (
                    <Option key={location.id} value={location.id.toString()}>
                      {location.name}
                    </Option>
                  ))}
                </Select>
              </Space>
              <Space align="center" wrap={false}>
                <Text style={{ whiteSpace: 'nowrap' }}>设备类型:</Text>
                <Select
                  value={selectedType}
                  onChange={(value: any) => setSelectedType(String(value))}
                  style={{ width: '100%', maxWidth: '100px' }}
                >
                  {deviceTypes.map(type => (
                    <Option key={type.id} value={type.id.toString()}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Space>
              <Button
                  size="small"
                  icon="reload"
                  onClick={handleRefresh}
                  loading={loading}
                  style={{ borderRadius: '8px', margin: '4px 0', textAlign: 'center' }}
                  iconOnly={false}
                >
                  <span>刷新</span>
                </Button>
              <Button
                  size="small"
                  type="primary"
                  icon="plus"
                  onClick={openNewReservationModal}
                  disabled={!selectedDevice}
                  style={{ borderRadius: '8px', margin: '4px 0', textAlign: 'center' }}
                  iconOnly={false}
                >
                  <span>新建预约单</span>
                </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* 日历网格 */}
      <Card style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <div className="calendar-grid" style={{ 
          borderRadius: '8px', 
          overflow: 'hidden', 
          overflowX: 'auto',
          display: 'block',
          maxWidth: '100%'
        }}>
          <table className="reservation-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>设备</th>
                {timeSlots.map(time => (
                  <th key={time} style={{ width: 60 }}>{time}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <tr key={device.id}>
                  <td 
                    onClick={() => handleDeviceSelect(device)}
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: selectedDevice?.id === device.id ? '#e6f7ff' : 'white' 
                    }}
                  >
                    {device.name}
                  </td>
                  {timeSlots.map(time => {
                    const reservation = checkTimeSlot(device.id, time);
                    const isSelectedTimeSlot = selectedDevice?.id === device.id && selectedTimeSlot === time;
                    return (
                      <td
                        key={`${device.id}-${time}`}
                        style={{
                          backgroundColor: reservation ? '#ffccc7' : 
                                         isSelectedTimeSlot ? '#bae7ff' : '#f0f0f0',
                          position: 'relative',
                          cursor: reservation ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          padding: '2px',
                          border: isSelectedTimeSlot ? '2px solid #1890ff' : '1px solid transparent'
                        }}
                        onClick={() => {
                          if (!reservation) {
                            setSelectedDevice(device);
                            setSelectedTimeSlot(time);
                          }
                        }}
                      >
                        {reservation ? (
                          <Tooltip content={`${reservation.userName}\n${reservation.reason || ''}`}>
                            <Tag color="red" style={{ fontSize: '10px', padding: '2px 4px' }}>
                              {reservation.userName}
                            </Tag>
                          </Tooltip>
                        ) : (
                          <div />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* 新建预约模态框 */}
      <GeneralReservationForm
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          loadDevicesAndReservations(); // 成功后刷新预约数据
        }}
        preSelectedDeviceId={selectedDevice?.id}
        preSelectedStartTime={selectedTimeSlot ? `${date.format('YYYY-MM-DD')} ${parseInt(selectedTimeSlot).toString().padStart(2, '0')}:00:00` : `${date.format('YYYY-MM-DD')} 08:00:00`}
        preSelectedEndTime={selectedTimeSlot ? `${date.format('YYYY-MM-DD')} ${(parseInt(selectedTimeSlot) + 1).toString().padStart(2, '0')}:00:00` : `${date.format('YYYY-MM-DD')} 09:00:00`}
      />
    </div>
  );
};

export default ReservationCalendar;