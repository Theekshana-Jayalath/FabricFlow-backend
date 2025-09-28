import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from 'cors';
import orderRoutes from './routes/orderRoute.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});