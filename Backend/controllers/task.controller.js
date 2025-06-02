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
        ]
    });

    // tasks will be [] if none found (not null)
    res.status(200).json({
        message: 'success',
        tasks
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

    const { subsetId, scheduleType, scheduleValue } = req.body;
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



    let scheduledAt;
    const now = new Date();

    if (scheduleType === 'ONCE_NOW') {


        scheduledAt = now;


    } else if (scheduleType === 'ONCE_AT' && scheduleValue) {

        scheduledAt = new Date(scheduleValue);

        if (isNaN(scheduledAt.getTime())) {
            const error = new Error("Invalid scheduleValue for ONCE_AT.");
            error.status = "fail";
            error.statusCode = 400;
            throw error;
        }

        if (scheduledAt < now) {
            const error = new Error("Scheduled date cannot be in the past.");
            error.status = "fail";
            error.statusCode = 400;
            throw error;
        }

    } else {
        const error = new Error(`Unsupported schedule type: ${scheduleType}.`);
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }



    const uniqueRefreshNonce = cryptoService.generateSymmetricKey(16);

    const scheduledTaskPayload = {
        scheduleType: scheduleType,
        scheduleValue: scheduleValue,
        refreshNonce: uniqueRefreshNonce,
        targetSubsetIdentifier: targetSubset.subsetIdentifier
    };

    const encryptedPayload = cryptoService.encryptForDatabase(JSON.stringify(scheduledTaskPayload));

    const newTask = await KeyTask.create({
        taskType: 'scheduled_pairwise_key_refresh_orchestration',
        targetSubsetId: subsetId,
        initiatedByUserId: adminUserId,
        status: 'scheduled',
        scheduledAt: scheduledAt,
        payload: encryptedPayload,
        resultMessage: `Scheduled for ${scheduledAt.toISOString()}`
    });

    res.status(202).json({
        message: `Key refresh scheduled for subset ${targetSubset.subsetIdentifier}`,
        taskId: newTask.taskId,
        scheduledAt: newTask.scheduledAt
    });
})
