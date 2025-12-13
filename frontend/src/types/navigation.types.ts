import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HoagieList: undefined;
  HoagieDetail: { id: string };
  CreateHoagie: undefined;
  EditHoagie: { id: string };
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type HoagieListScreenProps = NativeStackScreenProps<RootStackParamList, 'HoagieList'>;
export type HoagieEditScreenProps = NativeStackScreenProps<RootStackParamList, 'EditHoagie'>;
export type HoagieDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'HoagieDetail'>;
export type CreateHoagieScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateHoagie'>;
