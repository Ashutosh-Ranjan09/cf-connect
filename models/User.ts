import mongoose, { Document, Model, Types } from 'mongoose';
import { boolean } from 'zod';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string; // hashed
  isPrivate: Boolean;
  aboutme: string;
  links: string[];
  following: string[];
  follower: string[];
  requestSent: string[];
  requestRecieved: string[];
}

const UserSchema = new mongoose.Schema<IUser>({
  username: { type: string, required: true, unique: true },
  password: { type: string, required: true },
  isPrivate: { type: Boolean, required: true, default: true },
  aboutme: { type: string, default: '' },
  links: { type: [string], default: [] },
  follower: { type: [string], default: [] },
  following: { type: [string], default: [] },
  requestSent: { type: [string], default: [] },
  requestRecieved: { type: [string], default: [] },
});

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default UserModel;
