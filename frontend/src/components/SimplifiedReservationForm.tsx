import React, { useState } from 'react';
import { Modal, Form, Typography, Button } from '@douyinfe/semi-ui';
import type { FormState } from '@douyinfe/semi-ui/lib/es/form';

const { Text } = Typography;

interface SimplifiedReservationFormProps {
  visible: boolean;
  onClose: () => void;
  deviceName?: string;
}

/**
 * 简化版的预约表单组件，不依赖外部API
 */
const SimplifiedReservationForm: React.FC<SimplifiedReservationFormProps> = ({ 
  visible, 
  onClose,
  deviceName = 'Test Device'
}) => {
  const [formData, setFormData] = useState({
    userName: '',
    reason: ''
  });

  const handleSubmit = () => {
    // 简单的本地验证
    if (!formData.userName.trim()) {
      alert('请输入姓名');
      return;
    }
    
    // 模拟成功
    alert('预约成功！');
    onClose();
  };

  return (
    <Modal 
      title="简化版预约表单" 
      visible={visible} 
      onOk={handleSubmit}
      onCancel={onClose}
    >
      <Form
        layout="vertical"
        onChange={(formState: FormState) => {
          setFormData({
            userName: formState.values.userName || '',
            reason: formState.values.reason || ''
          });
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Text>设备: {deviceName}</Text>
        </div>
        <Form.Input
          field="userName"
          label="姓名"
          placeholder="请输入姓名"
        />
        <Form.Input
          field="reason"
          label="原因"
          placeholder="请输入原因"
        />
      </Form>
    </Modal>
  );
};

export default SimplifiedReservationForm;