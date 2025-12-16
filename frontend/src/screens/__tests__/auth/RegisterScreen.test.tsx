import React from 'react';
import { render } from '@testing-library/react-native';
import RegisterScreen from '../../auth/RegisterScreen';

jest.mock('../../../api/endpoints');
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

describe('RegisterScreen', () => {
  const mockNavigation = {
    replace: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });
});
