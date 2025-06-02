import expressAsyncHandler from "express-async-handler";
import db from "../models/index.js"
import cryptoService from "../service/crypto.service.js";
import { where } from "sequelize";
import sessionService from "../service/session-store.service.js";


const { Gateway, Subset, Device, KeyTask, Op, DeviceKey } = db;


export const register = expressAsyncHandler(async (req, res) => {

    const {
        deviceName,
        subsetId,
        deviceType,
        localIdentifierInSubset, // device@01
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
    const deviceGuid = `${subset.subsetIdentifier}_device@${localIdentifierInSubset}`;


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
        taskType: 'provision_evkms_device',
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

    //extract subsetId from device that we fetch early to exracte the node for currect Subset and next and Previous
    const { subsetId } = device;

    const devicesInCurrentSubset = await Device.findAll({
        where: { subsetId },
        attributes: ['deviceGuid', 'initialSecretEncrypted', 'localIdentifierInSubset'],
        order: [['localIdentifierInSubset', 'ASC']] //:: Order by local ID
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
            attributes: ['deviceGuid', 'initialSecretEncrypted', 'localIdentifierInSubset'],
            order: [['localIdentifierInSubset', 'ASC']]
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
            attributes: ["deviceGuid", "initialSecretEncrypted", 'localIdentifierInSubset'],
            order: [['localIdentifierInSubset', 'ASC']]

        });

        Vn_secrets = devicesInNextSubset.map(dev => ({
            guid: dev.deviceGuid,
            secret: cryptoService.decryptFromDatabase(dev.initialSecretEncrypted)
        }));
    }

    return { Vc_secret, Vp_secrets, Vn_secrets }
})







//Revocked

export const revokeDevice = expressAsyncHandler(async (req, res) => {

    const { deviceGuid } = req.params;
    const adminUserId = req.user.id; // From authMiddleware

    const deviceToRevoke = await Device.findOne({
        where: { deviceGuid },
        include: [
            {
                model: Subset,
                as: 'subset',
                include: [
                    {
                        model: Gateway,
                        as: 'gateways',
                        where: { status: 'online' },
                        required: false,
                    }]
            }]
    });

    if (!deviceToRevoke) {
        const error = new Error(`Device ${deviceGuid} not found.`);
        error.status = "notFound";
        error.statusCode = 404;
        throw error;
    }

    if (!deviceToRevoke.subset || !deviceToRevoke.subset.gateways[0]) {
        const err = new Error(`Subset or Gateways Not Found`);
        err.status = "NotFound";
        err.statusCode = 404;
        throw err;
    }

    if (deviceToRevoke.status === 'revoked') {
        const error = new Error(`Device ${deviceGuid} is already revoked.`);
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }



    console.log(`SERVER: Initiating revocation for device ${deviceGuid} in subset ${deviceToRevoke.subset.subsetIdentifier}`);


    // 3. Mark the device as 'revoked' in the database immediately.

    deviceToRevoke.status = 'revoked';
    // Optionally: Clear its initialSecretEncrypted to prevent re-provisioning with old material.
    // deviceToRevoke.initialSecretEncrypted = null; // Consider implications
    await deviceToRevoke.save();
    console.log(`SERVER: Device ${deviceGuid} status updated to 'revoked' in database.`);



    // 4. Delete existing DeviceKey records associated with this device


    const RevockedDeviceKeys = await db.DeviceKey.findAll({
        where: {
            [Op.or]: [ // Op needs to be imported from sequelize in models/index.js and db.Op used
                { deviceId: deviceToRevoke.deviceId },
                { peerDeviceId: deviceToRevoke.deviceId }
            ]
        }
    });

    if (RevockedDeviceKeys.length === 0) {
        console.log(`SERVER: No DeviceKey records found for device ${deviceGuid}.`);
        return res.status(404).json({ message: `No DeviceKey records found for device ${deviceGuid}.` });
    }


    RevockedDeviceKeys.map(async (RevockedDeviceKey) => {
        RevockedDeviceKey.keyStatus = "revoked"; // Mark as revoked instead of deleting
        await RevockedDeviceKey.save();
    })




    console.log(`SERVER: Destroyed ${RevockedDeviceKeys} DeviceKey records associated with ${deviceGuid}.`);

    // 5. Create a KeyRedistributionTask for each relevant online gateway

    //    Type: 'process_device_revocation'


    const revocationPayloadForGateway = {
        revokedDeviceGuid: deviceToRevoke.deviceGuid,
        revokedDeviceSubsetId: deviceToRevoke.subset.subsetIdentifier, // To help gateway scope neighbor notifications
    };


    const encryptedRevocationPayloadForGateway = cryptoService.encryptForDatabase(JSON.stringify(revocationPayloadForGateway))


    await KeyTask.create({
        taskType: 'process_device_revocation',
        targetGatewayId: deviceToRevoke.subset.gateways[0].id, // Task assigned to this gateway
        targetSubsetId: deviceToRevoke.subset.id, // Subset where the device was revoked
        initiatedByUserId: adminUserId,
        status: 'pending',
        payload: encryptedRevocationPayloadForGateway, // Information about the revoked node
        targetDeviceId: deviceToRevoke.deviceId
    });

    console.log(`SERVER: Created revocation task for gateway ${deviceToRevoke.subset.gateways[0]} regarding device ${deviceGuid}.`);



    res.status(202).send({
        message: `Revocation process initiated for device ${deviceGuid}. Status set to 'revoked'. Revocation tasks created for gateways.`,
        deviceStatus: deviceToRevoke.status
    });

});



