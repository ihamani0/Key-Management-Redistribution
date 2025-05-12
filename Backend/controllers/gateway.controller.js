import expressAsyncHandler from "express-async-handler";
import { Gateway, Subset } from "../models/index.js"

// import crypto from "crypto"

// --- Placeholder Crypto Functions (Replace with real crypto later!) ---
// In a real scenario, you'd use a proper library like 'node-forge' or 'jose'
function verifySignature(payload, signature, publicKey) {
    // THIS IS A PLACEHOLDER - NOT SECURE
    console.log("SERVER: Verifying signature (Placeholder - always true for now)");
    console.log("SERVER: Received payload:", payload);
    console.log("SERVER: Received signature:", signature);
    console.log("SERVER: Using public key:", publicKey ? publicKey.substring(0, 30) + "..." : "N/A");
    return true; // For now, assume signature is always valid
}
// --- End Placeholder Crypto ---


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
    const isSignatureValid = verifySignature(payload, signature, gateway.authenticationKeyPublic);

    if (!isSignatureValid) {
        console.log(`SERVER: Invalid signature for gateway: ${gatewayGuid}`);
        const error = new Error("Authentication failed: Invalid signature.");
        error.status = "fail";
        error.statusCode = 401;
        throw error;
    }


    // If authentication is successful:
    // 1. Update gateway status, last_seen_at, ip_address

    gateway.status = 'online';
    gateway.lastSeenAt = new Date();
    gateway.ipAddress = req.ip; // Get IP from request
    await gateway.save();

    console.log(`SERVER: Gateway ${gatewayGuid} authenticated successfully from IP ${req.ip}.`);



    // We will establish a session token or session key here in future using handshake

    // For now, just send a success message
    res.status(200).send({
        message: "Gateway authenticated successfully.",
        gatewayName: gateway.gatewayName,
        // sessionToken: "DUMMY_SESSION_TOKEN_FOR_NOW" // Placeholder
    });

})



export const retriveAll = expressAsyncHandler(async (req, res) => {
    const data = await Gateway.findAll({ include: [Subset] }); // Include subset info

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
});