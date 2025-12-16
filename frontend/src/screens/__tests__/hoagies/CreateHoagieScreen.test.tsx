import React from 'react';
import { render } from '@testing-library/react-native';
import CreateHoagieScreen from '../../hoagies/CreateHoagieScreen';

jest.mock('../../../api/endpoints');

describe('CreateHoagieScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };

  it('renders form', () => {
    const { getByText } = render(
      <CreateHoagieScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    expect(getByText('Hoagie Name *')).toBeTruthy();
    expect(getByText('Ingredients * (one per line)')).toBeTruthy();
  });
});