//rotation || refresh

export const refreshDevicePairwiseKeys = expressAsyncHandler(async (req, res) => {

    const { deviceGuid } = req.params; // Or subsetId if refreshing a whole subset
    const adminUserId = req.user.id; // From authMiddleware

    if (!deviceGuid) {
        const error = new Error("Device GUID is required to initiate key refresh.");
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }


    const deviceToRefresh = await Device.findOne({
        where: { deviceGuid },
        include: [{
            model: Subset,
            as: 'subset',
            include: [{ model: Gateway, as: 'gateways', where: { status: 'online' }, required: false }]
        }]
    });



    if (!deviceToRefresh || !deviceToRefresh.subset || !deviceToRefresh.subset.gateways || deviceToRefresh.subset.gateways.length === 0) {
        const err = new Error(`Device ${deviceGuid} not found, or no online gateway in its subset.`);
        err.status = "NotFound";
        err.statusCode = 404;
        throw err;
    }


    // Always include the central device in the refresh operation

    //Device A 
    const uniqueDeviceIds = new Set([deviceToRefresh.deviceId]);

    // Identify all devices involved in active pairwise keys with deviceToRefresh ---

    // Device A get hes peerDeviceId from DeviceKey if he are deviceId or peerDeviceId 

    const involvedKeyRecords = await DeviceKey.findAll({
        where: {
            keyType: 'pairwise',
            keyStatus: 'active',
            [Op.or]: [
                { deviceId: deviceToRefresh.deviceId },
                { peerDeviceId: deviceToRefresh.deviceId }
            ]
        },
        attributes: ['deviceId', 'peerDeviceId'],
        raw: true
    });


    //  make list  id unique
    involvedKeyRecords.forEach(key => {
        uniqueDeviceIds.add(key.deviceId);
        uniqueDeviceIds.add(key.peerDeviceId);
    });

    // Fetch details for all unique devices (A, B, C) that need to be informed
    const affectedDevices = await Device.findAll({
        where: { deviceId: Array.from(uniqueDeviceIds) },
        include: [{
            model: Subset,
            as: 'subset',
            include: [{
                model: Gateway,
                as: 'gateways',
                where: { status: 'online' },
                required: false
            }]
        }]
    });




    // Generate a SINGLE refreshNonce for this entire operation ---

    const refreshNonce = cryptoService.generateSymmetricKey(16);


    const refreshTasksCreated = [];
    const deviceStatusesToUpdate = [];

    //devices (A, B, C)
    for (const affectedDevice of affectedDevices) {

        const responsibleGateway = affectedDevice.subset.gateways[0]

        if (!responsibleGateway) {
            console.warn(`No online gateway for ${affectedDevice.deviceGuid}`);
            deviceStatusesToUpdate.push({
                deviceId: affectedDevice.deviceId,
                status: 'key_refresh_failed',

            });
            continue;
        }


        const currentRefreshPayload = {

            refreshNonce: refreshNonce, // The 'r' value for K'ij = Hash(Kij, r)
        };

        let payloadType;

        if (affectedDevice.deviceId === deviceToRefresh.deviceId) {
            // This is the "central" device (A)
            // It's typically told to refresh all its own pairwise keys related to this nonce.
            // It holds keys with B and C. It needs to apply refreshNonce to *all* its keys.
            payloadType = "REFRESH_ALL_RELATED_PAIRWISE_KEYS"; // New type
            currentRefreshPayload.triggeringDeviceGuid = deviceToRefresh.deviceGuid; // This is itself
        } else {
            payloadType = "REFRESH_SPECIFIC_PAIRWISE_KEY"; // New type
            currentRefreshPayload.targetPeerGuid = deviceToRefresh.deviceGuid;
        }

        currentRefreshPayload.type = payloadType;



        const encryptedRefreshPayload = cryptoService.encryptForDatabase(JSON.stringify(currentRefreshPayload));

        // Create a task for the primary gateway
        const newTask = await KeyTask.create({
            taskType: 'refresh_pairwise_keys',
            targetDeviceId: affectedDevice.deviceId,
            targetGatewayId: responsibleGateway.id,
            targetSubsetId: affectedDevice.subset.id,
            initiatedByUserId: adminUserId,
            status: 'pending',
            payload: encryptedRefreshPayload
        });

        refreshTasksCreated.push(newTask.taskId);

        deviceStatusesToUpdate.push({ deviceId: affectedDevice.deviceId, status: 'key_refresh_pending' }); // Set status


        console.log(`SERVER: Created refresh task ${newTask.taskId} for device ${affectedDevice.deviceGuid} via gateway ${responsibleGateway.gatewayGuid}.`);


    }

    // --- 4. Update device statuses and return ---
    await Promise.all(
        deviceStatusesToUpdate.map(update =>
            Device.update({ status: update.status },
                { where: { deviceId: update.deviceId } })
        )
    );




    res.status(202).json({
        message: involvedKeyRecords.length === 0
            ? `Standalone refresh initiated for ${deviceGuid} (no peers found)`
            : `Key refresh initiated for ${affectedDevices.length} devices`,
        totalDevicesAffected: affectedDevices.length,
        tasksCreated: refreshTasksCreated,
        hadPeers: involvedKeyRecords.length > 0
    });


});



