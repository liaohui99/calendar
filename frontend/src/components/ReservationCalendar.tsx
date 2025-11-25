import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Button, Modal, Card, Typography, Space, Row, Col, Input, Tag, Tooltip, TextArea } from '@douyinfe/semi-ui';
import dayjs, { Dayjs } from 'dayjs';
import { deviceApi, locationApi, typeApi, reservationApi } from '../services/api';
import type { Device, LocationInfo, DeviceType, Reservation } from '../types';
import GeneralReservationForm from './GeneralReservationForm';

const { Text } = Typography;
const { Option } = Select;

const ReservationCalendar: React.FC = () => {
  // ??????
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [devices, setDevices] = useState<Device[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(''); // ??§Φ?????
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // ???????????
  useEffect(() => {
    loadBaseData();
  }, []);
  
  // ??????????????£????????υτ????????
  useEffect(() => {
    loadDevicesAndReservations();
  }, [date, selectedLocation, selectedType]);
  
  /**
   * ?????????????????υτ????
   */
  const loadBaseData = async () => {
    try {
      const [locationsRes, typesRes] = await Promise.all([
        locationApi.getLocations(),
        typeApi.getTypes()
      ]);
      // ???????ApiResponse?????????
      setLocations((locationsRes.data && Array.isArray(locationsRes.data)) ? locationsRes.data : []);
      setDeviceTypes((typesRes.data && Array.isArray(typesRes.data)) ? typesRes.data : []);
      // ?????????§Φ????????????
      const locationsData = Array.isArray(locationsRes.data) ? locationsRes.data : (locationsRes.data?.data || []);
      const typesData = Array.isArray(typesRes.data) ? typesRes.data : (typesRes.data?.data || []);
      if (locationsData.length > 0) {
        setSelectedLocation(locationsData[0].id.toString());
      }
      if (typesData.length > 0) {
        setSelectedType(typesData[0].id.toString());
      }
    } catch (error) {
      console.error('??????????????');
    }
  };
  
  /**
   * ?????υτ????????
   */
  const loadDevicesAndReservations = async () => {
    setLoading(true);
    try {
      const dateStr = date.format('YYYY-MM-DD');
      
      // ?????υτ?§Ò?????????????§Ή?????????
      const params: { locationId?: number; typeId?: number } = {};
      if (selectedLocation && !isNaN(parseInt(selectedLocation))) {
        params.locationId = parseInt(selectedLocation);
      }
      if (selectedType && !isNaN(parseInt(selectedType))) {
        params.typeId = parseInt(selectedType);
      }
      const devicesRes = await deviceApi.getDevices(params);
      // ???????API???????
      const devicesData = Array.isArray(devicesRes.data) ? devicesRes.data : (devicesRes.data?.data || []);
      setDevices(devicesData);
      
      // ?????????
      const reservationsRes = await reservationApi.getReservations({ date: dateStr });
      const reservationsData = Array.isArray(reservationsRes.data) ? reservationsRes.data : (reservationsRes.data?.data || []);
      setReservations(reservationsData);
    } catch (error) {
      console.error('???????????');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * ????????§µ?5:00-22:00??
   */
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };
  
  /**
   * ??????????????
   */
  const checkTimeSlot = (deviceId: number, timeStr: string) => {
    const currentTime = dayjs(`${date.format('YYYY-MM-DD')} ${timeStr}`);
    
    for (const reservation of reservations) {
      if (reservation.deviceId === deviceId) {
        const startTime = dayjs(reservation.startTime);
        const endTime = dayjs(reservation.endTime);
        
        // ????????????
        if (currentTime.isAfter(startTime) && currentTime.isBefore(endTime)) {
          return reservation;
        }
      }
    }
    
    return null;
  };
  
  /**
   * ?????υτ???
   */
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
  };
  
  /**
   * ????????£
   */
  const handleDateChange = (value: Dayjs | null) => {
    if (value) {
      setDate(value);
    }
  };
  
  /**
   * ???????
   */
  const handleRefresh = () => {
    loadDevicesAndReservations();
  };
  
  /**
   * ????????
   */
  const handleNewReservation = async () => {
    try {
      setModalLoading(true);
      
      // ??????????
      const startHour = selectedTimeSlot ? parseInt(selectedTimeSlot) : 8;
      const endHour = startHour + 1;
      
      // ???????
      await reservationApi.createReservation({
        deviceId: selectedDevice?.id || 0,
        userName: '', // ??????????????????
        userContact: '', // ??????????????????
        startTime: `${date.format('YYYY-MM-DD')} ${startHour.toString().padStart(2, '0')}:00:00`,
        endTime: `${date.format('YYYY-MM-DD')} ${endHour.toString().padStart(2, '0')}:00:00`,
        reason: '' // ??????????????????
      });
      
      setShowModal(false);
      // ????????????
      setSelectedTimeSlot('');
      loadDevicesAndReservations(); // ???????????
    } catch (error) {
      console.error('?????:', error);
    } finally {
      setModalLoading(false);
    }
  };
  
  /**
   * ??????????? - ???GeneralReservationForm???
   */
  const openNewReservationModal = () => {
    if (selectedDevice) {
      // ??????????
      const startHour = selectedTimeSlot ? parseInt(selectedTimeSlot) : 8;
      const endHour = startHour + 1;
      
      // ?????????????
      const startTime = `${date.format('YYYY-MM-DD')} ${startHour.toString().padStart(2, '0')}:00:00`;
      const endTime = `${date.format('YYYY-MM-DD')} ${endHour.toString().padStart(2, '0')}:00:00`;
      
      // ???GeneralReservationForm???
      setShowModal(true);
    } else {
      console.warn('???????????υτ');
    }
  };
  
  const timeSlots = generateTimeSlots();
  
  return (
    <div style={{ width: '100%', padding: '16px' }}>
      {/* ?????? */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} md={10}>
            <Space align="center" wrap style={{ width: '100%' }}>
              <Tag color="blue" style={{ borderRadius: '8px' }}>?</Tag>
              <Text>???????:</Text>
              <DatePicker
                value={date.toDate()}
                onChange={(value) => {
                  // ????????????????????
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
              <Text type="secondary">({date.format('M??D??')} {['????', '???', '???', '????', '????', '????', '????'][date.day()]})</Text>
              <button
                type="button"
                onClick={() => setDate(date.subtract(1, 'day'))}
                style={{ marginRight: '8px' }}
              >
                ????
              </button>
              <button
                type="button"
                onClick={() => setDate(date.add(1, 'day'))}
                style={{ marginLeft: '8px' }}
              >
                ?????
              </button>
            </Space>
          </Col>
          <Col xs={24} md={14}>
            <Space align="center" wrap style={{ width: '100%' }}>
              <Space align="center" wrap={false}>
                <Text style={{ whiteSpace: 'nowrap' }}>???:</Text>
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
                <Text style={{ whiteSpace: 'nowrap' }}>?υτ????:</Text>
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
                  <span>???</span>
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
                  <span>???????</span>
                </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* ???????? */}
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
                <th style={{ width: 80 }}>?υτ</th>
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
      
      {/* ????????? */}
      <GeneralReservationForm
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          loadDevicesAndReservations(); // ??????????????
        }}
        preSelectedDeviceId={selectedDevice?.id}
        preSelectedStartTime={selectedTimeSlot ? `${date.format('YYYY-MM-DD')} ${parseInt(selectedTimeSlot).toString().padStart(2, '0')}:00:00` : `${date.format('YYYY-MM-DD')} 08:00:00`}
        preSelectedEndTime={selectedTimeSlot ? `${date.format('YYYY-MM-DD')} ${(parseInt(selectedTimeSlot) + 1).toString().padStart(2, '0')}:00:00` : `${date.format('YYYY-MM-DD')} 09:00:00`}
      />
    </div>
  );
};

export default ReservationCalendar;