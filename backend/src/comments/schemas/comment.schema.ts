import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { Hoagie } from '../../hoagies/schemas/hoagie.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, minlength: 1, maxlength: 500 })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Hoagie', required: true })
  hoagie: Types.ObjectId | Hoagie;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
