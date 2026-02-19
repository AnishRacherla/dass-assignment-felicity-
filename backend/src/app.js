import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import organizerRoutes from "./routes/organizerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:4173',
    ];
    
    // Allow all Vercel deployments
    const isVercel = origin && origin.includes('vercel.app');
    
    if (!origin || allowedOrigins.includes(origin) || isVercel) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS for frontend
app.use(express.json({ limit: "10mb" })); // Parse JSON with larger limit for images
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Felicity Event Management API",
    version: "1.0.0",
    status: "running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/feedback", feedbackRoutes);

// Test protected route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
