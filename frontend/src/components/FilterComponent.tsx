import React, { useState, useEffect } from 'react';
import { Select, Card, DatePicker, Button, Row, Col } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { DeviceType, LocationInfo } from '../types';
import { typeApi, locationApi } from '../services/api';

interface FilterComponentProps {
  onFilterChange: (locationId?: number, typeId?: number, date?: string) => void;
  onNewReservationClick?: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ onFilterChange, onNewReservationClick }) => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [types, setTypes] = useState<DeviceType[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  
  // 移除自定义的下拉框外部点击关闭实现，使用semi组件内置功能
  // Semi UI的Select组件自带点击外部关闭功能，无需额外实现

  // 加载地点和类型数据
  useEffect(() => {
    loadFilterData();
  }, []);

  // 当筛选条件变化时，通知父组件
  // 添加防抖处理，避免频繁触发
  useEffect(() => {
    // 组件首次加载时不触发，只在用户主动修改筛选条件时触发
    // 或者在数据加载完成后触发一次有效的筛选
    if (locations.length > 0 && types.length > 0) {
      onFilterChange(selectedLocationId, selectedTypeId, selectedDate);
    }
  }, [selectedLocationId, selectedTypeId, selectedDate, onFilterChange, locations.length, types.length]);

  const loadFilterData = async () => {
    setLoading(true);
    try {
      // 加载地点数据
      const locationsResponse = await locationApi.getLocations();
      const locationsData = Array.isArray(locationsResponse.data) ? locationsResponse.data : (locationsResponse.data?.data || []);
      setLocations(locationsData);

      // 加载设备类型数据
      const typesResponse = await typeApi.getTypes();
      const typesData = Array.isArray(typesResponse.data) ? typesResponse.data : (typesResponse.data?.data || []);
      setTypes(typesData);
    } catch (error) {
      console.error('加载筛选数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理地点选择变化
  const handleLocationChange = (value: any) => {
    setSelectedLocationId(value);
  };
  
  // 处理类型选择变化
  const handleTypeChange = (value: any) => {
    setSelectedTypeId(value);
  };

  // 处理日期选择变化
  const handleDateChange = (date: any) => {
    if (date) {
      // 处理不同类型的输入
      if (date instanceof Date) {
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
      } else if (typeof date === 'string') {
        setSelectedDate(date);
      } else if (date) {
        // 尝试用dayjs解析
        try {
          setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
        } catch (e) {
          console.error('日期解析失败:', e);
        }
      }
    }
  };

  // 切换到前一天
  const goToPreviousDay = () => {
    const prevDate = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(prevDate);
  };

  // 切换到后一天
  const goToNextDay = () => {
    const nextDate = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(nextDate);
  };

  // 刷新数据
  const handleRefresh = () => {
    loadFilterData();
  };

  // 获取当前日期的星期几
  const getWeekday = (dateStr: string) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[dayjs(dateStr).day()];
  };

  return (
    <Card
      className="filter-section-card"
      style={{
        marginBottom: '24px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      <div style={{ padding: '24px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: 0,
            marginBottom: '24px',
            textAlign: 'left',
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px'
          }}>设备预约</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* 日期选择和筛选区域合并在同一行 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: '16px', 
              flexWrap: 'wrap' 
            }}>
              {/* 左侧：日期选择 + 地点和类型选择 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {/* 日期选择区域 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <Button
                    icon="left"
                    onClick={goToPreviousDay}
                    size="small"
                    type="secondary"
                  >
                    前一天
                  </Button>
                
                  <DatePicker
                    value={selectedDate ? new Date(selectedDate) : undefined}
                    onChange={handleDateChange}
                    style={{ width: '160px' }}
                    format="yyyy-MM-dd"
                    size="small"
                    getPopupContainer={() => document.body}
                  />
                
                  <span style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    minWidth: '40px'
                  }}>{`(${getWeekday(selectedDate)})`}</span>
                
                  <Button
                    icon="right"
                    onClick={goToNextDay}
                    size="small"
                    type="secondary"
                  >
                    后一天
                  </Button>
                </div>
                
                {/* 地点和类型选择 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {/* 地点选择 */}
                  <Select
                    placeholder="选择地点"
                    style={{ width: '160px' }}
                    value={selectedLocationId}
                    onChange={handleLocationChange}
                    loading={loading}
                    size="small"
                  >
                  {locations.map((location) => (
                    <Select.Option key={location.id} value={location.id}>
                      {location.name}
                    </Select.Option>
                  ))}
                  </Select>
                
                  {/* 设备类型选择 */}
                  <Select
                    placeholder="选择类型"
                    style={{ width: '160px' }}
                    value={selectedTypeId}
                    onChange={handleTypeChange}
                    loading={loading}
                    size="small"
                  >
                  {types.map((type) => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.name}
                    </Select.Option>
                  ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* 操作按钮区域 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* 刷新按钮 */}
              <Button 
                icon="reload" 
                onClick={handleRefresh} 
                size="small"
                type="secondary"
              >
                刷新
              </Button>
              
              {/* 新建预约单按钮 - 突出显示 */}
              <Button 
                type="primary" 
                size="small"
                onClick={onNewReservationClick}
              >
                新建预约单
              </Button>
            </div>
          </div>
      </div>
    </Card>
  );
};

export default FilterComponent;