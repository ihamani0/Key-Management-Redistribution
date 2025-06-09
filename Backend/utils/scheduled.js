import cron from 'node-cron';
import db from '../models/index.js';
import cryptoService from '../service/crypto.service.js';
import { initiatePairwiseKeyRefreshForDevices } from '../controllers/device.controller.js';

const { KeyTask, Op } = db;

const processScheduledTask = async (task) => {
    try {
        console.log(`Processing scheduled task ${task.taskId} for subset ${task.targetSubsetId}`);

        // Update task status to in-progress
        await KeyTask.update({ status: 'in_progress' }, 
            { where: { taskId: task.taskId } });

        // Decrypt payload to get refresh nonce
        const taskPayload = JSON.parse(cryptoService.decryptFromDatabase(task.payload));
        const refreshNonce = taskPayload.refreshNonce;

        

        // Create individual device refresh tasks
        const { refreshTasksCreated } = await initiatePairwiseKeyRefreshForDevices(
            task.targetSubsetId,
            refreshNonce,
            task.initiatedByUserId,
            task.taskId
        );

        // Update task status based on results
        if (refreshTasksCreated.length > 0) {
            await KeyTask.update({
                status: 'completed',
                resultMessage: `Spawned ${refreshTasksCreated.length} child tasks`
            }, { where: { taskId: task.taskId } });
        } else {
            await KeyTask.update({
                status: 'completed_no_devices',
                resultMessage: 'No active devices found'
            }, { where: { taskId: task.taskId } });
        }

    } catch (error) {
        console.error(`Error processing task ${task.taskId}:`, error);
        await KeyTask.update({
            status: 'failed',
            resultMessage: `Error: ${error.message}`
        }, { where: { taskId: task.taskId } });
    }
};

export const setupScheduler = () => {
    // Run every minute to check for due tasks
    cron.schedule('* * * * *', async () => {
        
        const now = new Date();
        
        const pendingTasks = await KeyTask.findAll({
            where: {
                status: 'scheduled',
                scheduledAt: { [Op.lte]: now },
                taskType: 'scheduled'
            },
            order: [['scheduledAt', 'ASC']]
        });

        for (const task of pendingTasks) {
            await processScheduledTask(task);
        }

        // Handle recurring tasks
        const pendingRecurringTasks = await KeyTask.findAll({
            where: {
                status: 'scheduled',
                scheduledAt: { [Op.lte]: now },
                taskType: 'recurring'
            },
            order: [['scheduledAt', 'ASC']]
        });

        for (const task of pendingRecurringTasks) {
            await processScheduledTask(task);

            let nextRun = new Date(task.scheduledAt);
            if (task.recurrence === 'weekly') {
                nextRun.setDate(nextRun.getDate() + 7);
            } else if (task.recurrence === 'monthly') {
                nextRun.setMonth(nextRun.getMonth() + 1);
            }else {
                continue; // Unknown recurrence, skip
            }

            await KeyTask.update(
                { scheduledAt: nextRun, status: 'scheduled' },
                { where: { taskId: task.taskId } }
            );
        }
    });
    console.log("Scheduler started. Checking tasks every minute.");
};