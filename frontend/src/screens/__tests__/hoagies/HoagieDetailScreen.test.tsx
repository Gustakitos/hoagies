import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HoagieDetailScreen from '../../hoagies/HoagieDetailScreen';
import { hoagiesApi, commentsApi } from '../../../api/endpoints';

jest.mock('../../../api/endpoints');
jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useFocusEffect: (callback: () => void) => React.useEffect(callback, []),
  };
});
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1' },
  }),
}));

describe('HoagieDetailScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    setOptions: jest.fn(),
  };
  const mockRoute = {
    params: { id: '1', name: 'Test Hoagie' },
  };

  it('renders hoagie details', async () => {
    (hoagiesApi.getById as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Test Hoagie',
      ingredients: ['Bread', 'Ham'],
      creator: { id: 'user1', name: 'Creator' },
      collaborators: [],
      commentCount: 0,
    });
    (commentsApi.getByHoagieId as jest.Mock).mockResolvedValue({
      data: [],
      meta: {},
    });

    const { getByText } = render(
      <HoagieDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Test Hoagie')).toBeTruthy();
      expect(getByText('Bread', { exact: false })).toBeTruthy();
    });
  });
});
