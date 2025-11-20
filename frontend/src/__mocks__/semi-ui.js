// Mock for Semi UI components to avoid ESM compatibility issues in tests
const React = require('react');

// Create a simple mock for each component
const mockComponent = (name) => {
  const MockComponent = (props) => {
    const { children, ...restProps } = props;
    return React.createElement('div', {
      'data-testid': name,
      'data-props': JSON.stringify(restProps),
      className: `semi-${name.toLowerCase()}`,
    }, children);
  };
  MockComponent.displayName = name;
  return MockComponent;
};

module.exports = {
  Button: mockComponent('Button'),
  Input: mockComponent('Input'),
  Select: mockComponent('Select'),
  DatePicker: mockComponent('DatePicker'),
  Modal: mockComponent('Modal'),
  Form: mockComponent('Form'),
  TextArea: mockComponent('TextArea'),
  Typography: {
    Title: mockComponent('Title'),
    Text: mockComponent('Text'),
  },
  Empty: mockComponent('Empty'),
  Message: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
};