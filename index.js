import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from 'cors';
import orderRoutes from './routes/orderRoute.js';
import driverRouter from './routes/driverRoutes.js';
  
dotenv.config()
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoUrl = process.env.MONGO_DB_URI;

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("Database Connected!!");
});

// Routes

import userRouter from './Route/UserRoute.js';
import employeeRouter from './Route/EmployeeRoute.js';
import authRouter from './Route/AuthRoute.js';

app.use('/api/orders', orderRoutes);
app.use('/api/drivers/', driverRouter);
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
import employeeRoutes from "./Route/EmployeeRoute.js";
import authRoutes from "./Route/AuthRoute.js";


app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

