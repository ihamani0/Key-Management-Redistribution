import { GATEWAY_GUID } from './config.js';

// =================== LOGGING METHODS ===================
export function logInfo(message) {
    console.log(`\x1b[32m[GATEWAY-${GATEWAY_GUID}] ${message}\x1b[0m`);
}

export function logWarning(message) {
    console.log(`\x1b[33m[GATEWAY-${GATEWAY_GUID}] WARNING: ${message}\x1b[0m`);
}

export function logError(message) {
    console.log(`\x1b[31m[GATEWAY-${GATEWAY_GUID}] ERROR: ${message}\x1b[0m`);
}

export function logMqtt(message) {
    console.log(`\x1b[34m[GATEWAY-${GATEWAY_GUID}] MQTT: ${message}\x1b[0m`);
}

export function logTask(message) {
    console.log(`\x1b[36m[GATEWAY-${GATEWAY_GUID}] TASK: ${message}\x1b[0m`);
}

export function logAuth(message) {
    console.log(`\x1b[35m[GATEWAY-${GATEWAY_GUID}] AUTH: ${message}\x1b[0m`);
}
