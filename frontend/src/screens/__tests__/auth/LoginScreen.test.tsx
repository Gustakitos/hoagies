import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../auth/LoginScreen';
import { authApi } from '../../../api/endpoints';

jest.mock('../../../api/endpoints');
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

describe('LoginScreen', () => {
  const mockNavigation = {
    replace: jest.fn(),
    navigate: jest.fn(),
  };

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('validates empty fields', async () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(authApi.login).not.toHaveBeenCalled();
    });
  });
});
