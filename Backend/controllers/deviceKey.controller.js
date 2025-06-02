import expressAsyncHandler from 'express-async-handler';
import db from '../models/index.js';

const { DeviceKey, Device, Op, sequelize } = db;


// Configuration for key validity (could be moved to a config file)
// const DEFAULT_KEY_VALIDITY_DAYS = 30;



export const createDeviceKey = expressAsyncHandler(async (req, res) => {

    const { ownerDeviceGuid, peerDeviceGuid, keyType, keyHash, keyStatus } = req.body;

    if (!ownerDeviceGuid || !keyType) {
        const error = new Error("Owner Device GUID and Key Type are required.");
        error.status = 400;
        throw error;

    }

    if (keyType === 'pairwise' && !peerDeviceGuid) {
        const error = new Error("Peer Device GUID is required for pairwise keys.");
        error.status = 400;
        throw error;
    }

    // Find the owner device
    const ownerDevice = await Device.findOne({ where: { deviceGuid: ownerDeviceGuid } });

    if (!ownerDevice) {
        const error = new Error(`Owner device with GUID ${ownerDeviceGuid} not found.`);
        error.status = 404;
        throw error;
    }

    let peerDevice = null;

    if (peerDeviceGuid) {
        peerDevice = await Device.findOne({ where: { deviceGuid: peerDeviceGuid } });
        if (!peerDevice) {
            const error = new Error(`Owner device with GUID ${peerDeviceGuid} not found.`);
            error.status = 404;
            throw error;
        }
    }


    // Prevent duplicate key entries for the same pair and context (if nonce is used)
    // This check might need to be more sophisticated depending on your key update strategy
    const existingKeyQuery = {
        deviceId: ownerDevice.deviceId,
        keyType: keyType,
    };

    if (peerDevice) existingKeyQuery.peerDeviceId = peerDevice.deviceId;
    // if (keyContextNonce) existingKeyQuery.keyContextNonce = keyContextNonce; // Add if storing nonce

    const existingKey = await DeviceKey.findOne({ where: existingKeyQuery });


    // const now = new Date();
    // const validUntilDate = new Date(now.getTime() + DEFAULT_KEY_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

    //option 1 : existingKey -> Update the existing key
    if (existingKey) {

        // existingKey.validFrom = now; // Reset validFrom to now
        // existingKey.validUntil = validUntilDate;
        existingKey.keyHash = keyHash || existingKey.keyHash;;
        existingKey.keyStatus = keyStatus || 'active'; // Default to 'active' if not provided
        existingKey.keyVersion = (existingKey.keyVersion || 0) + 1;


        await existingKey.save();


        console.log(`SERVER: DeviceKey record updated for owner ${ownerDeviceGuid} and peer ${peerDeviceGuid || 'N/A'}.`);

        return res.status(200).send(existingKey);
    }


    const newKeyData = {
        deviceId: ownerDevice.deviceId,
        keyType: keyType,
        keyStatus: keyStatus || 'active',
        keyHash: keyHash,
        // keyContextNonce: keyContextNonce,
        // validFrom: now,  
        // validUntil: validUntilDate,
        keyVersion: 1
    };

    if (peerDevice) {
        newKeyData.peerDeviceId = peerDevice.deviceId; // Link to peer for pairwise
    }

    //option 2 : existingKey -> Create a new key
    const newDeviceKey = await DeviceKey.create(newKeyData);


    return res.status(201).json({ message: "Device key created successfully.", deviceKey: newDeviceKey });


});



export const getDeviceKeys = expressAsyncHandler(async (req, res) => {

    const deviceKeys = await DeviceKey.findAll();

    return res.status(200).json(deviceKeys);
});



export const updateDeviceKeyRefreshStatus = expressAsyncHandler(async (req, res) => {

    // acknowledgingDeviceGuid : The device that refreshed
    // processedTaskId : The ID of the task that was processed
    // refreshedPeerGuid : The GUID of the peer device that was refreshed (if applicable)
    // wasCentralRefresh : Boolean indicating if this was a central refresh (true) or peer refresh (false)
    // timestamp : The time when the refresh occurred (optional, can be used for logging)
    const { acknowledgingDeviceGuid, processedTaskId, refreshedPeerGuid, wasCentralRefresh, timestamp } = req.body;


    if (!acknowledgingDeviceGuid || !processedTaskId) {
        const error = new Error("Acknowledging device GUID and Task ID are required for key refresh status.");
        error.status = 400;
        throw error;
    }

    const acknowledgingDevice = await Device.findOne({ where: { deviceGuid: acknowledgingDeviceGuid } });

    if (!acknowledgingDevice) {
        return res.status(404).send({ message: `Acknowledging device ${acknowledgingDeviceGuid} not found.` });
    }


    let updatedCount = 0;

    // This is a "peer" device (B or C) reporting it refreshed its key with a specific peer (A).

    const peerDevice = await Device.findOne({ where: { deviceGuid: refreshedPeerGuid } });
    if (!peerDevice) {
        return res.status(404).send({ message: `Peer device ${refreshedPeerGuid} not found.` });
    }


    const [count] = await DeviceKey.update(
        { keyVersion: sequelize.literal('key_version + 1'), keyStatus: 'active', keyHash: newRefreshedKeyHash, updatedAt: new Date() },
        {
            where: {
                keyType: 'pairwise',
                keyStatus: { [Op.ne]: 'revoked' },
                [Op.or]: [
                    { deviceId: acknowledgingDevice.deviceId, peerDeviceId: peerDevice.deviceId },
                    { deviceId: peerDevice.deviceId, peerDeviceId: acknowledgingDevice.deviceId }
                ]
            }
        }
    );
    updatedCount = count;
    console.log(`SERVER: Central device ${acknowledgingDeviceGuid} reported refresh. Updated ${updatedCount} pairwise keys.`);




    res.status(200).send(
        { message: `DeviceKey records updated for ${acknowledgingDeviceGuid} due to refresh. Updated count: ${updatedCount}.` }
    );


})