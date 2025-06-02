import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import subsetRoute from "./subset.route.js"
import gatewayRoute from "./gateway.route.js"
import deviceRoute from "./device.route.js"
import taskRoute from "./task.route.js";
import deviceKeyRoutes from "./deviceKey.route.js";

const router = express.Router();



router.use('/auth', authRoutes);
router.use('/user', userRoutes);

router.use('/subset', subsetRoute);
router.use('/gateway', gatewayRoute);


router.use('/device', deviceRoute);

router.use('/task', taskRoute);

router.use('/device-key', deviceKeyRoutes);

// router.use('/v1/devices', deviceRoutes);
router.get('/health', (req, res) => res.status(200).send('OK'));

export default router;
