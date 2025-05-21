
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';


export const MQTT_TOPIC_PREFIX = 'iot_network';
export const TOPICS = {
    CONFIG: `${MQTT_TOPIC_PREFIX}/:gatewayGuid/devices/:deviceGuid/config`,
    STATUS: `${MQTT_TOPIC_PREFIX}/:gatewayGuid/devices/:deviceGuid/status`,
    COMMANDS: `${MQTT_TOPIC_PREFIX}/:gatewayGuid/commands`,
    DISCROVERY: `${MQTT_TOPIC_PREFIX}/broadcast/discovery`
};


//Read Private Key
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKeyPath = path.join(__dirname, '..', 'firmware', 'secure_storage', 'private_key.pem');



export const GATEWAY_PRIVATE_KEY = fs.readFileSync(privateKeyPath);



export const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt-broker:1883';

export const GATEWAY_GUID = process.env.GATEWAY_GUID || 'gw-001-factory-alpha';

export const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://172.17.0.1:5000/api';

export const KEY_ENCRYPTION_PASS = process.env.KEY_ENCRYPTION_PASS || "fall-back"


