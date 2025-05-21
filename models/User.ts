import mongoose, { Document, Model, Types } from 'mongoose';
import { boolean } from 'zod';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: String;
  password: String; // hashed
  isPrivate: Boolean;
  aboutme: String;
  links: String[];
  following: String[];
  follower: String[];
  requestSent: String[];
  requestRecieved: String[];
}

const UserSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPrivate: { type: Boolean, required: true, default: true },
  aboutme: { type: String, default: '' },
  links: { type: [String], default: [] },
  follower: { type: [String], default: [] },
  following: { type: [String], default: [] },
  requestSent: { type: [String], default: [] },
  requestRecieved: { type: [String], default: [] },
});

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default UserModel;
