import expressAsyncHandler from "express-async-handler";
import db from "../models/index.js"

import cryptoService from "../service/crypto.service.js";
import sessionStoreService from "../service/session-store.service.js"
import { where } from "sequelize";

const { Gateway, Subset, KeyTask, Device } = db;



//Register gateway
export const register = expressAsyncHandler(async (req, res) => {

    // gatewayGuid : gateway id 
    // authenticationKeyPublic : public key for the getway 
    const { gatewayGuid, authenticationKeyPublic, subsetId } = req.body;

    if (!gatewayGuid || !authenticationKeyPublic) {
        const error = new Error("Gateway GUID and Public Key are required!");
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }


    const gatewayData = {
        gatewayGuid,
        gatewayName: req.body.gatewayName,
        subsetId: subsetId || null, // Optional: assign to subset during registration
        authenticationKeyPublic, // Store the gateway's public key
        status: 'offline', // Gateways start as offline
    };


    //check if getwayId exsist in database 
    const existingGateway = await Gateway.findOne({ where: { gatewayGuid: gatewayData.gatewayGuid } });

    if (existingGateway) {
        const error = new Error("Gateway with this GUID already exists.");
        error.status = "error";
        error.statusCode = 409;
        throw error;
    }

    const data = await Gateway.create(gatewayData);

    res.status(200).json({
        message: `Gateway ${data.gatewayGuid} registered with public key -${data.authenticationKeyPublic.substring(0, 10) || '.......'}.`,
        data
    });
})


export const Authenticate = expressAsyncHandler(async (req, res) => {


    const { gatewayGuid, payload, signature } = req.body;

    if (!gatewayGuid || !payload || !signature) {
        const error = new Error("Missing gatewayGuid, payload, or signature.");
        error.status = "fail";
        error.statusCode = 400;
        throw error;

    }


    const gateway = await Gateway.findOne({ where: { gatewayGuid: gatewayGuid } });

    if (!gateway) {
        const error = new Error(`Authentication attempt from unknown gateway: ${gatewayGuid}`);
        error.status = "NotFound";
        error.statusCode = 404;
        throw error;

    }

    if (!gateway.authenticationKeyPublic) {
        // console.log(`SERVER: No public key registered for gateway: ${gatewayGuid}`);
        const error = new Error("Gateway not fully provisioned (no public key).");
        error.status = "NotFound";
        error.statusCode = 401;
        throw error;
    }



    // **Placeholder Signature Verification**
    const isSignatureValid = cryptoService.verifySignature(JSON.stringify(payload), signature, gateway.authenticationKeyPublic);

    if (!isSignatureValid) {
        console.log(`SERVER: Invalid signature for gateway: ${gatewayGuid}`);
        const error = new Error("Authentication failed: Invalid signature.");
        error.status = "fail";
        error.statusCode = 401;
        throw error;
    }

    // We will establish a session token or session key here in future using handshake
    // Generate session key

    //generate sessionKey   32  Buffer -> hex
    const sessionKey = cryptoService.generateSymmetricKey();


    console.log("Server: Key Buffer", Buffer.from(sessionKey, 'hex'))

    //encryptes Session Key Buffer-> Hex with publicKey 
    const encryptedSessionKey = cryptoService.encryptWithPublicKey(
        sessionKey,
        gateway.authenticationKeyPublic
    );


    console.log("Establish Session Key for this Gateway", encryptedSessionKey);


    //saving session key in memory in hex format 
    sessionStoreService.saveSessionKey(gatewayGuid, sessionKey)


    // If authentication is successful:
    // 1. Update gateway status, last_seen_at, ip_address

    gateway.status = 'online';
    gateway.lastSeenAt = new Date();
    gateway.ipAddress = req.ip; // Get IP from request
    await gateway.save();

    console.log(`SERVER: Gateway ${gatewayGuid} authenticated successfully from IP ${req.ip}.`);




    // For now, just send a success message
    res.status(200).send({
        message: "Gateway authenticated successfully.",
        gatewayName: gateway.gatewayName,
        sessionKeyEncrypted: encryptedSessionKey // sending in Base64 formta 
    });

})



export const getAll = expressAsyncHandler(async (req, res) => {
    const data = await Gateway.findAll(
        {
            include: [
                {
                    model: Subset,
                    as: 'subset'
                }
            ]
        }); // Include subset info

    if (!data || data.length === 0) {
        const error = new Error("No Data found.");
        error.status = "notFound";
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({
        message: "Subset Retrive successfully!",
        data
    });
});





// Gateway Polls for Tasks 
export const getGatewayTask = expressAsyncHandler(async (req, res) => {
    const { gatewayGuid } = req.params;

    if (!gatewayGuid) {
        const error = new Error("Missing gatewayGuid !.");
        error.status = "fail";
        error.statusCode = 400;
        throw error;
    }

    // fetech details of gateways for hes Id
    const gatewayDetails = await Gateway.findOne({
        where: { gatewayGuid },
        attributes: ['id']
    });

    if (!gatewayDetails) {
        const error = new Error("Gateway Not Found !.");
        error.status = "NotFound";
        error.statusCode = 404;
        throw error;
    }

    //fetch Task that belongs to Gateway that are in pending  status

    const tasks = await KeyTask.findAll({
        where: { targetGatewayId: gatewayDetails.id, status: 'pending' },
        include: [{ model: Device, as: 'device' }]
    });


    // Convert each task into a plain object, then replace payload.
    const processedTasks = tasks.map(task => {
        // 1) toPlainObject strips circular refs:
        const plain = task.get({ plain: true });

        // 2) Decrypt the payload (still a string in DB)
        plain.payload = cryptoService.decryptFromDatabase(plain.payload);

        return plain;
    });


    res.status(200).json({
        message: "tasks Details Retrive successfully!",
        tasks: processedTasks
    });
})


