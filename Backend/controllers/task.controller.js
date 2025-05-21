import expressAsyncHandler from "express-async-handler";
import db from "../models/index.js"
import { where } from "sequelize";



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