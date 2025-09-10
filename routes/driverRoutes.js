import express from 'express';
import { createDriver, deleteDriverById, getAllDrivers, getDriverById, updateDriverById } from '../controllers/driverControllers.js';

const driverRouter = express.Router()

driverRouter.post("/",createDriver)
driverRouter.get("/allDrivers",getAllDrivers)
driverRouter.get("/:id",getDriverById)
driverRouter.delete("/:id",deleteDriverById)
driverRouter.put("/:id",updateDriverById)


export default driverRouter;