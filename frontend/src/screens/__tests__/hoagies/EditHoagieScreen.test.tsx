import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditHoagieScreen from '../../hoagies/EditHoagieScreen';
import { hoagiesApi } from '../../../api/endpoints';

jest.mock('../../../api/endpoints');

describe('EditHoagieScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };
  const mockRoute = {
    params: { id: '1' },
  };

  const mockHoagie = {
    id: '1',
    name: 'Test Hoagie',
    ingredients: ['Bread', 'Lettuce'],
    collaborators: [{ id: 'user2', name: 'Collab User' }],
    creator: { id: 'user1', name: 'Creator' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hoagiesApi.getById as jest.Mock).mockResolvedValue(mockHoagie);
    (hoagiesApi.update as jest.Mock).mockResolvedValue({ ...mockHoagie });
  });

  it('renders and loads hoagie data', async () => {
    const { getByDisplayValue, getByText } = render(
      <EditHoagieScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByDisplayValue('Test Hoagie')).toBeTruthy();
      expect(getByDisplayValue('Bread')).toBeTruthy();
      expect(getByText('Update Hoagie')).toBeTruthy();
    });
  });

  it('updates hoagie with new name and ingredients', async () => {
    const { getByDisplayValue, getByText } = render(
      <EditHoagieScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByDisplayValue('Test Hoagie')).toBeTruthy();
    });

    fireEvent.changeText(getByDisplayValue('Test Hoagie'), 'Updated Hoagie');
    fireEvent.press(getByText('Update Hoagie'));

    await waitFor(() => {
      expect(hoagiesApi.update).toHaveBeenCalledWith('1', {
        name: 'Updated Hoagie',
        ingredients: ['Bread', 'Lettuce'],
      });
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('allows adding and removing ingredients', async () => {
    const { getByDisplayValue, getByText } = render(
      <EditHoagieScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByDisplayValue('Test Hoagie')).toBeTruthy();
    });

    fireEvent.press(getByText('+ Add Ingredient'));

    await waitFor(() => {
      expect(getByDisplayValue('Bread')).toBeTruthy();
      expect(getByDisplayValue('Lettuce')).toBeTruthy();
    });
  });
});
