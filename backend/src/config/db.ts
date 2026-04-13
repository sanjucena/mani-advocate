// ============================================================
// 📁 config/db.ts — Database Connection
// ============================================================
// INTERVIEW TIP: "Mongoose is an ODM (Object Data Modeling) library
// that provides schema-based modeling for MongoDB in Node.js."
//
// WHY THIS MATTERS:
// - mongoose.connect() returns a Promise → we use async/await
// - We handle errors gracefully and exit if DB fails
// - The connection string comes from .env (never hardcode secrets!)
// ============================================================

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    // Exit process with failure code
    // INTERVIEW TIP: process.exit(1) means "exit with error"
    // process.exit(0) means "exit successfully"
    process.exit(1);
  }
};

export default connectDB;
