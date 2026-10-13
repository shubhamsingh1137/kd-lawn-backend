const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const chatbotRoutes = require("./routes/chatbotRoutes");

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://kdutsav.com",
    "https://www.kdutsav.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/packages", require("./routes/packageRoutes"));
app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use(require("./routes/smsRoutes"));
app.use("/api/chatbot", chatbotRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Kalawati API running ✓" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
