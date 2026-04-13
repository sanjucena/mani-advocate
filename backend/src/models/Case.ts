// ============================================================
// 📁 models/Case.ts — Legal Case Schema & Model
// ============================================================
// The central entity of the app. Each case belongs to a client
// and has multiple hearings.
//
// INTERVIEW TIP: "When designing MongoDB schemas, think about
// your app's query patterns. We reference Client and embed
// notes because:
//   - Client is shared across cases → REFERENCE
//   - Notes are only accessed within a case → EMBED
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';

// Embedded sub-document interface for case notes
interface ICaseNote {
  content: string;
  date: Date;
}

export interface ICase extends Document {
  caseNumber: string;
  title: string;
  description?: string;
  client: mongoose.Types.ObjectId;
  caseType: string;
  court: string;
  judge?: string;
  opposingCounsel?: string;
  opposingParty?: string;
  status: 'active' | 'pending' | 'closed' | 'won' | 'lost' | 'settled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  filingDate?: Date;
  closingDate?: Date;
  notes: ICaseNote[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Sub-schema for embedded notes
// INTERVIEW TIP: "Sub-schemas let you define structure for
// embedded documents. They get their own _id by default."
const caseNoteSchema = new Schema<ICaseNote>({
  content: {
    type: String,
    required: [true, 'Note content is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const caseSchema = new Schema<ICase>(
  {
    caseNumber: {
      type: String,
      required: [true, 'Case number is required'],
      unique: true,
      trim: true,
      uppercase: true,  // Store case numbers in uppercase
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Reference to the Client model
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },
    caseType: {
      type: String,
      required: [true, 'Case type is required'],
      enum: [
        'civil',
        'criminal',
        'family',
        'property',
        'labour',
        'consumer',
        'tax',
        'corporate',
        'writ',
        'appeal',
        'other',
      ],
    },
    court: {
      type: String,
      required: [true, 'Court name is required'],
      trim: true,
    },
    judge: {
      type: String,
      trim: true,
    },
    opposingCounsel: {
      type: String,
      trim: true,
    },
    opposingParty: {
      type: String,
      trim: true,
    },
    // INTERVIEW TIP: "enum restricts a field to specific values.
    // MongoDB will reject any value not in this list."
    status: {
      type: String,
      enum: ['active', 'pending', 'closed', 'won', 'lost', 'settled'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    filingDate: {
      type: Date,
    },
    closingDate: {
      type: Date,
    },
    // Embedded notes array
    notes: [caseNoteSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Fetch hearings for this case
caseSchema.virtual('hearings', {
  ref: 'Hearing',
  localField: '_id',
  foreignField: 'case',
});

// Indexes for common queries
caseSchema.index({ status: 1, createdBy: 1 });
caseSchema.index({ client: 1 });
caseSchema.index({ caseNumber: 'text', title: 'text' });

const Case = mongoose.model<ICase>('Case', caseSchema);

export default Case;
