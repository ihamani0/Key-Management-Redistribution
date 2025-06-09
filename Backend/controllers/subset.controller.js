import expressAsyncHandler from "express-async-handler";
import  db from "../models/index.js"

const { Subset } = db;
// Create a new Subset
export const create = expressAsyncHandler(async (req, res) => {

 

    //return subsetName and subsetIdentifier
    const { subsetName, subsetIdentifier } = req.body;


    if (!subsetName || !subsetIdentifier) {
        const error = new Error("Subset name and identifier are required!");
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }

    // Create a Subset object
    const subset = {
        subsetName,
        subsetIdentifier,
        description: req.body?.description || "",
    };

    //create subset in database

    const data = await Subset.create(subset)

    //return successed

    res.status(200).json({
        message: "Subset Created successfully!",
        data
    });
});


export const retriveAll = expressAsyncHandler(async (req, res) => {

    const data = await Subset.findAll();

    if (!data || data.length === 0) {
        const error = new Error("No subset data found.");
        error.status = "notFound";
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json({
        message: "Subset Retrive successfully!",
        data
    });
})

export const deleteSubset = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        const error = new Error("Subset ID is required!");
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }

    // Find the subset by ID
    const subset = await Subset.findByPk(id);

    if (!subset) {
        const error = new Error("Subset not found.");
        error.status = "notFound";
        error.statusCode = 404;
        throw error;
    }

    // Delete the subset
    await subset.destroy();

    res.status(200).json({
        message: "Subset deleted successfully!",
    });
}   

);