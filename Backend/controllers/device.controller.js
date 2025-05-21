import expressAsyncHandler from "express-async-handler";
import db from "../models/index.js"
import cryptoService from "../service/crypto.service.js";
import { where } from "sequelize";
import sessionService from "../service/session-store.service.js";


const { Gateway, Subset, Device, KeyTask } = db;


export const register = expressAsyncHandler(async (req, res) => {

    const {
        deviceName,
        subsetId,
        deviceType,
        localIdentifierInSubset,
        securityParameterAlpha = 5 } = req.body;

    if (!localIdentifierInSubset || !subsetId) {
        const error = new Error("local Identifier for Device and Subset ID are required!");
        error.status = "fail";
        error.statusCode = 400;
        throw error;

    }


    const subset = await Subset.findByPk(subsetId);

    if (!subset) {
        const error = new Error("Subset not found.");
        error.status = "NotFound";
        error.statusCode = 404;
        throw error;
    }

    // Generate deviceGuid = subsetId.localIdentifierInSubset
    const deviceGuid = `${subsetId}.${localIdentifierInSubset}`;


    // For EVKMS: Generate the device's unique initial secret (S_i)
    // This secret needs to be securely generated and stored.
    const initialDeviceSecretPlain = cryptoService.generateInitialRandomSecrete(); // Example: 128-bit secret
    const initialSecretEncrypted = cryptoService.encryptForDatabase(initialDeviceSecretPlain);

    const deviceData = {
        deviceGuid,
        deviceName,
        subsetId,
        deviceType,
        localIdentifierInSubset,
        initialSecretEncrypted, // Store the *encrypted* secret
        securityParameterAlpha,
        status: 'unprovisioned', // Device needs to be provisioned with keys
    };


    const newDeviceRegister = await Device.create(deviceData);

    console.log(`SERVER: Device ${newDeviceRegister.deviceGuid} registered. Initial secret (encrypted) stored.`);
    console.log(`SERVER: Plaintext secret for provisioning ${newDeviceRegister.deviceGuid}: ${initialDeviceSecretPlain} (DO NOT LOG IN PRODUCTION)`);




    res.status(201).json({
        message: 'Device registered successfully',
        device: {
            deviceGuid: newDeviceRegister.deviceGuid,
            status: newDeviceRegister.status,
            registeredAt: newDeviceRegister.createdAt
        }
    });
});



export const getDeviceByGuid = expressAsyncHandler(async (req, res) => {
    const { deviceGuid } = req.params;



    if (!deviceGuid) {
        const error = new Error("deviceGuid are required!.");
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }

    const device = await Device.findOne({
        where: { deviceGuid },
        include: [
            {
                model: Subset,
                as: 'subset',
                include: [
                    {
                        model: Gateway,
                        as: 'gateways'      // make sure your association uses this alias, or omit `as` if none
                    }
                ]
            }
        ] // fetch subset device -> belongTo -> subset
    });

    if (!device) {
        const err = new Error(`Device Not Found With This Id ${deviceGuid}`);
        err.status = "NotFound";
        err.statusCode = 404;
        throw err;
    }

    // No need for a second query—`device.subset.gateways` is already populated
    res.status(200).json({
        message: 'success',
        device
    });
});


// 3. Get all devices
export const getAllDevices = expressAsyncHandler(async (_, res) => {

    const devices = await Device.findAll({
        include: [
            {
                model: Subset,
                as: 'subset',
                include: [
                    { model: Gateway, as: "gateways" }        // will fetch gateways for each subset
                ]
            }
        ]
    });

    // devices will be [] if none found (not null)
    res.status(200).json({
        message: 'success',
        devices
    });

});





//Provision

