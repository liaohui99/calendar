import React from 'react';

interface BasicComponentProps {
  title: string;
  children?: React.ReactNode;
}

/**
 * 一个基础的React组件，不使用任何第三方库
 */
const BasicComponent: React.FC<BasicComponentProps> = ({ title, children }) => {
  return (
    <div>
      <h1>{title}</h1>
      {children && <div>{children}</div>}
    </div>
  );
};

export default BasicComponent;