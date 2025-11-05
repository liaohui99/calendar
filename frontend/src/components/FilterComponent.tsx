import React, { useState, useEffect } from 'react';
import { Select, Card, DatePicker, Button, Row, Col } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import type { DeviceType, Location } from '../types';
import { typeApi, locationApi } from '../services/api';

interface FilterComponentProps {
  onFilterChange: (locationId?: number, typeId?: number, date?: string) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ onFilterChange }) => {
  const [locations, setLocations] = useState<Location[]>([]);
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
    <Card style={{ marginBottom: '20px' }}>
      <div style={{ padding: '16px' }}>
        <Row align="middle" justify="space-between" style={{ marginBottom: '16px' }}>
          <Col>
            <div style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>设备预约</div>
          </Col>
        </Row>

        <Row gutter={16} align="middle">
          {/* 日期选择区域 */}
          <Col>
            <Button
              icon="left"
              onClick={goToPreviousDay}
              size="small"
              style={{ textAlign: 'center' }}
            >
              前一天
            </Button>
            <DatePicker
              value={selectedDate ? new Date(selectedDate) : undefined}
              onChange={handleDateChange}
              style={{ width: '180px' }}
              format="yyyy-MM-dd"
              size="small"
              getPopupContainer={() => document.body}
            />
            <Button
              icon="right"
              onClick={goToNextDay}
              size="small"
              style={{ textAlign: 'center' }}
            >
              后一天
            </Button>
            <span>{`(${getWeekday(selectedDate)})`}</span>
          </Col>

          {/* 筛选选择区域 */}
          <Col style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            {/* 地点选择 */}
              <Select
                placeholder="选择地点"
                style={{ width: '150px' }}
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
                style={{ width: '150px' }}
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

            {/* 刷新按钮 */}
            <Button icon="reload" onClick={handleRefresh} size="small" style={{ textAlign: 'center' }}>
              刷新
            </Button>
            
            {/* 新建预约单按钮 */}
            <Button type="primary" size="small" style={{ textAlign: 'center' }}>
              新建预约单
            </Button>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default FilterComponent;