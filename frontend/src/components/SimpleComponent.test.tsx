import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimpleComponent from './SimpleComponent';

describe('SimpleComponent', () => {
  it('should render the message prop', () => {
    const testMessage = 'Hello, World!';
    render(<SimpleComponent message={testMessage} />);
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });
});