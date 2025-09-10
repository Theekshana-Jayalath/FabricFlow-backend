import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from "cors";
import router from "./Route/UserRoute.js";
import employeeRoutes from "./Route/EmployeeRoute.js";
import authRoutes from "./Route/AuthRoute.js";

dotenv.config();
const app = express();
const mongoUrl = process.env.MONGO_DB_URI;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use("/users", router); // all user routes
app.use("/employees", employeeRoutes);
app.use("/auth", authRoutes); // authentication routes

// MongoDB connection
mongoose.connect(mongoUrl, {})
  .then(() => console.log("✅ Database Connected!!"))
  .catch((err) => console.log("❌ DB Connection Failed: ", err));

const connection = mongoose.connection;

// ✅ Middleware to check DB connection status
app.use((req, res, next) => {
  if (connection.readyState === 1) {
    console.log("Middleware: Database is connected");
  } else {
    console.log("Middleware: Database not connected");
  }
  next();
});

// ✅ Test route
app.get("/check-db", (req, res) => {
  if (connection.readyState === 1) {
    res.send("✅ Database connection is working!");
  } else {
    res.status(500).send("❌ Database connection failed!");
  }
});

app.listen(5000, () => {
  console.log('🚀 Server is running on port 5000');
});
