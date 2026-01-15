import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Empty, Spin, Tooltip, Tag } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import type { Device, Reservation } from '../types';
import type { ReservationStatus } from '../types';
import { deviceApi, reservationApi } from '../services/api';

interface CalendarViewProps {
  selectedLocationId?: number;
  selectedTypeId?: number;
  selectedDate: string;
  onCellClick: (deviceId: number, deviceName: string, startTime: string, endTime: string) => void;
}

const { Text } = Typography;

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedLocationId,
  selectedTypeId,
  selectedDate,
  onCellClick,
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 生成时间段（05:00 - 22:00，按小时划分）
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 5 + i;
    return {
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
    };
  });

  // 加载设备和预约数据
  useEffect(() => {
    // 当组件重新渲染时（比如由于key变化），确保重新加载最新数据
    console.log('CalendarView重新加载数据，日期:', selectedDate);
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 加载设备数据，确保只传递有效的数字参数
        const params: { locationId?: number; typeId?: number } = {};
        
        // 只添加有效的、非空且非NaN的参数
        if (typeof selectedLocationId === 'number' && selectedLocationId > 0 && !isNaN(selectedLocationId)) {
          params.locationId = selectedLocationId;
        }
        if (typeof selectedTypeId === 'number' && selectedTypeId > 0 && !isNaN(selectedTypeId)) {
          params.typeId = selectedTypeId;
        }
        
        console.log('构建的API参数:', params);
        
        // 重置状态
        setDevices([]);
        setReservations([]);
        
        // 加载设备数据
        console.log('开始加载设备数据，参数:', params);
        const devicesResponse = await deviceApi.getDevices(params);
        
        // 安全地处理设备数据响应
        let deviceData: Device[] = [];
        if (devicesResponse?.data) {
          if (Array.isArray(devicesResponse.data)) {
            deviceData = devicesResponse.data;
          } else if (typeof devicesResponse.data === 'object') {
            deviceData = Array.isArray(devicesResponse.data.data) ? devicesResponse.data.data : [];
          }
        }
        
        console.log('设备数据加载完成:', deviceData.length, '条');
        setDevices(deviceData);
        
        // 如果有设备且日期有效，加载预约数据
        if (deviceData.length > 0 && selectedDate) {
          console.log('开始加载预约数据，日期:', selectedDate);
          const reservationsResponse = await reservationApi.getReservations({
            date: selectedDate,
          });
          
          // 安全地处理预约数据响应
          let reservationsData: Reservation[] = [];
          if (reservationsResponse?.data) {
            if (Array.isArray(reservationsResponse.data)) {
              reservationsData = reservationsResponse.data;
            } else if (typeof reservationsResponse.data === 'object') {
              reservationsData = Array.isArray(reservationsResponse.data.data) ? reservationsResponse.data.data : [];
            }
          }
          
          console.log('预约数据加载完成:', reservationsData.length, '条');
          setReservations(reservationsData);
        }
      } catch (err: any) {
        // 提供更具体的错误信息
        const errorMessage = err?.message || '加载数据失败，请稍后重试';
        console.error('数据加载错误:', err);
        
        // 根据错误类型设置更友好的消息
        if (err?.message?.includes('网络错误')) {
          setError('网络连接异常，请检查您的网络连接后重试');
        } else if (err?.message?.includes('服务器内部错误')) {
          setError('服务器暂时不可用，请稍后再试');
        } else {
          setError(`数据加载失败: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    // 仅在日期有效时加载数据
    if (selectedDate) {
      loadData();
    } else {
      setLoading(false);
      setError('日期无效');
    }
  }, [selectedLocationId, selectedTypeId, selectedDate]); // 确保所有相关依赖都包含在内

  // 检查指定设备在指定时间段是否有预约
  const getReservationForSlot = (
    deviceId: number,
    slotStartTime: string
  ): Reservation | undefined => {
    const slotStartDateTime = dayjs(`${selectedDate} ${slotStartTime}`);
    
    return reservations.find(reservation => 
      reservation.deviceId === deviceId &&
      dayjs(reservation.startTime).isSame(slotStartDateTime, 'hour')
    );
  };

  // 渲染时间槽单元格
  // 获取设备名称的辅助函数
const getDeviceName = (deviceId: number): string => {
  const device = devices.find(d => d.id === deviceId);
  return device ? device.name : `设备${deviceId}`;
};

// 将预约状态码转换为中文文本
const getReservationStatusText = (status: ReservationStatus): string => {
  switch (status) {
    case 0:
      return '待确认';
    case 1:
      return '已确认';
    case 2:
      return '已取消';
    default:
      return '未知状态';
  }
};

// 格式化时间显示
const formatTime = (timeString: string): string => {
  return dayjs(timeString).format('HH:mm');
};

// 构建Tooltip内容
const buildTooltipContent = (reservation: Reservation): string => {
  return `预约人：${reservation.userName || '未知'}
联系方式：${reservation.userContact || '未提供'}
时间段：${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}
事由：${reservation.reason || '未提供'}
状态：${getReservationStatusText(reservation.status)}`;
};

const renderTimeSlot = (deviceId: number, slot: { startTime: string; endTime: string }) => {
    const reservation = getReservationForSlot(deviceId, slot.startTime);
    const deviceName = getDeviceName(deviceId);
    
    if (reservation) {
      // 已预约的时间段
      return (
        <Tooltip 
          content={<div style={{ whiteSpace: 'pre-line' }}>{buildTooltipContent(reservation)}</div>}
          position="top"
        >
          <div 
            style={{ 
              backgroundColor: '#fff1f0', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'not-allowed',
              borderRadius: '4px',
              border: '1px solid #ffccc7'
            }}
          >
            <Tag color="red" size="small">已预约</Tag>
          </div>
        </Tooltip>
      );
    } else {
      // 空闲的时间段
      return (
        <div 
          style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'all 0.2s',
            border: '1px solid transparent'
          }}
          onClick={() => onCellClick(deviceId, deviceName, slot.startTime, slot.endTime)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f5ff';
            e.currentTarget.style.borderColor = '#adc6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <Tag color="green" size="small">空闲</Tag>
        </div>
      );
    }
  };

  // 构建表格数据
  const tableData = devices.map(device => {
    const data: any = {
      key: device.id,
      deviceName: device.name,
    };
    
    // 为每个时间段创建属性
    timeSlots.forEach(slot => {
      data[`time_${slot.startTime}`] = (
        <div style={{ height: '50px' }}>
          {renderTimeSlot(device.id, slot)}
        </div>
      );
    });
    
    return data;
  });

  // 构建表格列
  const buildColumns = () => {
    // 定义列配置类型，使fixed属性变为可选
    interface ColumnConfig {
      key: string;
      title: string;
      dataIndex: string;
      width: number;
      fixed?: string;
      className: string;
    }

    const columns: ColumnConfig[] = [
      {
        key: "deviceName",
        title: "设备",
        dataIndex: "deviceName",
        width: 120,
        fixed: "left",
        className: "device-name-column"
      },
    ];
    
    // 添加时间段列
    timeSlots.forEach(slot => {
      columns.push({
        key: slot.startTime,
        title: slot.startTime,
        dataIndex: `time_${slot.startTime}`,
        width: 120,
        className: "time-slot-column"
      });
    });
    
    return columns;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px', color: '#F5222D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text>{error}</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', marginTop: 0, textAlign: 'center' }}>
        {selectedDate} 设备预约情况
      </div>
      {devices.length === 0 ? (
        <Empty description="暂无设备数据" />
      ) : (
        <Table
          columns={buildColumns() as any}
          dataSource={tableData}
          scroll={{ x: 'max-content' }}
          pagination={false}
          size="small"
          rowKey="key"
          style={{ minHeight: '400px' }}
        />
      )}
    </Card>
  );
};

export default CalendarView;