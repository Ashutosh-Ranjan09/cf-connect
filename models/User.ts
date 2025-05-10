import mongoose, { Document, Model, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string; // hashed
  aboutme: string;
  links: string[];
  following: string[];
  follower: string[];
}

const UserSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  aboutme: { type: String, default: '' },
  links: { type: [String], default: [] },
  follower: { type: [String], default: [] },
  following: { type: [String], default: [] },
});

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default UserModel;
