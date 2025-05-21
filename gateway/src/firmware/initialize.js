import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to a file path and extract __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import cryptoService from '../services/crypto.service.js';




// Directory to store keys securely
const KEY_DIR = path.join(__dirname, 'secure_storage'); ///Projects/Key-Management-Redistribution/gateway/src/services/secure_storage
const PRIVATE_KEY_PATH = path.join(KEY_DIR, 'private_key.pem');
const PUBLIC_KEY_PATH = path.join(KEY_DIR, 'public_key.pem');



function generateGatewayKeys() {

    // Create secure storage directory if it doesn't exist
    if (!fs.existsSync(KEY_DIR)) {
        console.log('exists Sync')
        fs.mkdirSync(KEY_DIR, { recursive: true });
    }

    // Skip if keys already exist
    if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
        console.log('exists secure manager')

        console.log('✅ Keys already exist. Skipping generation.');
        return;
    }

    const { privateKey, publicKey } = cryptoService.generateKeysPairGateway();


    // Save keys securely
    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);

    console.log('🔐 Keys generated successfully!');
    console.log('Public Key:\n', publicKey);

}

generateGatewayKeys();