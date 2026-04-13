// ============================================================
// 📁 server.ts — Application Entry Point
// ============================================================
// This is where everything comes together. Think of it as the
// "main()" of your application.
//
// INTERVIEW TIP: "The server.ts file is responsible for:
//   1. Loading environment variables
//   2. Connecting to the database
//   3. Setting up middleware (cors, json parser, logger)
//   4. Mounting routes
//   5. Setting up error handling
//   6. Starting the HTTP server
//
// The ORDER matters — especially error handling middleware,
// which must come AFTER all routes."
//
// REQUEST LIFECYCLE (important interview topic):
// ─────────────────────────────────────────────────────────────
// Client Request
//   → CORS middleware (checks if origin is allowed)
//   → JSON parser (parses request body)
//   → Morgan logger (logs the request)
//   → Route matching (/api/v1/cases → caseRoutes)
//   → Auth middleware (verifies JWT)
//   → Controller (business logic)
//   → Response sent back to client
//
// If any error occurs at any stage:
//   → Error handler middleware catches it
//   → Sends formatted error response
// ─────────────────────────────────────────────────────────────
// ============================================================

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import caseRoutes from './routes/caseRoutes';
import hearingRoutes from './routes/hearingRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// ============================================================
// 1. LOAD ENVIRONMENT VARIABLES
// ============================================================
// INTERVIEW TIP: "dotenv reads the .env file and adds its
// values to process.env. This keeps secrets (DB password,
// JWT secret) out of source code."
dotenv.config();

// ============================================================
// 2. CREATE EXPRESS APP
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 3. MIDDLEWARE SETUP
// ============================================================

// CORS — Cross-Origin Resource Sharing
// INTERVIEW TIP: "CORS allows your Angular frontend (port 4200)
// to make requests to your Express backend (port 3000). Without
// CORS, the browser blocks cross-origin requests for security."
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  })
);

// Parse JSON request bodies
// INTERVIEW TIP: "express.json() parses incoming JSON payloads.
// Without it, req.body would be undefined for POST/PUT requests."
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (only in development)
// INTERVIEW TIP: "Morgan logs every HTTP request. 'dev' format
// shows: method, url, status, response-time. Helpful for debugging."
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ============================================================
// 4. HEALTH CHECK ROUTE
// ============================================================
// INTERVIEW TIP: "A health check endpoint lets monitoring tools
// verify the server is running. It's also the first thing to
// test when deploying."
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mani Advocate API is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 5. MOUNT ROUTES
// ============================================================
// INTERVIEW TIP: "app.use('/api/v1/auth', authRoutes) means:
// 'For any request starting with /api/v1/auth, use the authRoutes
// router to handle it.' The /v1 is API versioning — if we later
// make breaking changes, we can create /v2 routes without
// breaking existing clients."
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/hearings', hearingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// ============================================================
// 6. HANDLE 404 — Route Not Found
// ============================================================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Check the API documentation.',
  });
});

// ============================================================
// 7. GLOBAL ERROR HANDLER (must be last middleware)
// ============================================================
app.use(errorHandler);

// ============================================================
// 8. START SERVER
// ============================================================
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start listening for requests
    app.listen(PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🏛️  Mani Advocate API Server              ║
  ║   📡 Running on: http://localhost:${PORT}      ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}            ║
  ╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// ============================================================
// HANDLE UNHANDLED PROMISE REJECTIONS
// ============================================================
// INTERVIEW TIP: "This catches any Promise rejection that
// wasn't caught with .catch() or try-catch. It's a safety net
// to prevent the server from silently failing."
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION:', err.message);
  process.exit(1);
});

export default app;
