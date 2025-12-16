import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schema/user.schema';

export type HoagieDocument = Hoagie & Document;

@Schema({ timestamps: true })
export class Hoagie {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 100 })
  name: string;

  @Prop({ required: true, type: [String] })
  ingredients: string[];

  @Prop({ trim: true })
  pictureUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator: Types.ObjectId | User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  collaborators: Types.ObjectId[];
}

export const HoagieSchema = SchemaFactory.createForClass(Hoagie);
