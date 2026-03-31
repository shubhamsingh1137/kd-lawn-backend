const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5175",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/gallery",  require("./routes/galleryRoutes"));
app.use("/api/packages", require("./routes/packageRoutes"));
app.use("/api/content",  require("./routes/contentRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use(require("./routes/smsRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Kalawati API running ✓" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
