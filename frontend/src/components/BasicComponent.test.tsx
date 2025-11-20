import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BasicComponent from './BasicComponent';

describe('BasicComponent', () => {
  test('renders the title correctly', () => {
    const testTitle = 'Hello World';
    render(<BasicComponent title={testTitle} />);
    expect(screen.getByRole('heading')).toHaveTextContent(testTitle);
  });

  test('renders children when provided', () => {
    const testTitle = 'Test Title';
    const testChild = 'Test Child Content';
    render(
      <BasicComponent title={testTitle}>
        <p>{testChild}</p>
      </BasicComponent>
    );
    expect(screen.getByText(testChild)).toBeInTheDocument();
  });
});