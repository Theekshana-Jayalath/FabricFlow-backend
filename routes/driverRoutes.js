import express from 'express';
import { createDriver, deleteDriverById, getAllDrivers, getDriverById } from '../controllers/driverControllers.js';

const driverRouter = express.Router()

driverRouter.post("/",createDriver)
driverRouter.get("/allDrivers",getAllDrivers)
driverRouter.get("/:driverId",getDriverById)
driverRouter.delete("/:driverId",deleteDriverById)





export default driverRouter;