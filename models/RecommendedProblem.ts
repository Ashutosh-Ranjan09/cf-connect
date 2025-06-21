import mongoose, { Document, Model, Types } from 'mongoose';

export interface IRecommendedProblem extends Document {
  userId: Types.ObjectId;
  problemId: string;
  name: string;
  rating: number;
  tags: string[];
  solvedCount: number;
  link: string;
  lastUpdated: Date;
}

const RecommendedProblemSchema = new mongoose.Schema<IRecommendedProblem>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  tags: { type: [String], required: true },
  solvedCount: { type: Number, required: true },
  link: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

const RecommendedProblemModel: Model<IRecommendedProblem> =
  mongoose.models.RecommendedProblem || mongoose.model<IRecommendedProblem>('RecommendedProblem', RecommendedProblemSchema);

export default RecommendedProblemModel;
