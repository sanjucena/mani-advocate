// ============================================================
// 📁 models/User.ts — User Schema & Model
// ============================================================
// INTERVIEW TIP: "A Mongoose Schema defines the structure of
// documents in a MongoDB collection, including validation rules,
// defaults, and middleware hooks."
//
// KEY CONCEPTS HERE:
// 1. Schema definition with TypeScript interface
// 2. Pre-save middleware (hook) for password hashing
// 3. Instance method for password comparison
// 4. Excluding password from JSON responses
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// TypeScript interface — defines what a User document looks like
// INTERVIEW TIP: "Interfaces ensure type safety. The Document
// extension gives us Mongoose document methods like .save()"
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'advocate';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],  // Custom error message
      trim: true,                              // Removes whitespace
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                            // Creates a unique index
      lowercase: true,                         // Converts to lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,  // IMPORTANT: Won't be returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'advocate'],  // Only these values allowed
      default: 'advocate',
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    // INTERVIEW TIP: "timestamps: true automatically adds
    // createdAt and updatedAt fields to every document"
    timestamps: true,
  }
);

// ============================================================
// PRE-SAVE MIDDLEWARE (Hook)
// ============================================================
// INTERVIEW TIP: "Pre-save hooks run before a document is saved.
// We use this to hash the password so we never store plain text."
//
// WHY isModified CHECK?
// Without it, the password would be re-hashed every time we
// update ANY field on the user (like changing their name).
// ============================================================
userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or has been modified
  if (!this.isModified('password')) return next();

  // Generate a salt (random data added to password before hashing)
  // 12 = salt rounds (higher = more secure but slower)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================================
// INSTANCE METHOD — Compare Password
// ============================================================
// INTERVIEW TIP: "Instance methods are available on individual
// document instances. We use this during login to verify the
// password the user typed matches the hashed version in the DB."
// ============================================================
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // bcrypt.compare hashes the candidate and compares with stored hash
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
// INTERVIEW TIP: "A Model is a constructor compiled from a Schema.
// It provides the interface for CRUD operations on the collection."
const User = mongoose.model<IUser>('User', userSchema);

export default User;
