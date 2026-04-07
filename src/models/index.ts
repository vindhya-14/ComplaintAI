import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  text: string;
  source: string;
  createdAt: Date;
}

const ComplaintSchema: Schema = new Schema({
  text: { type: String, required: true },
  source: { type: String, default: 'user_input' },
  createdAt: { type: Date, default: Date.now }
});

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export interface IIssue extends Document {
  issue: string;
  category: string;
  sentiment: string;
  severity: number;
  frequency: number;
  priorityScore: number;
  priorityLevel: string;
  label: string; // loud/silent/critical
  createdAt: Date;
}

const IssueSchema: Schema = new Schema({
  issue: { type: String, required: true },
  category: { type: String, required: true },
  sentiment: { type: String, required: true },
  severity: { type: Number, required: true },
  frequency: { type: Number, required: true },
  priorityScore: { type: Number, required: true },
  priorityLevel: { type: String, required: true },
  label: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);

export interface ISprintTask extends Document {
  userStory: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  selectedForSprint: boolean;
  issueId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SprintTaskSchema: Schema = new Schema({
  userStory: { type: String, required: true },
  acceptanceCriteria: [{ type: String }],
  storyPoints: { type: Number, required: true },
  selectedForSprint: { type: Boolean, default: false },
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
  createdAt: { type: Date, default: Date.now }
});

export const SprintTask = mongoose.model<ISprintTask>('SprintTask', SprintTaskSchema);
