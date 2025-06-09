import expressAsyncHandler from "express-async-handler";
import db from "../models/index.js"
import { where } from "sequelize";

import cryptoService from "../service/crypto.service.js";


const { Gateway, Subset, Device, KeyTask } = db;



export const getAllTask = expressAsyncHandler(async (req, res) => {

    const tasks = await KeyTask.findAll({
        include: [
            {
                model: Subset,
                as: 'subset',
            },
            {
                model: Device,
                as: 'device',
            },
            {
                model: Gateway,
                as: 'gateway',
            }
        ],
        order:[['created_at', 'ASC']]
    });

    // tasks will be [] if none found (not null)
    res.status(200).json({
        message: 'success',
        data : tasks
    });
})


export const updateTask = expressAsyncHandler(async (req, res) => {

    const { status } = req.body;
    const { taskId } = req.params;

    const task = await KeyTask.findOne({
        where: { taskId }
    });

    if (!task) {
        const error = new Error("Ther No Task with this Id");
        error.status = "NotFound";
        error.statusCode = 404;
        throw error;
    }

    task.status = status;
    await task.save();

    res.status(200).json({
        message: 'update succssefully',
    });
})


export const scheduleKeyRefresh = expressAsyncHandler(async (req, res) => {

    const { subsetId, scheduleType, scheduleValue, recurrence, deviceId } = req.body;


    const adminUserId = req.user.id;

    if (!subsetId || !scheduleType) {
        const error = new Error("Subset ID and schedule type are required.");
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }


    const targetSubset = await Subset.findByPk(subsetId);

    if (!targetSubset) {
        const error = new Error(`Subset with ID ${subsetId} not found.`);
        error.status = "NotFound";
        error.statusCode = 404;
        throw error;
    }




    const now = new Date();


    if (scheduleType === 'ONCE_AT' && scheduleValue) {

        const scheduledAt = new Date(scheduleValue);

        if (isNaN(scheduledAt.getTime()) || scheduledAt < now) {
            throw new Error("Invalid or past scheduleValue for ONCE_AT.");
        }

         // Helper to create the task
        const createTask = async (devId) => {
            const uniqueRefreshNonce = cryptoService.generateSymmetricKey(16);
            const scheduledTaskPayload = {
                scheduleType,
                scheduleValue,
                refreshNonce: uniqueRefreshNonce,
                targetSubsetIdentifier: targetSubset.subsetIdentifier
            };
            const encryptedPayload = cryptoService.encryptForDatabase(JSON.stringify(scheduledTaskPayload));
            return KeyTask.create({
                taskType: 'scheduled',
                targetSubsetId: subsetId,
                targetDeviceId: devId,
                initiatedByUserId: adminUserId,
                status: 'scheduled',
                scheduledAt,
                recurrence: null,
                payload: encryptedPayload,
                resultMessage: `Scheduled for ${scheduledAt.toISOString()}`
            });
        };


        // If deviceId is provided, schedule for that device only
        if (deviceId) {
            await createTask(deviceId);
        }else{
            const devices = await Device.findAll({ where: { subsetId } });
            for (const device of devices) {
                await createTask(device.deviceId);
            }
        }

        return res.status(202).json({
            message: `Key refresh scheduled (ONCE_AT) for ${deviceId ? 'device' : 'all devices'}`
        });

    } 


    // Handle RECURRENCE (weekly/monthly)
    if (scheduleType === 'RECURRENCE' && recurrence && (recurrence === 'weekly' || recurrence === 'monthly') && scheduleValue) {
        const scheduledAt = new Date(scheduleValue);
        if (isNaN(scheduledAt.getTime()) || scheduledAt < now) {
            throw new Error("Invalid or past scheduleValue for recurrence.");
        }

        // Helper to create the recurring task
        const createRecurringTask = async (devId) => {
            const uniqueRefreshNonce = cryptoService.generateSymmetricKey(16);
            const scheduledTaskPayload = {
                scheduleType,
                scheduleValue,
                recurrence,
                refreshNonce: uniqueRefreshNonce,
                targetSubsetIdentifier: targetSubset.subsetIdentifier
            };
            const encryptedPayload = cryptoService.encryptForDatabase(JSON.stringify(scheduledTaskPayload));
            return KeyTask.create({
                taskType: 'recurring',
                targetSubsetId: subsetId,
                targetDeviceId: devId,
                initiatedByUserId: adminUserId,
                status: 'scheduled',
                scheduledAt,
                recurrence,
                payload: encryptedPayload,
                resultMessage: `Recurring (${recurrence}) scheduled for ${scheduledAt.toISOString()}`
            });
        };

        if (deviceId) {
            await createRecurringTask(deviceId);
        } else {
            const devices = await Device.findAll({ where: { subsetId } });
            for (const device of devices) {
                await createRecurringTask(device.deviceId);
            }
        }

        return res.status(202).json({
            message: `Recurring key refresh scheduled (${recurrence}) for ${deviceId ? 'device' : 'all devices'}`
        });
    }


    const error = new Error(`Unsupported schedule type: ${scheduleType}.`);
    error.status = "fail";
    error.statusCode = 400;
    throw error;
    

})
