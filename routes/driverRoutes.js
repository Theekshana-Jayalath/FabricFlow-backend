import express from 'express';
import { createDriver, getAllDrivers, getDriverById } from '../controllers/driverControllers.js';

const driverRouter = express.Router()

driverRouter.post("/",createDriver)
driverRouter.get("/allDrivers",getAllDrivers)
driverRouter.get("/:driverId",getDriverById)




export default driverRouter;