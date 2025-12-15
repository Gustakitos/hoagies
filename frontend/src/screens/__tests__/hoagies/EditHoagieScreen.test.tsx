import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditHoagieScreen from '../../hoagies/EditHoagieScreen';
import { hoagiesApi } from '../../../api/endpoints';
import { Alert } from 'react-native';

jest.mock('../../../api/endpoints');
jest.spyOn(Alert, 'alert');

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
    ingredients: ['Bread'],
    collaborators: [{ id: 'user2', name: 'Collab User' }],
    creator: { id: 'user1', name: 'Creator' },
  };

  beforeEach(() => {
    (hoagiesApi.getById as jest.Mock).mockResolvedValue(mockHoagie);
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
      expect(getByText('Collab User')).toBeTruthy();
    });
  });

  it('invites a collaborator', async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditHoagieScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => expect(getByText('Invite')).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText('Enter email to invite'),
      'test@example.com'
    );

    (hoagiesApi.addCollaborator as jest.Mock).mockResolvedValue({
      ...mockHoagie,
      collaborators: [
        ...mockHoagie.collaborators,
        { id: 'new', name: 'New User' },
      ],
    });

    fireEvent.press(getByText('Invite'));

    await waitFor(() => {
      expect(hoagiesApi.addCollaborator).toHaveBeenCalledWith(
        '1',
        'test@example.com'
      );
      expect(getByText('New User')).toBeTruthy(); // Should appear in list
    });
  });
});
