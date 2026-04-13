// ============================================================
// 📁 models/Client.ts — Client Schema & Model
// ============================================================
// A Client represents a person who hires the advocate.
// One client can have multiple cases.
//
// INTERVIEW TIP: "In MongoDB, we have two ways to model
// relationships:
//   1. Embedding  — store related data inside the document
//   2. Referencing — store just the ObjectId and look it up
// We use REFERENCING here because a client can have many cases
// and each case is complex enough to be its own document."
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;  // Which advocate added this client
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      // INTERVIEW TIP: "text index" allows full-text search
      // We add this at the schema level below with .index()
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // INTERVIEW TIP: "ref creates a reference to another model.
    // This enables Mongoose's .populate() to fetch the full
    // User document when we query clients."
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    // INTERVIEW TIP: "toJSON virtuals include virtual fields
    // when converting to JSON (like in API responses)"
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================
// VIRTUAL FIELD — Cases Count
// ============================================================
// INTERVIEW TIP: "Virtuals are fields that don't get stored
// in MongoDB but are computed on the fly. Here we create a
// virtual 'cases' field that fetches all cases for this client."
// ============================================================
clientSchema.virtual('cases', {
  ref: 'Case',           // The model to look up
  localField: '_id',     // Match this client's _id
  foreignField: 'client', // Against the Case's client field
});

// INTERVIEW TIP: "Indexes speed up queries. A text index on
// 'name' allows us to do full-text search like:
// Client.find({ $text: { $search: 'Kumar' } })"
clientSchema.index({ name: 'text' });
clientSchema.index({ createdBy: 1 });  // Speeds up "find my clients" queries
clientSchema.index({ phone: 1 });

const Client = mongoose.model<IClient>('Client', clientSchema);

export default Client;
