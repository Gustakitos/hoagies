import { apiClient } from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from '../types/auth.types';
import {
  PaginatedHoagies,
  Hoagie,
  CreateHoagieData,
  PaginatedComments,
  CreateCommentData,
  Comment,
} from '../types/hoagie.types';

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },
};

export const usersApi = {
  async search(email: string): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/search', {
      params: { email },
    });
    return response.data;
  },
};

export const hoagiesApi = {
  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedHoagies> {
    const response = await apiClient.get<PaginatedHoagies>('/hoagies', {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<Hoagie> {
    const response = await apiClient.get<Hoagie>(`/hoagies/${id}`);
    return response.data;
  },

  async create(data: CreateHoagieData): Promise<Hoagie> {
    const response = await apiClient.post<Hoagie>('/hoagies', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateHoagieData>): Promise<Hoagie> {
    const response = await apiClient.put<Hoagie>(`/hoagies/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/hoagies/${id}`);
    return response.data;
  },

  async addCollaborator(hoagieId: string, email: string): Promise<Hoagie> {
    const response = await apiClient.post<Hoagie>(
      `/hoagies/${hoagieId}/collaborators`,
      { email }
    );
    return response.data;
  },

  async removeCollaborator(
    hoagieId: string,
    userId: string
  ): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/hoagies/${hoagieId}/collaborators/${userId}`
    );
    return response.data;
  },
};

export const commentsApi = {
  async getByHoagieId(
    hoagieId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedComments> {
    const response = await apiClient.get<PaginatedComments>(
      `/hoagies/${hoagieId}/comments`,
      { params: { page, limit } }
    );
    return response.data;
  },
  async create(hoagieId: string, data: CreateCommentData): Promise<Comment> {
    const response = await apiClient.post<Comment>(
      `/hoagies/${hoagieId}/comments`,
      data
    );
    return response.data;
  },
};
