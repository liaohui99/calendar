import React from 'react';

interface SimpleComponentProps {
  message: string;
}

/**
 * 一个非常简单的组件，用于测试环境
 */
const SimpleComponent: React.FC<SimpleComponentProps> = ({ message }) => {
  return <div>{message}</div>;
};

export default SimpleComponent;