///
export const initiatePairwiseKeyRefreshForDevices = async (
    subsetId,
    refreshNonce,
    adminUserId,
    parentTaskId = null
) => {


    const devices = await Device.findAll({
        where: {
            subsetId: subsetId,
            status: 'running' // Only consider devices that are currently running
        },
        include: [{
            model: Subset,
            as: 'subset',
            include: [{
                model: Gateway,
                as: 'gateways',
                where: { status: 'online' },
                required: false
            }]
        }]
    });

    const refreshTasksCreated = [];

    for (const device of devices) {
        const gateway = device.subset.gateways[0];
        if (!gateway) continue;

        const refreshPayload = {
            type: "REFRESH_ALL_RELATED_PAIRWISE_KEYS",
            refreshNonce: refreshNonce,
            issuerGatewayGuid: gateway.gatewayGuid
        };

        const encryptedPayload = cryptoService.encryptForDatabase(JSON.stringify(refreshPayload));

        const newTask = await KeyTask.create({
            taskType: 'refresh_pairwise_keys',
            targetDeviceId: device.deviceId,
            targetGatewayId: gateway.id,
            targetSubsetId: device.subset.id,
            initiatedByUserId: adminUserId,
            status: 'pending',
            payload: encryptedPayload,
            parentTaskId: parentTaskId
        });

        refreshTasksCreated.push(newTask.taskId);
        await Device.update(
            { status: 'key_refresh_pending' },
            { where: { deviceId: device.deviceId } }
        );
    }

    return { refreshTasksCreated };
};