import React, { useState, useCallback } from 'react';
import { Typography } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import CalendarView from '../components/CalendarView';
import FilterComponent from '../components/FilterComponent';
import ReservationFormModal from '../components/ReservationFormModal';
import GeneralReservationForm from '../components/GeneralReservationForm';


// 移除未使用的Layout组件
const { Title } = Typography;

const DeviceReservationPage: React.FC = () => {
  // 筛选条件状态
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  // 刷新触发器 - 用于预约成功后强制刷新数据
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // 预约表单模态框状态
  const [showModal, setShowModal] = useState(false);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [selectedCellInfo, setSelectedCellInfo] = useState({
    deviceId: 0,
    startTime: '',
    endTime: '',
    deviceName: '',
  });
  
  // 处理筛选条件变化
  const handleFilterChange = useCallback((locationId?: number, typeId?: number, date?: string) => {
    setSelectedLocationId(locationId);
    setSelectedTypeId(typeId);
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  // 处理新建预约按钮点击
  const handleNewReservationClick = useCallback(() => {
    setShowGeneralModal(true);
  }, []);

  // 处理通用预约成功
  const handleGeneralReservationSuccess = useCallback(() => {
    // 刷新数据
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  // 处理单元格点击
  const handleCellClick = useCallback((deviceId: number, deviceName: string, startTime: string, endTime: string) => {
    setSelectedCellInfo({
      deviceId,
      deviceName,
      startTime,
      endTime,
    });
    setShowModal(true);
  }, []);
  
  // 处理预约成功
  const handleReservationSuccess = useCallback(() => {
    // 预约成功后刷新数据
    console.log('预约成功');
    // 更新刷新触发器，强制CalendarView重新加载数据
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="page-layout" style={{ minHeight: '100vh' }}>
      <div style={{ 
          backgroundColor: '#fff', 
          padding: '0 16px 0 24px', 
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <Title style={{ margin: 0, color: '#262626', fontSize: '18px' }}>
            设备预约系统
          </Title>
        </div>
        <div className="page-content" style={{ 
          padding: '24px', 
          backgroundColor: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%' 
        }}>
          {/* 筛选组件 */}
          <FilterComponent onFilterChange={handleFilterChange} onNewReservationClick={handleNewReservationClick} />
          
          {/* 日历视图组件 */}
          <CalendarView 
            selectedLocationId={selectedLocationId}
            selectedTypeId={selectedTypeId}
            selectedDate={selectedDate}
            onCellClick={handleCellClick}
            key={`calendar-${refreshTrigger}`} // 使用key强制组件重新渲染，确保数据刷新
          />
          
          {/* 预约表单模态框 */}
          <ReservationFormModal 
            visible={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={handleReservationSuccess}
            deviceId={selectedCellInfo.deviceId}
            startTime={selectedCellInfo.startTime}
            endTime={selectedCellInfo.endTime}
            date={selectedDate}
            deviceName={selectedCellInfo.deviceName}
          />
          
          <GeneralReservationForm
            visible={showGeneralModal}
            onClose={() => setShowGeneralModal(false)}
            onSuccess={handleGeneralReservationSuccess}
          />
        </div>
    </div>
  );
};

export default DeviceReservationPage;