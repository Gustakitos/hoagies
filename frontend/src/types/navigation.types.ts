import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HoagieList: undefined;
  HoagieDetail: { id: string };
  CreateHoagie: undefined;
  EditHoagie: { id: string };
  AddCollaborator: { hoagieId: string };
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
};

export type BottomTabParamList = {
  Home: undefined;
  Create: undefined;
  Profile: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export type HoagieListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type HoagieEditScreenProps = NativeStackScreenProps<RootStackParamList, 'EditHoagie'>;
export type HoagieDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'HoagieDetail'>;

export type CreateHoagieScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Create'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type AddCollaboratorScreenProps = NativeStackScreenProps<RootStackParamList, 'AddCollaborator'>;
