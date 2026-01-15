import React, { useState, useCallback } from 'react';
import { Typography, Button } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import CalendarView from '../components/CalendarView';
import FilterComponent from '../components/FilterComponent';
import ReservationFormModal from '../components/ReservationFormModal';
import GeneralReservationForm from '../components/GeneralReservationForm';


// 导入Typography布局组件
const { Title } = Typography;

const DeviceReservationPage: React.FC = () => {
  const navigate = useNavigate();
  // 状态管理
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  // 刷新触发器 - 用于强制重新渲染日历视图
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // 模态框显示状态
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

  // 处理查看所有预约按钮点击
  const handleViewAllReservations = useCallback(() => {
    navigate('/reservations');
  }, [navigate]);

  // 处理通用预约成功
  const handleGeneralReservationSuccess = useCallback(() => {
    // ???????
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  // 处理日历单元格点击
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
    // ??????????????
    console.log('预约成功');
    // ?????????????????CalendarView???????????
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="page-layout" style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <header style={{ 
          backgroundColor: 'var(--bg-primary)', 
          padding: '16px 24px', 
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid var(--border-primary)'
        }}>
          <Title style={{ 
            margin: 0, 
            color: 'var(--text-primary)', 
            fontSize: '20px',
            fontWeight: 700
          }}>
            设备预约系统
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* AI助手按钮 */}
            <Button 
              icon="chat" 
              onClick={() => navigate('/chat')} 
              size="small"
              type="secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              AI助手
            </Button>
            <Button 
              onClick={handleViewAllReservations}
              type="primary"
              size="small"
            >
              查看所有预约
            </Button>
          </div>
        </header>
        <main className="page-content" style={{ 
          padding: '32px 24px', 
          backgroundColor: 'var(--bg-secondary)',
          minHeight: 'calc(100vh - 80px)',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%' 
        }}>
          {/* ????? */}
          <FilterComponent onFilterChange={handleFilterChange} onNewReservationClick={handleNewReservationClick} />
          
          {/* ?????????? */}
          <CalendarView 
            selectedLocationId={selectedLocationId}
            selectedTypeId={selectedTypeId}
            selectedDate={selectedDate}
            onCellClick={handleCellClick}
            key={`calendar-${refreshTrigger}`} // ???key?????????????????????????
          />
          
          {/* ?????????? */}
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
        </main>
    </div>
  );
};

export default DeviceReservationPage;