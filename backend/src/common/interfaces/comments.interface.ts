import { Types } from 'mongoose';

export interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

export interface CommentResponse {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
  };
  hoagie: string;
  createdAt: Date;
  updatedAt: Date;
}
