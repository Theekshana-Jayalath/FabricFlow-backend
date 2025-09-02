import express from 'express'
import mongoose from 'mongoose'
import dotenv from "dotenv"
import driverRouter from './routes/driverRoutes.js';
  
dotenv.config()
const app = express();
const mongoUrl = process.env.MONGO_DB_URI

mongoose.connect(mongoUrl,{})
const connection = mongoose.connection; 

connection.once("open",() => {
    console.log("Database Connected!!");
})

app.use(express.json());

app.use("/api/drivers/",driverRouter);

app.listen(5000,() =>{
    console.log('Server is running on port 5000')
})