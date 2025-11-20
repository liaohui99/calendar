// Mock for GeneralReservationForm component to avoid rendering issues in tests
const React = require('react');

const GeneralReservationForm = ({ visible, onClose, onSuccess, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'GeneralReservationForm',
    'data-visible': visible,
    'data-props': JSON.stringify(props),
    className: 'general-reservation-form-mock'
  }, 'GeneralReservationForm Mock Component');
};

module.exports = GeneralReservationForm;