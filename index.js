import express from 'express'
import mongoose from 'mongoose'
import dotenv from "dotenv"

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