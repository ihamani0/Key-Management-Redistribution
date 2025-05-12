// node_module
import dotenv from "dotenv";
// import crypto from "crypto";
import { sequelize } from "./models/index.js";

import app from './app.js';

dotenv.config();



// //--------------------------------------------------------------------------------------------

const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(() => {
    console.log('Database synchronized.');
    app.listen(PORT, '0.0.0.0' ,  () => console.log(`Server running on http://0.0.0.0:${PORT}`));
  })
  .catch(err => console.error('Error starting server:', err));


//--------------------------------------------------------------------------------------------

// const deviceRegistry = {
//   "RPi-001": { gatewayId: "Gateway-A", name: "Living Room Pi" },
//   "RPi-002": { gatewayId: "Gateway-A", name: "Kitchen Pi" },
//   "RPi-007": { gatewayId: "Gateway-B", name: "Garage Pi" },
// };

//--------------------------------------------------------------------------------------------






// //--------------------------------------------------------------------------------------------
// const API_KEY = process.env.GATEWAY_API_KEY; // Secret key the gateway must provide

// if (!API_KEY) {
//   console.error("FATAL ERROR: GATEWAY_API_KEY environment variable is not set.");
//   process.exit(1);
// }

// // --- Authentication Middleware ---
// function authenticateGateway(req, res, next) {
//   const providedKey = req.headers['x-api-key'];
//   if (!providedKey || providedKey !== API_KEY) {
//     console.warn(`Authentication failed for request to ${req.path} from ${req.ip}`);
//     return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
//   }
//   // You might want to associate the API key with a specific gatewayId here
//   // For now, we assume one key for all authorized gateways
//   next();
// }

// // --- Key Generation Function ---
// function generateSymmetricKey(bytes = 32) {
//   // Generates a secure random key (e.g., for AES-256)
//   return crypto.randomBytes(bytes).toString('hex');
// }


// // --- API Endpoint to Get Key for a Device ---
// // Gateway calls this endpoint
// app.get('/api/v1/devices/:deviceId/key', authenticateGateway, (req, res) => {
//   const { deviceId } = req.params;
//   const device = deviceRegistry[deviceId];

//   console.log(`Key requested for device: ${deviceId}`);

//   if (!device) {
//     return res.status(404).json({ message: 'Device not found' });
//   }

//   // **Authorization Check:** In a real system, verify this gateway
//   // is authorized for this deviceId (e.g., check against device.gatewayId)
//   // const requestingGatewayId = req.headers['x-gateway-id']; // Example header
//   // if (device.gatewayId !== requestingGatewayId) {
//   //     return res.status(403).json({ message: 'Forbidden: Gateway not authorized for this device' });
//   // }

//   try {
//     const newKey = generateSymmetricKey();
//     console.log(`Generated key for ${deviceId}: ${newKey.substring(0, 6)}...`); // Log securely

//     // **IMPORTANT:** In a real system, you would:
//     // 1. Store the generated key securely associated with the deviceId.
//     // 2. Implement key rotation policies.
//     // 3. Potentially encrypt the key *for the gateway* if needed.

//     res.json({
//       deviceId: deviceId,
//       key: newKey, // Send the key back to the gateway
//       generatedAt: new Date().toISOString(),
//       // You could add key expiry time here
//     });
//   } catch (error) {
//     console.error(`Error generating key for ${deviceId}:`, error);
//     res.status(500).json({ message: 'Internal server error generating key' });
//   }
// });




