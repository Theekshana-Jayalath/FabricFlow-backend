import express from 'express'
import mongoose from 'mongoose'
import dotenv from "dotenv"
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import userRouter from './routes/userRouter.js'
import employeeRouter from './routes/employeeRouter.js'
import driverRoutes from './routes/driverRoutes.js'
import orderRoute from './routes/orderRoute.js'
import vehicleRoute from './routes/vehicleRoute.js'
import distributionRoute from './routes/distributionRoute.js'

dotenv.config()
const app = express();

app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGO_DB_URI

mongoose.connect(mongoUrl).then(()=>{
    console.log("Database Connected!!");
})

app.use('/auth', authRoutes);
app.use('/users', userRouter);
app.use('/api/users', userRouter);
app.use('/employees', employeeRouter);
app.use('/api/drivers', driverRoutes);
app.use('/api/orders', orderRoute);
app.use('/api/vehicles', vehicleRoute);
app.use('/api/distributions', distributionRoute);

app.listen(5000,() =>{
    console.log('Server is running on port 5000')
})