import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import HoagieListScreen from '../../hoagies/HoagieListScreen';
import { hoagiesApi } from '../../../api/endpoints';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { toast } from 'sonner-native';
import { Hoagie } from '../../../types/hoagie.types';
import { HoagieCardProps } from '../../../components/HoagieCard';
import { LoadingSpinnerProps } from '../../../components/LoadingSpinner';

jest.mock('../../../api/endpoints');

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useFocusEffect: (callback: () => void) => React.useEffect(callback, []),
  };
});

jest.mock('sonner-native');

jest.mock('lucide-react-native', () => ({
  Search: () => null,
}));

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');

  return {
    ...Reanimated,
    FadeInDown: {
      delay: () => ({
        springify: () => ({}),
      }),
    },
    LinearTransition: {
      springify: () => ({}),
    },
  };
});

jest.mock('../../../components/HoagieCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text, TouchableOpacity } = require('react-native');
  return function HoagieCardMock({ hoagie, onPress }: HoagieCardProps) {
    return (
      <TouchableOpacity testID={`hoagie-card-${hoagie.id}`} onPress={onPress}>
        <Text>{hoagie.name ?? hoagie.id}</Text>
      </TouchableOpacity>
    );
  };
});

jest.mock('../../../components/LoadingSpinner', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require('react-native');
  return function LoadingSpinnerMock({ message }: LoadingSpinnerProps) {
    return <Text>{message}</Text>;
  };
});

const mockedGetAll = hoagiesApi.getAll as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;
const mockedToast = toast as jest.Mocked<typeof toast>;

function makeNav() {
  return {
    setOptions: jest.fn(),
    navigate: jest.fn(),
  };
}

const baseColors = {
  background: '#000',
  text: '#fff',
  textSecondary: '#bbb',
  card: '#111',
  border: '#222',
  tint: '#0af',
};

function makeMockHoagie(overrides: Partial<Hoagie> = {}) {
  return {
    id: 'h1',
    name: 'Test Hoagie',
    commentCount: 0,
    creator: { id: 'u1', name: 'User' },
    ingredients: ['Bread', 'Cheese'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    ...overrides,
  } as Hoagie;
}

describe('HoagieListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      logout: jest.fn().mockResolvedValue(undefined),
    });

    mockedUseTheme.mockReturnValue({
      colors: baseColors,
      toggleTheme: jest.fn(),
      theme: 'light',
    });
  });

  it('shows loading spinner then empty state when API returns no hoagies', async () => {
    mockedGetAll.mockResolvedValueOnce({
      data: [],
      meta: { total: 0, hasNextPage: false },
    });

    const navigation = makeNav();

    const { getByText, queryByText } = render(
      <HoagieListScreen navigation={navigation as any} route={{} as any} />
    );

    expect(getByText('Loading hoagies...')).toBeTruthy();

    await waitFor(() => {
      expect(queryByText('Loading hoagies...')).toBeNull();
      expect(getByText('No hoagies yet')).toBeTruthy();
      expect(getByText('Be the first to create one!')).toBeTruthy();
    });

    expect(mockedGetAll).toHaveBeenCalledWith(1, 10);
  });

  it('renders hoagies and navigates to HoagieDetail when a card is pressed', async () => {
    mockedGetAll.mockResolvedValueOnce({
      data: [makeMockHoagie({ id: 'h1', name: 'Italian' })],
      meta: { total: 1, hasNextPage: false },
    });

    const navigation = makeNav();

    const { getByTestId, queryByText, getByText } = render(
      <HoagieListScreen navigation={navigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(queryByText('Loading hoagies...')).toBeNull();
      expect(getByTestId('hoagie-card-h1')).toBeTruthy();
    });

    expect(getByText('Showing 1 of 1 hoagies')).toBeTruthy();

    fireEvent.press(getByTestId('hoagie-card-h1'));

    expect(navigation.navigate).toHaveBeenCalledWith('HoagieDetail', {
      id: 'h1',
    });
  });

  it('filters hoagies based on search query', async () => {
    mockedGetAll.mockResolvedValueOnce({
      data: [
        makeMockHoagie({ id: 'h1', name: 'Italian' }),
        makeMockHoagie({ id: 'h2', name: 'Turkey' }),
      ],
      meta: { total: 2, hasNextPage: false },
    });

    const navigation = makeNav();
    const { getByPlaceholderText, getByText, queryByText } = render(
      <HoagieListScreen navigation={navigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(queryByText('Loading hoagies...')).toBeNull();
    });

    expect(getByText('Italian')).toBeTruthy();
    expect(getByText('Turkey')).toBeTruthy();
    expect(getByText('Showing 2 of 2 hoagies')).toBeTruthy();

    const searchInput = getByPlaceholderText('Search hoagies');
    fireEvent.changeText(searchInput, 'Ital');

    expect(getByText('Italian')).toBeTruthy();
    expect(queryByText('Turkey')).toBeNull();
    expect(getByText('Showing 1 of 2 hoagies')).toBeTruthy();
  });

  it('toasts error message when API fails', async () => {
    mockedGetAll.mockRejectedValueOnce({
      response: { data: { message: 'Nope' } },
    });

    const navigation = makeNav();
    const { queryByText, getByText } = render(
      <HoagieListScreen navigation={navigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(queryByText('Loading hoagies...')).toBeNull();
    });

    await waitFor(() => {
      expect(getByText('No hoagies yet')).toBeTruthy();
    });

    expect(mockedToast.error).toHaveBeenCalledWith('Nope');
  });
});
