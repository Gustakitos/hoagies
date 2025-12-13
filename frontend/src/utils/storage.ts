import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const THEME_KEY = 'app_theme';

export const storage = {
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async saveUser(user: string): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, user);
  },

  async getUser(): Promise<string | null> {
    return await SecureStore.getItemAsync(USER_KEY);
  },

  async removeUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async saveTheme(theme: 'light' | 'dark'): Promise<void> {
    await SecureStore.setItemAsync(THEME_KEY, theme);
  },

  async getTheme(): Promise<'light' | 'dark' | null> {
    const theme = await SecureStore.getItemAsync(THEME_KEY);
    return theme as 'light' | 'dark' | null;
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      this.removeUser(),
      SecureStore.deleteItemAsync(THEME_KEY),
    ]);
  },
};
