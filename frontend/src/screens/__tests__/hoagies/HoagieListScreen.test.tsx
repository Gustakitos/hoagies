import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HoagieListScreen from '../../hoagies/HoagieListScreen';
import { hoagiesApi } from '../../../api/endpoints';

jest.mock('../../../api/endpoints');
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1' },
    logout: jest.fn(),
  }),
}));

describe('HoagieListScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    setOptions: jest.fn(),
  };

  it('renders loading state initially', async () => {
    (hoagiesApi.getAll as jest.Mock).mockResolvedValueOnce({
      data: [],
      meta: {},
    });
    const { getByText } = render(
      <HoagieListScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Loading hoagies...')).toBeTruthy();
  });

  it('renders list of hoagies', async () => {
    (hoagiesApi.getAll as jest.Mock).mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Test Hoagie',
          creator: { name: 'User' },
          ingredients: [],
        },
      ],
      meta: { hasNextPage: false },
    });

    const { getByText } = render(
      <HoagieListScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText('Test Hoagie')).toBeTruthy();
    });
  });
});
