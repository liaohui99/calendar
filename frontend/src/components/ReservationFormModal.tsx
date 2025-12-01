import React, { useState } from 'react';
import { Modal, Form, Typography, Button } from '@douyinfe/semi-ui';
import type { FormState } from '@douyinfe/semi-ui/lib/es/form';
import dayjs from 'dayjs';

import { reservationApi } from '../services/api';

const { Text } = Typography;

interface ReservationFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  deviceId: number;
  startTime: string;
  endTime: string;
  date: string;
  deviceName?: string;
}

const ReservationFormModal: React.FC<ReservationFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  deviceId,
  startTime,
  endTime,
  date,
  deviceName = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userContact: '',
    reason: '',
  });

  // 简化的调试信息

  // 处理表单输入变化


  // 处理表单提交
  const handleSubmit = async () => {
    // 基本验证 - 添加安全检查确保属性存在且为字符串
    if (!formData.userName || typeof formData.userName !== 'string' || !formData.userName.trim()) {
      console.error('验证失败: 缺少预约人姓名');
      alert('请输入预约人姓名');
      return;
    }
    if (!formData.userContact || typeof formData.userContact !== 'string' || !formData.userContact.trim()) {
      console.error('验证失败: 缺少联系方式');
      alert('请输入联系方式');
      return;
    }
    if (!formData.reason || typeof formData.reason !== 'string' || !formData.reason.trim()) {
      console.error('验证失败: 缺少预约事由');
      alert('请输入预约事由');
      return;
    }

    try {
      setLoading(true);
      
      // 验证输入参数
      console.log('输入参数验证:', { date, startTime, endTime, deviceId, deviceName });
      
      // 使用dayjs确保时间格式正确，后端期望格式为yyyy-MM-dd HH:mm
      // 确保日期和时间格式严格符合Java SimpleDateFormat要求
      const startDateTime = dayjs(`${date} ${startTime}`).format('YYYY-MM-DD HH:mm');
      const endDateTime = dayjs(`${date} ${endTime}`).format('YYYY-MM-DD HH:mm');
      
      // 验证结束时间大于开始时间
      const startDateObj = dayjs(startDateTime);
      const endDateObj = dayjs(endDateTime);
      if (endDateObj.isBefore(startDateObj) || endDateObj.isSame(startDateObj)) {
        console.error('时间顺序验证失败:', { startDateTime, endDateTime });
        alert('结束时间必须大于开始时间');
        return;
      }
      
      // 构建预约数据对象
      const reservationData = {
        deviceId,
        userName: (formData.userName as string).trim(),
        userContact: (formData.userContact as string).trim(),
        startTime: startDateTime,
        endTime: endDateTime,
        reason: (formData.reason as string).trim(),
      };
      
      console.log('准备发送到后端的预约数据:', JSON.stringify(reservationData));
      

      // 提交预约 - 使用已经验证过的安全值
      // 添加额外的参数类型检查
      if (typeof deviceId !== 'number' || deviceId <= 0) {
        throw new Error('无效的设备ID');
      }
      
      const response = await reservationApi.createReservation(reservationData);
      
      console.log('预约API调用成功，状态码:', response.status);
      
      
      // 显示成功提示
      alert('预约成功！');
      
      // 重置表单
      setFormData({
        userName: '',
        userContact: '',
        reason: '',
      });

      // 关闭模态框并通知成功
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (apiError: any) {
      // 错误处理
      const errorStatus = apiError.response?.status || '未知';
      const serverError = apiError.response?.data?.message || apiError.response?.data?.error || '';
      let errorMessage = serverError || '预约失败，请稍后重试';
      
      // 根据错误类型提供更具体的提示
      if (errorStatus === 409) {
        errorMessage = serverError || '该时间段已被预约，请选择其他时间';
      } else if (errorStatus === 400) {
        errorMessage = serverError || '输入信息有误，请检查并重试';
      } else if (errorStatus === 500) {
        errorMessage = serverError || '服务器内部错误，请稍后重试';
      }
      
      // 输出关键错误信息
      console.error('预约失败:', { 
        status: errorStatus, 
        message: errorMessage,
        responseData: apiError.response?.data,
        errorStack: apiError.stack
      });
      
      // 显示友好的错误提示
      alert(errorMessage);
    } finally {
      console.log('表单提交流程结束');
      setLoading(false);
    }
  };

  // 处理模态框关闭
  const handleModalClose = () => {
    // 重置表单
    setFormData({
      userName: '',
      userContact: '',
      reason: '',
    });
    onClose();
  };

  // 格式化显示的时间
  const formatDateTime = (dateStr: string, timeStr: string) => {
    return dayjs(`${dateStr} ${timeStr}`).format('YYYY-MM-DD HH:mm');
  };

  return (
    <Modal
      title="创建设备预约"
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleModalClose}
      confirmLoading={loading}
      width={500}
      // 解决React 18兼容性问题
      autoFocus={false}
      getContainer={() => document.body}
      // 使Modal内容区域高度自适应并可滚动
      bodyStyle={{
        maxHeight: 'calc(80vh - 100px)',
        overflow: 'hidden',
      }}
    >
      {/* 主布局容器：使用Flexbox实现上下排序结构 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 'calc(80vh - 120px)',
        overflowY: 'auto',
        gap: '16px',
        padding: '8px 0',
      }}>
        <Form 
          layout="vertical" 
          initValues={formData} 
          onChange={(formState: FormState) => {
            // 安全地更新表单数据
            setFormData({
              userName: formState.values.userName || '',
              userContact: formState.values.userContact || '',
              reason: formState.values.reason || ''
            });
          }}
        >
          {/* 调试按钮 */}
          <Button onClick={async () => {
            try {
              console.log('手动测试API连接...');
              const testData = {
                deviceId: 1,
                userName: '测试用户',
                userContact: 'test@example.com',
                startTime: '2025-10-28 10:00',
                endTime: '2025-10-28 11:00',
                reason: '测试预约'
              };
              console.log('测试数据:', testData);
              alert('开始测试预约API，请检查浏览器控制台');
              const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
              });
              console.log('API响应状态:', response.status);
              const data = await response.json();
              console.log('API响应数据:', data);
              alert(`测试结果: 状态码 ${response.status}`);
            } catch (error) {
              console.error('API测试失败:', error);
              alert(`测试失败: ${(error as Error).message}`);
            }
          }}>测试API连接</Button>
          {/* 第一级div：预约信息区域 */}
          <div style={{
            flex: '0 0 auto',
          }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>预约信息</Text>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '4px',
              border: '1px solid #e8e8e8',
            }}>
              {/* 第二级div：设备信息 */}
              <div style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                <Text type="secondary">设备：</Text>
                <Text>{deviceName}</Text>
              </div>
              {/* 第三级div：时间信息 */}
              <div style={{ lineHeight: '1.5' }}>
                <Text type="secondary">预约时间：</Text>
                <Text>
                  {formatDateTime(date, startTime)} - {formatDateTime(date, endTime)}
                </Text>
              </div>
            </div>
          </div>

          {/* 第四级div：表单输入区域 */}
          <div style={{
            flex: '0 0 auto',
          }}>
            <Form.Input
              field="userName"
              label="预约人姓名"
              placeholder="请输入预约人姓名"
              style={{ marginBottom: '16px' }}
            />

            <Form.Input
              field="userContact"
              label="联系方式"
              placeholder="请输入联系方式（电话/邮箱）"
              style={{ marginBottom: '16px' }}
            />

            <Form.TextArea
              field="reason"
              label="预约事由"
              placeholder="请输入预约事由"
              rows={4}
              style={{ marginBottom: '16px' }}
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ReservationFormModal;