import React, { useState, useEffect } from 'react';
import { Table, Pagination, Spin, Button, Modal, Form, Input, Select, DatePicker, Toast } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import { reservationApi } from '../services/api';
import type { Reservation, ReservationFormData } from '../types';
import { ReservationStatus } from '../types';
import dayjs from 'dayjs';

// 移除不存在的Typography解构

/**
 * 预约列表页面组件
 * 展示所有设备预约数据，支持分页和排序
 */
const ReservationListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 编辑模态框相关状态
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ReservationFormData>>({});
  
  // 删除确认对话框状态
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);

  // 状态中文映射
  const statusMap: Record<number, string> = {
    0: '待确认',
    1: '已确认',
    2: '已取消'
  };

  /**
   * 获取预约数据
   * @param page 页码
   * @param size 每页大小
   * @param field 排序字段
   * @param order 排序方向
   */
  const fetchReservations = async (
    page?: number,
    size?: number,
    field?: string,
    order?: 'asc' | 'desc'
  ) => {
    const currentPageNum = page ?? currentPage;
    const currentSize = size ?? pageSize;
    const sortFieldValue = field ?? sortField;
    const sortOrderValue = order ?? sortOrder;
    
    setLoading(true);
    setError(null);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const response = await reservationApi.getReservations({
        date: today
      });
        let filteredData = response.data.data;
        if (sortFieldValue && sortOrderValue) {
          filteredData = [...filteredData].sort((a, b) => {
            const valueA = a[sortFieldValue as keyof Reservation];
            const valueB = b[sortFieldValue as keyof Reservation];
            if (valueA > valueB) return sortOrderValue === 'asc' ? 1 : -1;
            if (valueA < valueB) return sortOrderValue === 'asc' ? -1 : 1;
            return 0;
          });
        }
        const startIndex = (currentPageNum - 1) * currentSize;
        const endIndex = startIndex + currentSize;
        setReservations(filteredData.slice(startIndex, endIndex));
        setTotal(filteredData.length);
    } catch (err) {
      console.error('获取预约数据失败:', err);
      setError('获取预约数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchReservations();
  }, []);

  // handleFormChange函数在下方已定义

  /**
   * 处理分页变化
   * @param page 新页码
   * @param size 新页大小
   */
  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchReservations(page, size);
  };

  /**
   * 处理排序变化
   * @param field 排序字段
   * @param order 排序方向
   */
  const handleSortChange = (field: string | { field: string; order: 'asc' | 'desc' }, order?: 'asc' | 'desc') => {
    let sortField: string;
    let sortOrder: 'asc' | 'desc';
    
    // 处理Semi UI可能的事件参数格式
    if (typeof field === 'object' && field !== null) {
      sortField = field.field;
      sortOrder = field.order;
    } else {
      sortField = field as string;
      sortOrder = order || 'asc';
    }
    
    setSortField(sortField);
    setSortOrder(sortOrder);
    fetchReservations(currentPage, pageSize, sortField, sortOrder);
  };

  /**
   * 格式化时间
   * @param dateString 时间字符串
   * @returns 格式化后的时间
   */
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
  };

  /**
   * 返回上一页
   */
  const handleBack = () => {
    navigate('/');
  };

  /**
   * 处理编辑预约
   * @param id 预约ID
   */
  const handleEdit = (id: number) => {
    try {
      console.log('编辑预约:', id);
      // 查找当前预约记录
      const reservation = reservations.find(r => r.id === id);
      if (reservation) {
        setCurrentReservation(reservation);
        // 初始化表单数据，包含当前预约的状态
        setEditFormData({
          userName: reservation.userName,
          userContact: reservation.userContact,
          reason: reservation.reason,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          deviceId: reservation.device?.id,
          status: reservation.status // 添加status字段，确保初始显示正确的状态
        });
        // 显示编辑模态框
        setEditModalVisible(true);
      } else {
        console.error('未找到预约记录:', id);
      }
    } catch (err) {
      console.error('编辑预约失败:', err);
    }
  };

  // 类型验证辅助函数
  const isValidId = (id: unknown): id is number => {
    return typeof id === 'number' && id > 0 && Number.isInteger(id);
  };

  const isValidStatus = (status: unknown): status is ReservationStatus => {
    return typeof status === 'number' && 
           Object.values(ReservationStatus).includes(status as ReservationStatus);
  };

  /**
   * 处理编辑表单提交
   */
  const handleEditSubmit = async () => {
    if (!currentReservation) return;
    
    try {
      // 安全获取和验证ID
      if (!isValidId(currentReservation.id)) {
        Toast.error('无效的预约ID');
        return;
      }
      
      // 安全获取和验证状态
      const newStatus = editFormData?.status;
      if (!isValidStatus(newStatus)) {
        Toast.error('无效的预约状态');
        return;
      }
      
      // 安全获取备注原因
      const reason = editFormData?.reason || currentReservation.reason || '';
      
      // 调用更新预约状态的API
      await reservationApi.updateReservationStatus(currentReservation.id, newStatus, reason);
      
      // 显示成功消息
      Toast.success('预约信息更新成功');
      
      // 关闭模态框
      setEditModalVisible(false);
      
      // 刷新预约列表以显示更新后的数据
      fetchReservations();
    } catch (err) {
      console.error('编辑预约失败:', err);
      const errorMessage = err instanceof Error ? err.message : '预约信息更新失败，请重试';
      Toast.error(errorMessage);
    }
  };

  /**
   * 处理表单字段变化
   */
  const handleFormChange = (changedValues: any) => {
    setEditFormData(prev => ({ ...prev, ...changedValues }));
  };

  /**
   * 处理删除预约
   * @param id 预约ID
   */
  const handleDelete = (id: number) => {
    try {
      console.log('删除预约:', id);
      // 保存要删除的预约ID并显示确认对话框
      setReservationToDelete(id);
      setDeleteModalVisible(true);
    } catch (err) {
      console.error('删除预约失败:', err);
    }
  };

  /**
   * 确认删除预约
   */
  const handleConfirmDelete = async () => {
    if (!reservationToDelete) return;
    
    try {
      console.log('确认删除预约:', reservationToDelete);
      // 调用取消预约API（作为删除操作）
      await reservationApi.cancelReservation(reservationToDelete);
      // 显示成功消息
      console.log('预约记录已删除');
      // 关闭确认对话框
      setDeleteModalVisible(false);
      // 清空要删除的ID
      setReservationToDelete(null);
      // 刷新预约列表
      fetchReservations();
    } catch (err) {
      console.error('删除预约失败:', err);
      console.error('删除失败，请重试');
    }
  };

  /**
   * 取消删除操作
   */
  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setReservationToDelete(null);
  };

  // 表格列配置
  const columns = [
    {
      title: '预约ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '预约设备',
      dataIndex: 'device',
      key: 'deviceName',
      render: (device: any) => device?.name || '-',
      width: 120,
      align: 'center',
    },
    {
      title: '预约地点',
      dataIndex: 'device',
      key: 'locationName',
      render: (device: any) => device?.locationName || '-',
      width: 120,
      align: 'center',
    },
    {
      title: '预约人',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
      align: 'center',
    },
    {
      title: '联系电话',
      dataIndex: 'userContact',
      key: 'userContact',
      width: 150,
      align: 'center',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      sorter: true,
      render: (text: string) => formatDate(text),
      width: 150,
      align: 'center',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      sorter: true,
      render: (text: string) => formatDate(text),
      width: 150,
      align: 'center',
    },
    {
      title: '预约事由',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      ellipsis: true,
      tip: (_, record) => record.reason,
      align: 'center',
    },
    {
      title: '预约状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: status === 1 ? 'var(--success-light)' : status === 0 ? 'var(--warning-light)' : 'var(--error-light)',
          color: status === 1 ? 'var(--success-color)' : status === 0 ? 'var(--warning-color)' : 'var(--error-color)',
          fontSize: '12px',
          fontWeight: 500
        }}>
          {statusMap[status] || status}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (text: string) => formatDate(text),
      width: 150,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record: Reservation) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleEdit(record.id)}
            style={{
              padding: '3px 10px',
              fontSize: '11px',
              height: '24px',
              minWidth: '50px'
            }}
          >
            编辑
          </Button>
          <Button 
            type="danger" 
            size="small" 
            onClick={() => handleDelete(record.id)}
            style={{
              padding: '3px 10px',
              fontSize: '11px',
              height: '24px',
              minWidth: '50px'
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="reservation-calendar" style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '0'
    }}>
      <div style={{ 
        backgroundColor: 'var(--bg-primary)', 
        padding: '16px 24px', 
        boxShadow: 'none',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        marginBottom: '0',
        gap: '16px',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: 'var(--text-primary)',
          fontSize: '18px',
          fontWeight: 600,
          textAlign: 'center',
          flex: 1
        }}>设备预约系统</h1>
        <div style={{ marginLeft: 'auto' }}>
          <Button 
            onClick={() => navigate('/')}
            size="small"
            type="primary"
          >
            返回预约日历
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          backgroundColor: 'var(--error-light)',
          border: '1px solid var(--error-color)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          margin: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <span style={{ color: 'var(--error-color)', fontWeight: 500 }}>{error}</span>
          <Button onClick={() => fetchReservations()} size="small" type="primary">
            重试
          </Button>
        </div>
      )}

      <div style={{ padding: '24px' }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          marginBottom: '24px', 
          marginTop: 0, 
          textAlign: 'center',
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px'
        }}>
          所有预约记录
        </div>

        <Spin spinning={loading}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)'
            }}>
              <Spin size="large" tip="加载预约数据中..." />
            </div>
          ) : (
            <div className="calendar-grid" style={{ 
              overflowX: 'auto',
              padding: '0 0 24px 0',
              width: '100%'
            }}>
              <Table
                columns={columns}
                dataSource={reservations}
                rowKey="id"
                onSort={handleSortChange}
                pagination={false}
                size="middle"
                style={{
                  minHeight: '400px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'none',
                  width: '100%',
                  borderCollapse: 'collapse'
                }}
                className="reservation-table"
              />
              <div style={{ 
                textAlign: 'center',
                padding: '16px 0 0 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePaginationChange}
                  size="small"
                  style={{
                    margin: 0
                  }}
                />
              </div>
            </div>
          )}
        </Spin>
      </div>
      
      {/* 编辑模态框 */}
      <Modal
        title="编辑预约"
        visible={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)} size="small">取消</Button>,
          <Button key="submit" type="primary" onClick={handleEditSubmit} size="small">保存</Button>
        ]}
        getContainer={() => document.body} // 显式指定渲染容器以解决React 18兼容性问题
        autoFocus={false}
        style={{ borderRadius: 'var(--radius-lg)' }}
      >
        <Form layout="vertical" data-testid="edit-form">
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px', color: 'var(--text-primary)' }}>预约状态</label>
            <Select 
              value={(editFormData as any).status}
              onChange={(value) => handleFormChange({ status: value })}
              size="small"
              style={{ width: '100%' }}
            >
              <Select.Option value={0}>待确认</Select.Option>
              <Select.Option value={1}>已确认</Select.Option>
              <Select.Option value={2}>已取消</Select.Option>
            </Select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px', color: 'var(--text-primary)' }}>预约原因</label>
            <Input 
              value={(editFormData as any).reason || ''}
              onChange={(value) => handleFormChange({ reason: value })}
              size="small"
              style={{ width: '100%' }}
            />
          </div>
        </Form>
      </Modal>
      
      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        visible={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        footer={[
          <Button key="cancel" onClick={handleCancelDelete} size="small">取消</Button>,
          <Button key="delete" type="primary" danger onClick={handleConfirmDelete} size="small">
            确认删除
          </Button>
        ]}
        getContainer={() => document.body} // 显式指定渲染容器以解决React 18兼容性问题
        autoFocus={false}
        style={{ borderRadius: 'var(--radius-lg)' }}
      >
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>确定要删除这个预约吗？此操作不可撤销。</p>
      </Modal>
    </div>
  );
};

export default ReservationListPage;