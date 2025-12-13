export interface Hoagie {
  id: string;
  name: string;
  ingredients: string[];
  pictureUrl?: string;
  creator: {
    id: string;
    name: string;
    email?: string;
  };
  collaborators?: {
    id: string;
    name: string;
  }[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedHoagies {
  data: Hoagie[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface Comment {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
  };
  hoagie: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedComments {
  data: Comment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateHoagieData {
  name: string;
  ingredients: string[];
  pictureUrl?: string;
}

export interface CreateCommentData {
  text: string;
}
