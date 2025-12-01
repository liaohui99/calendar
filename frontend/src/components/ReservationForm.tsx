import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Space, Typography, TextArea } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import type { Device } from '../types';
import { deviceApi, reservationApi } from '../services/api';

interface ReservationFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  deviceId?: number;
  startTime?: string;
  endTime?: string;
  selectedDate?: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  visible,
  onClose,
  onSuccess,
  deviceId,
  startTime,
  endTime,
  selectedDate,
}) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 表单数据状态
  const [formData, setFormData] = useState({
    userName: '',
    userContact: '',
    reason: ''
  });
  
  // 表单错误状态
  const [errors, setErrors] = useState({
    userName: '',
    userContact: '',
    reason: ''
  });

  // 重置表单
  const resetForm = () => {
    setFormData({
      userName: '',
      userContact: '',
      reason: ''
    });
    setErrors({
      userName: '',
      userContact: '',
      reason: ''
    });
  };

  // 当设备ID变化时，加载设备信息
  useEffect(() => {
    if (deviceId && visible) {
      loadDeviceInfo();
    }
  }, [deviceId, visible]);
  
  // 监听visible变化，重置表单
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  // 加载设备信息
  const loadDeviceInfo = async () => {
    try {
      const response = await deviceApi.getDevice(deviceId!);
      // 根据API响应结构正确获取设备数据
      setDevice(response.data.data);
    } catch (error) {
      console.error('加载设备信息失败:', error);
      console.error('加载设备信息失败');
    }
  };
  
  // 表单验证函数
  const validateForm = (): boolean => {
    const newErrors = {
      userName: '',
      userContact: '',
      reason: ''
    };
    let isValid = true;

    // 验证预约人
    if (!formData.userName.trim()) {
      newErrors.userName = '请输入预约人姓名';
      isValid = false;
    }

    // 验证联系方式
    if (!formData.userContact.trim()) {
      newErrors.userContact = '请输入联系方式';
      isValid = false;
    } else if (!/^1[3-9]\d{9}$|[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userContact)) {
      newErrors.userContact = '请输入正确的手机号码或邮箱地址';
      isValid = false;
    }

    // 验证预约事由
    if (!formData.reason.trim()) {
      newErrors.reason = '请输入预约事由';
      isValid = false;
    } else if (formData.reason.length < 5) {
      newErrors.reason = '预约事由至少需要5个字符';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  
  // 处理表单输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误信息
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // 构造完整的时间
      const fullStartTime = `${selectedDate} ${startTime}`;
      const fullEndTime = `${selectedDate} ${endTime}`;
      
      // 提交预约
      await reservationApi.createReservation({
        deviceId: deviceId!,
        userName: formData.userName,
        userContact: formData.userContact,
        startTime: fullStartTime,
        endTime: fullEndTime,
        reason: formData.reason,
      });
      
      console.log('预约成功');
      
      // 关闭模态框
      handleCancel();
      
      // 通知父组件预约成功
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('预约失败:', error);
      // 处理预约冲突错误
      if (error.response?.status === 409) {
        console.log('该时间段已被预约，请选择其他时间');
      } else {
        console.log('预约失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setDevice(null);
    onClose();
  };

  // 格式化显示时间
  const formatDateTime = (date: string, time: string) => {
    return dayjs(`${date} ${time}`).format('YYYY-MM-DD HH:mm');
  };

  

  return (
    <Modal
      title="设备预约"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      // 解决React 18兼容性问题
      autoFocus={false}
      getContainer={() => document.body}
    >
      <div style={{ padding: '20px 0' }}>
        {/* 设备信息 */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>设备信息</label>
          <Typography.Text type="secondary">
            {device ? device.name : ''}
          </Typography.Text>
        </div>

        {/* 预约时间 */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>预约时间</label>
          <Typography.Text type="secondary">
            {selectedDate && startTime && endTime
              ? `${formatDateTime(selectedDate, startTime)} - ${formatDateTime(selectedDate, endTime)}`
              : ''}
          </Typography.Text>
        </div>

        {/* 预约人 */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>预约人</label>
          <Input
            placeholder="请输入预约人姓名"
            size="large"
            value={formData.userName}
            onChange={(value: string) => handleInputChange('userName', value)}
          />
          {errors.userName && (
            <Typography.Text type="danger" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.userName}
            </Typography.Text>
          )}
        </div>

        {/* 联系方式 */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>联系方式</label>
          <Input
            placeholder="请输入手机号码或邮箱"
            size="large"
            value={formData.userContact}
            onChange={(value: string) => handleInputChange('userContact', value)}
          />
          {errors.userContact && (
            <Typography.Text type="danger" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.userContact}
            </Typography.Text>
          )}
        </div>

        {/* 预约事由 */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>预约事由</label>
          <TextArea
            placeholder="请输入预约事由"
            rows={4}
            maxLength={200}
            value={formData.reason}
            onChange={(value: string) => handleInputChange('reason', value)}
          />
          {errors.reason && (
            <Typography.Text type="danger" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.reason}
            </Typography.Text>
          )}
          <Typography.Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {formData.reason.length}/200
          </Typography.Text>
        </div>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <Space>
            <Button onClick={handleCancel} style={{ textAlign: 'center' }}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={loading} style={{ textAlign: 'center' }}>
              提交预约
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ReservationForm;