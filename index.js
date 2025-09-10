import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from "cors";
import router from "./Route/UserRoute.js";
import employeeRoutes from "./Route/EmployeeRoute.js";
import authRoutes from "./Route/AuthRoute.js";

dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from 'cors';
import orderRoutes from './routes/orderRoute.js';
import driverRouter from './routes/driverRoutes.js';
  
dotenv.config()
const app = express();
const mongoUrl = process.env.MONGO_DB_URI

mongoose.connect(mongoUrl,{})
const connection = mongoose.connection; 

connection.once("open",() => {
    console.log("Database Connected!!");
})

app.listen(5000,() =>{
    console.log('Server is running on port 5000')
})