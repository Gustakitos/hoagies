import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateHoagieScreen from '../../hoagies/CreateHoagieScreen';
import { hoagiesApi } from '../../../api/endpoints';

jest.mock('../../../api/endpoints');

describe('CreateHoagieScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };

  it('renders form', () => {
    const { getByPlaceholderText, getByText } = render(
      <CreateHoagieScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    expect(getByText('Hoagie Name *')).toBeTruthy();
    expect(getByText('Ingredients * (one per line)')).toBeTruthy();
  });
});
