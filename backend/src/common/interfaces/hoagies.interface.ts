import { Types } from 'mongoose';

export interface HoagieCreator {
  id: Types.ObjectId;
  name: string;
  email?: string;
}

export interface HoagieCollaborator {
  id: Types.ObjectId;
  name: string;
}

export interface HoagieResponse {
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
  collaboratorCount?: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HoagieListItem {
  id: string;
  name: string;
  ingredients: string[];
  pictureUrl?: string;
  creator: {
    id: string;
    name: string;
  };
  commentCount: number;
  collaboratorCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AggregateHoagie {
  _id: Types.ObjectId;
  name: string;
  ingredients: string[];
  pictureUrl?: string;
  creator: HoagieCreator;
  commentCount: number;
  collaboratorCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AggregateHoagieDetail {
  _id: Types.ObjectId;
  name: string;
  ingredients: string[];
  pictureUrl?: string;
  creator: HoagieCreator;
  collaborators: HoagieCollaborator[];
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}
