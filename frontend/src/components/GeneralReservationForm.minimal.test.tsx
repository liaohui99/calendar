import React from 'react';
import { render, screen } from '@testing-library/react';
// ????jest-dom????????toBeInTheDocument???????
import '@testing-library/jest-dom';

// ???????????????????????

// ???Semi UI???
jest.mock('@douyinfe/semi-ui', () => ({
  Modal: ({ children }: any) => <div data-testid="modal">{children}</div>,
  Input: () => <input data-testid="input" />,
  Select: () => <select data-testid="select" />,
  DatePicker: () => <input data-testid="datepicker" />,
  TextArea: () => <textarea data-testid="textarea" />,
  Button: ({ children }: any) => <button data-testid="button">{children}</button>
}));

// ???API????
jest.mock('../services/api', () => ({
  deviceApi: { getDevices: jest.fn().mockResolvedValue([]) },
  locationApi: { getLocations: jest.fn().mockResolvedValue([]) },
  typeApi: { getTypes: jest.fn().mockResolvedValue([]) },
  reservationApi: { createReservation: jest.fn() }
}));

// ???????
import GeneralReservationForm from './GeneralReservationForm';

describe('GeneralReservationForm', () => {
  test('renders without crashing', () => {
    // ????console.error?????????§Ô????????????
    const originalError = console.error;
    console.error = jest.fn();
    
    try {
      // ??????
      render(
        <GeneralReservationForm 
          visible={true}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      );
      
      // ???Modal???????????Semi UI????????ID??
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      
    } finally {
      // ???console.error
      console.error = originalError;
    }
  });
});