import React, { useEffect, useCallback } from 'react';
import { Table, Button, Select, Tag, Spin, Card, Modal } from '@douyinfe/semi-ui';
// 移除message导入，避免类型错误

import { reservationApi } from '../services/api';
import type { Reservation } from '../types';
import { ReservationStatus } from '../types';
// 为了代码可读性，创建状态枚举别名
const StatusEnum = ReservationStatus;

/**
 * 预约审批页面组件
 * 用于展示和管理所有预约记录的审批操作
 */
const ApprovalPage: React.FC = () => {
  // 预约列表数据状态
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  // 加载状态
  const [loading, setLoading] = React.useState<boolean>(true);
  // 错误信息状态
  const [error, setError] = React.useState<string | null>(null);
  // 操作加载状态
  const [operationLoading, setOperationLoading] = React.useState<boolean>(false);
  // 分页状态
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 处理分页变化
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
  }, []);
  // 筛选条件状态
  const [filters, setFilters] = React.useState({
    status: undefined as ReservationStatus | undefined,
  });

  /**
   * 获取预约列表数据
   */
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 构建请求参数，包含筛选条件
      const params: any = {
        ...filters,
        page: pagination.current,
        pageSize: pagination.pageSize
      };
      
      // 移除undefined的参数
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      // 调用API获取数据
      const response = await reservationApi.getReservations(params);
      
      // 更新状态
      setReservations(response.data?.data || []);
      setPagination(prev => ({
        ...prev,
        total: 0
      }));
    } catch (err: any) {
      console.error('获取预约列表失败:', err);
      setError(err?.message || '获取预约列表失败，请稍后重试');
      // 显示错误提示
      console.error('获取预约列表失败:', err?.message || '未知错误');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  // 页面加载和筛选条件变化时重新获取数据
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // 刷新数据函数
  /**
   * 处理预约审批操作
   * @param reservation 预约信息
   * @param action 操作类型：approve（通过）或 reject（拒绝）
   * @param reason 拒绝原因（可选）
   */
  const handleApprovalAction = async (reservation: Reservation, action: 'approve' | 'reject') => {
    setOperationLoading(true);
    try {
      const newStatus = action === 'approve' ? StatusEnum.CONFIRMED : StatusEnum.CANCELLED;
      
      // 调用API更新预约状态
      await reservationApi.updateReservationStatus(reservation.id, newStatus);
      
      // 显示成功提示
      console.log('操作成功:', action === 'approve' ? '预约已通过审批' : '预约已被拒绝');
      // 重新获取数据
      fetchReservations();
    } catch (err: any) {
      console.error(`${action} reservation failed:`, err);
      Modal.error({
        title: '操作失败',
        content: err.message || `${action === 'approve' ? '通过' : '拒绝'}预约失败，请稍后重试`,
      });
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * 处理通过预约
   */
  const handleApproveReservation = (reservation: Reservation) => {
    Modal.confirm({
      title: '确认通过',
      content: `确定要通过ID为「${reservation.id}」的预约吗？`,
      onOk: () => handleApprovalAction(reservation, 'approve'),
    });
  };

  /**
   * 处理拒绝预约
   */
  const handleRejectReservation = (reservation: Reservation) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝ID为「${reservation.id}」的预约吗？`,
      onOk: () => handleApprovalAction(reservation, 'reject'),
    });
  };

  const handleRefresh = () => {
    fetchReservations();
  };

  // 渲染预约状态标签
  const renderStatusTag = (status: ReservationStatus) => {
    const statusConfig = {
      [StatusEnum.PENDING]: { text: '待确认' },
      [StatusEnum.CONFIRMED]: { text: '已确认' },
      [StatusEnum.CANCELLED]: { text: '已取消' },
    };
    
    const config = statusConfig[status] || { text: '未知' };
    return <Tag>{config.text}</Tag>;
  };

  return (
    <div className="approval-page">
      <Card title="预约审批管理" className="approval-card">
        {/* 加载状态展示 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        )}
        
        {/* 错误状态展示 */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            <p>{error}</p>
            <Button type="primary" onClick={handleRefresh}>
              重新加载
            </Button>
          </div>
        )}
        
        {/* 内容区域 */}
        {!loading && !error && (
          <div>
            {/* 筛选区域 */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>状态筛选：</span>
                <Select
                  placeholder="全部状态"
                  style={{ width: 150 }}
                  value={filters.status}
                  onChange={(value: any) => {
                    setFilters(prev => ({ ...prev, status: value }));
                    // 重置到第一页
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}>
                  <Select.Option value={StatusEnum.PENDING}>待确认</Select.Option>
                  <Select.Option value={StatusEnum.CONFIRMED}>已确认</Select.Option>
                  <Select.Option value={StatusEnum.CANCELLED}>已取消</Select.Option>
                </Select>
                </div>
              
              <Button 
                type="primary" 
                onClick={handleRefresh}
                loading={loading}
              >
                刷新数据
              </Button>
            </div>
            
            {/* 表格配置 */}
            <Table
              columns={[
                {
                  title: '预约ID',
                  dataIndex: 'id',
                  key: 'id',
                  width: 80,
                },
                {
                  title: '预约人',
                  dataIndex: 'userName',
                  key: 'userName',
                  width: 120,
                },
                {
                  title: '联系方式',
                  dataIndex: 'userContact',
                  key: 'userContact',
                  width: 150,
                },
                {
                  title: '设备',
                  dataIndex: 'device',
                  key: 'deviceName',
                  width: 150,
                  render: (device: any) => device?.name || '未知设备',
                },
                {
                  title: '开始时间',
                  dataIndex: 'startTime',
                  key: 'startTime',
                  width: 180,
                  render: (time: string) => {
                    try {
                      return new Date(time).toLocaleString('zh-CN');
                    } catch {
                      return time;
                    }
                  },
                },
                {
                  title: '结束时间',
                  dataIndex: 'endTime',
                  key: 'endTime',
                  width: 180,
                  render: (time: string) => {
                    try {
                      return new Date(time).toLocaleString('zh-CN');
                    } catch {
                      return time;
                    }
                  },
                },
                {
                  title: '预约原因',
                  dataIndex: 'reason',
                  key: 'reason',
                  ellipsis: true,
                  tooltip: (text: string) => text,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 100,
                  render: (status: ReservationStatus) => renderStatusTag(status),
                },
                {
                  title: '创建时间',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  width: 180,
                  render: (time: string) => {
                    try {
                      return new Date(time).toLocaleString('zh-CN');
                    } catch {
                      return time;
                    }
                  },
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 120,
                  render: (_, record: Reservation) => {
                    // 只有待确认的预约可以进行审批操作
                    if (record.status === StatusEnum.PENDING) {
                      return (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            size="small"
                            type="primary"
                            loading={operationLoading}
                            onClick={() => handleApproveReservation(record)}
                          >
                            通过
                          </Button>
                          <Button
                            size="small"
                            danger
                            loading={operationLoading}
                            onClick={() => handleRejectReservation(record)}
                          >
                            拒绝
                          </Button>
                        </div>
                      );
                    }
                    return null;
                  },
                },
              ]}
              dataSource={reservations}
              rowKey="id"
              pagination={{
                currentPage: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOpts: [10, 20, 50, 100],
                onChange: handlePaginationChange,
              }}

            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApprovalPage;