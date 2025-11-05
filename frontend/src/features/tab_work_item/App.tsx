import React, { useState, useEffect } from 'react';
import { Spin, Layout, Typography } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import CalendarView from '../../components/CalendarView';
import FilterComponent from '../../components/FilterComponent';
import ReservationFormModal from '../../components/ReservationFormModal';

const { Content } = Layout;

/**
 * 飞书详情页入口组件
 * 负责初始化JSSDK、获取工作项上下文、渲染日历组件
 */
const TabApp: React.FC = () => {
  // 工作项上下文状态
  const [tabContext, setTabContext] = useState<{ spaceId: string; workObjectId: string; workItemId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选条件状态
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  // 刷新触发器 - 用于预约成功后强制刷新数据
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // 预约表单模态框状态
  const [showModal, setShowModal] = useState(false);
  const [selectedCellInfo, setSelectedCellInfo] = useState({
    deviceId: 0,
    startTime: '',
    endTime: '',
    deviceName: '',
  });
  
  /**
   * 初始化飞书JSSDK并获取工作项上下文
   */
  useEffect(() => {
    const initFeishuJSSDK = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 检查JSSDK是否可用
        if (!window.JSSDK || !window.JSSDK.tab) {
          throw new Error('飞书JSSDK未加载或不可用');
        }
        
        // 获取详情页Tab上下文
        console.log('正在获取飞书详情页上下文...');
        const context = await window.JSSDK.tab.getContext();
        console.log('获取到飞书详情页上下文:', context);
        
        setTabContext(context);
      } catch (err) {
        console.error('初始化飞书JSSDK失败:', err);
        setError(err instanceof Error ? err.message : '初始化失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };
    
    initFeishuJSSDK();
  }, []);
  
  /**
   * 处理筛选条件变化
   */
  const handleFilterChange = (locationId?: number, typeId?: number, date?: string) => {
    setSelectedLocationId(locationId);
    setSelectedTypeId(typeId);
    if (date) {
      setSelectedDate(date);
    }
  };
  
  /**
   * 处理单元格点击
   */
  const handleCellClick = (deviceId: number, deviceName: string, startTime: string, endTime: string) => {
    setSelectedCellInfo({
      deviceId,
      deviceName,
      startTime,
      endTime,
    });
    setShowModal(true);
  };
  
  /**
   * 处理预约成功
   */
  const handleReservationSuccess = () => {
    // 预约成功后刷新数据
    console.log('预约成功');
    // 更新刷新触发器，强制CalendarView重新加载数据
    setRefreshTrigger(prev => prev + 1);
  };
  
  // 加载中状态
  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          backgroundColor: '#f0f2f5'
        }}>
          <Spin tip="正在加载飞书详情页..." />
        </Content>
      </Layout>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ 
          padding: '24px', 
          textAlign: 'center',
          backgroundColor: '#f0f2f5'
        }}>
          <Typography.Title heading={4} style={{ color: '#f5222d' }}>JSSDK初始化失败</Typography.Title>
          <p style={{ color: '#595959', margin: '16px 0' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '6px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            刷新页面
          </button>
        </Content>
      </Layout>
    );
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ 
        padding: '24px', 
        backgroundColor: '#f0f2f5',
        minHeight: 'calc(100vh - 64px)',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%' 
      }}>
        {/* 显示当前工作项信息 */}
        {tabContext && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '4px' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              工作项ID: {tabContext.workItemId}
            </p>
          </div>
        )}
        
        {/* 筛选组件 */}
        <FilterComponent onFilterChange={handleFilterChange} />
        
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
        />
      </Content>
    </Layout>
  );
};

export default TabApp;