// ============================================================
// 📁 models/Hearing.ts — Court Hearing Schema & Model
// ============================================================
// Tracks hearing dates for each case. This is crucial for
// advocates who juggle multiple cases across courts.
//
// INTERVIEW TIP: "We keep Hearing as a separate collection
// (referenced) rather than embedding it in Case because:
//   1. We need to query hearings across ALL cases (e.g., 'show
//      me all hearings this week' regardless of which case)
//   2. A case might have 50+ hearings over years — embedding
//      would bloat the Case document"
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IHearing extends Document {
  case: mongoose.Types.ObjectId;
  date: Date;
  time?: string;
  court: string;
  courtRoom?: string;
  purpose: string;
  status: 'scheduled' | 'completed' | 'adjourned' | 'cancelled';
  outcome?: string;
  nextHearingDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hearingSchema = new Schema<IHearing>(
  {
    case: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Hearing date is required'],
    },
    time: {
      type: String,
      trim: true,
    },
    court: {
      type: String,
      required: [true, 'Court name is required'],
      trim: true,
    },
    courtRoom: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Hearing purpose is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'adjourned', 'cancelled'],
      default: 'scheduled',
    },
    outcome: {
      type: String,
      trim: true,
    },
    nextHearingDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// INTERVIEW TIP: "Compound index on { date: 1, status: 1 }
// speeds up the most common query: 'give me upcoming scheduled
// hearings sorted by date'. The 1 means ascending order."
hearingSchema.index({ date: 1, status: 1 });
hearingSchema.index({ case: 1 });
hearingSchema.index({ createdBy: 1, date: 1 });

const Hearing = mongoose.model<IHearing>('Hearing', hearingSchema);

export default Hearing;
