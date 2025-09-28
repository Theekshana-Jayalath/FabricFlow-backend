import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from 'cors';
import orderRoutes from './routes/orderRoute.js';
import distributionRoutes from './routes/distributionRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import userRouter from './Route/UserRoute.js';
import employeeRouter from './Route/EmployeeRoute.js';
import authRouter from './Route/AuthRoute.js';
  
dotenv.config()
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoUrl = process.env.MONGO_DB_URI;

if (!mongoUrl) {
    console.error("MONGO_DB_URI is not defined in environment variables");
    process.exit(1);
}

mongoose.connect(mongoUrl);

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("Database Connected!!");
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use("/users", userRouter); // all user routes
app.use("/employees", employeeRouter);
app.use("/auth", authRouter); // authentication routes

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