export const provision = expressAsyncHandler(async (req, res) => {
    const { deviceGuid } = req.params;

    if (!deviceGuid) {
        const error = new Error("deviceGuid are required!.");
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }

    const adminUserId = req.user.id;

    const device = await Device.findOne({
        where: { deviceGuid },
        include: [
            {
                model: Subset,
                as: 'subset',
                include: [
                    {
                        where: { status: 'online' },
                        model: Gateway,
                        as: 'gateways',     // make sure your association uses this alias, or omit `as` if none
                        required: false, // include gateways if they exist
                    },
                    {
                        model: Subset,
                        as: "PreviousSubset"
                    },
                    {
                        model: Subset,
                        as: "NextSubset"
                    }
                ]
            }
        ] // fetch subset device -> belongTo -> subset
    });


    if (!device || !device.subset || !device.subset.gateways[0]) {
        const err = new Error(`Device , Subset or Gateways Not Found`);
        err.status = "NotFound";
        err.statusCode = 404;
        throw err;
    }



    // 3. Decrypt device's initial secret

    const secret_i = cryptoService.decryptFromDatabase(device.initialSecretEncrypted)

    // 

    const { Vc_secret, Vp_secrets, Vn_secrets } = await getNeighborSecrets(device)


    // 5. Create KeyRedistributionTask
    const payload = {
        subset_identifier: device.subset.subsetIdentifier,
        deviceGuid: device.deviceGuid,
        secret_i,
        Vectore_c: Vc_secret.map(s => s.secret),
        Vectore_p: Vp_secrets.map(s => s.secret),
        Vectore_n: Vn_secrets.map(s => s.secret),
        alpha: device.securityParameterAlpha,
        subsetInfo: {
            currentSubset: device.subset.subsetIdentifier,
            previousSubset: device.subset.PreviousSubset?.subsetIdentifier || null,
            nextSubset: device.subset.NextSubset?.subsetIdentifier || null
        }
    }

    // get Key session between server <--> gateway corresponding to subset
    // const getewayId = device.subset.gateways[0].gatewayGuid

    // const sessionKey = sessionService.getSessionKey(getewayId);


    // if (!sessionKey) {
    //     const err = new Error(`Session Key Not Found , Try Establsh Session 'gateway with server' And Try Again`);
    //     err.status = "NotFound";
    //     err.statusCode = 404;
    //     throw err;
    // }



    // Encrpted payload in data base with Master Key encrption
    const encryptedPayload = cryptoService.encryptForDatabase(JSON.stringify(payload))

    //creating Task in database so each gateway get hes Task 

    const task = await KeyTask.create({
        taskType: 'provision_device',
        targetDeviceId: device.deviceId,
        targetGatewayId: device.subset.gateways[0].id,
        initiatedByUserId: adminUserId,
        targetSubsetId: device.subset.id,
        status: 'pending',
        payload: encryptedPayload
    });


    //Update status of device 
    device.status = "provisioning_pending",
        await device.save();

    res.status(202).json({
        message: `Provisioning task created for device ${deviceGuid}`,
        taskId: task.taskId
    });
})



/**
 * Retrieves and decrypts secrets from neighbor subsets for EVKMS vector construction
 * @param {Device} device - The target device
 * @returns {Object} - { Vp_secrets, Vc_secrets, Vn_secrets }
 */

const getNeighborSecrets = expressAsyncHandler(async (device) => {

    //extract subsetId from device that we fetch early to exracte the node for currect Subset and next and previse
    const { subsetId } = device;

    const devicesInCurrentSubset = await Device.findAll({
        where: { subsetId },
        attributes: ['deviceGuid', 'initialSecretEncrypted']
    })

    //after retrive all node in same subset we make decrypte for the secret_i each node 
    const Vc_secret = devicesInCurrentSubset.map(item => {
        const decryptedSecret = cryptoService.decryptFromDatabase(item.initialSecretEncrypted)
        return {
            guid: item.deviceGuid,
            secret: decryptedSecret
        }
    });

    //now we work with Vectore Previous if Exsists
    //  Fetch devices in Previous Subset (Vp)
    let Vp_secrets = [];
    if (device.subset.PreviousSubsetId) {
        console.log("--------exsits Previous Subset---------------")
        const deviceInPreviousSubset = await Device.findAll({
            where: { subsetId: device.subset.PreviousSubsetId.id },
            attributes: ['deviceGuid', 'initialSecretEncrypted']
        });

        Vp_secrets = deviceInPreviousSubset.map(item => ({
            guid: item.deviceGuid,
            secret: cryptoService.decryptFromDatabase(item.initialSecretEncrypted)
        }));
    }

    // . Fetch Next Subset Secrets
    let Vn_secrets = [];
    if (device.subset.NextSubset) {
        console.log("--------exsits Next Subset---------------",)
        const nextSubsetId = device.subset.NextSubset.id;
        const devicesInNextSubset = await Device.findAll({
            where: { subsetId: nextSubsetId },
            attributes: ["deviceGuid", "initialSecretEncrypted"]
        });

        Vn_secrets = devicesInNextSubset.map(dev => ({
            guid: dev.deviceGuid,
            secret: cryptoService.decryptFromDatabase(dev.initialSecretEncrypted)
        }));
    }

    return { Vc_secret, Vp_secrets, Vn_secrets }
})



/**
 * Retrieves and decrypts secrets from neighbor subsets for EVKMS vector construction
 * @param {Device} device - The target device
 * @returns {Object} - { Vp_secrets, Vc_secrets, Vn_secrets }
 */

export const updateDeviceStatus = expressAsyncHandler(async (req, res) => {
    const { status } = req.body;
    const { deviceGuid } = req.params;

    // Validate input
    if (!status || !deviceGuid) {
        const error = new Error("Status and Device Global UID are required");
        error.status = 'fail';
        error.statusCode = 400;
        throw error;
    }

    // Wait for the result of the async call
    const device = await Device.findOne({ where: { deviceGuid } });

    // Check if device exists
    if (!device) {
        const error = new Error("There is no device with this UID");
        error.status = 'NotFound';
        error.statusCode = 404;
        throw error;
    }

    // Update and save the device
    device.status = status;
    await device.save();

    res.status(200).json({ message: 'Update successful' });
});

