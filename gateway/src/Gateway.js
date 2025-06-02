import dotenv from "dotenv";
import express from 'express';
import cors from "cors";
import mqtt from "mqtt";
import axios from "axios";
import cryptoService from "./services/crypto.service.js"

import {
    GATEWAY_PRIVATE_KEY,
    MQTT_BROKER_URL,
    MQTT_TOPIC_PREFIX,
    GATEWAY_GUID,
    SERVER_BASE_URL,
    KEY_ENCRYPTION_PASS,
    TOPICS,
    TYPE_TASK
} from "./config/config.js"

import { logAuth, logError, logInfo, logMqtt, logTask, logWarning } from "./config/log_handler.js";

dotenv.config();

export default class Gateway {
    constructor() {
        this.app = express();
        this.gatewayGuid = GATEWAY_GUID;
        this.serverBaseUrl = SERVER_BASE_URL;
        this.keyPassPrivateKey = KEY_ENCRYPTION_PASS;
        this.GatewayPrivateKey = GATEWAY_PRIVATE_KEY;

        this.sessionKey = null;
        this.mqttClient = null;
        this.server = null;
        this.deviceSubscriptions = new Map();
        this.revokedDeviceGuids = new Set();

        this.handleMqttMessage = this.handleMqttMessage.bind(this);
    }

    // =================== MAIN STARTUP ===================
    async start() {
        logInfo("🚀 Starting Gateway...");

        try {
            await this.setupMqtt();
            await this.authenticateWithServer();
            this.startDeviceStatusListener();
            await this.startPollingTasks();

            logInfo("✅ Gateway started successfully");
        } catch (error) {
            logError(`Failed to start gateway: ${error.message}`);
            throw error;
        }
    }

    // =================== AUTHENTICATION ===================
    async authenticateWithServer() {
        logAuth("Attempting authentication with server...");

        const payload = {
            timestamp: new Date().toISOString(),
            gatewayGuid: this.gatewayGuid,
        };

        const signature = cryptoService.signPayload(
            JSON.stringify(payload),
            this.GatewayPrivateKey,
            this.keyPassPrivateKey
        );

        try {
            const response = await axios.post(`${this.serverBaseUrl}/gateway/verify-gateway`, {
                gatewayGuid: this.gatewayGuid,
                payload: payload,
                signature: signature,
            });

            logAuth("✅ Authentication successful");

            // Decrypt session key
            this.sessionKey = cryptoService.decryptWithPrivateKey(
                response.data.sessionKeyEncrypted,
                this.GatewayPrivateKey,
                this.keyPassPrivateKey
            );

            // Validate session key
            const sessionKeyBuf = Buffer.from(this.sessionKey, 'hex');
            if (this.sessionKey === 'DECRYPTION_FAILED' || sessionKeyBuf.length !== 32) {
                throw new Error('Invalid session key format');
            }

            logAuth("Session key established");

        } catch (error) {
            const errorMsg = error.response
                ? `${error.response.status} - ${error.response.data.message || error.response.data}`
                : error.message;

            logError(`Authentication failed: ${errorMsg}`);

            // Retry logic
            logAuth("Retrying authentication in 5 seconds...");
            await new Promise(r => setTimeout(r, 5000));
            return this.authenticateWithServer();
        }
    }

    // =================== MQTT SETUP ===================
    async setupMqtt() {
        logMqtt(`Connecting to MQTT broker: ${MQTT_BROKER_URL}`);

        this.mqttClient = mqtt.connect(MQTT_BROKER_URL, {
            clientId: this.gatewayGuid,
        });

        return new Promise((resolve, reject) => {
            this.mqttClient.on('connect', () => {
                logMqtt("✅ Connected to MQTT broker");
                this.setupMqttSubscriptions();
                resolve();
            });

            this.mqttClient.on('error', (err) => {
                logError(`MQTT Error: ${err.message}`);
                reject(err);
            });

            this.mqttClient.on('reconnect', () => {
                logMqtt("Attempting to reconnect...");
            });

            this.mqttClient.on('offline', () => {
                logMqtt("Went offline");
            });

            this.mqttClient.on('message', this.handleMqttMessage);
        });
    }

    setupMqttSubscriptions() {
        const statusTopic = `${MQTT_TOPIC_PREFIX}/${this.gatewayGuid}/devices/+/status`;

        this.mqttClient.subscribe(statusTopic, { qos: 1 }, (err) => {
            if (err) {
                logError("Failed to subscribe to device status topics");
            } else {
                logMqtt("Subscribed to device status topics");
            }
        });
    }

    startDeviceStatusListener() {
        logInfo("Device status listener started");
    }

    // =================== MQTT MESSAGE HANDLING ===================
    handleMqttMessage(topic, message) {
        try {
            const payload = JSON.parse(message.toString());
            const topicParts = topic.split('/');
            const deviceGuidFromTopic = topicParts[3];
            const actualDeviceGuid = payload.deviceGuid;

            // Validate device GUID consistency
            if (payload.deviceGuid !== deviceGuidFromTopic) {
                logWarning(`Device GUID mismatch: payload(${payload.deviceGuid}) vs topic(${deviceGuidFromTopic})`);
            }

            // Check if device is revoked
            if (actualDeviceGuid && this.revokedDeviceGuids.has(actualDeviceGuid)) {
                logWarning(`Ignoring message from revoked device: ${actualDeviceGuid}`);
                return;
            }

            // Route message based on topic
            if (topic.endsWith('/status')) {
                this.handleDeviceStatusMessage(payload, actualDeviceGuid);
            }

        } catch (error) {
            logError(`Failed to handle MQTT message: ${error.message}`);
        }
    }

    handleDeviceStatusMessage(payload, deviceGuid) {
        if (payload.status_type === 'provisioned' && payload.taskId) {
            logInfo(`📱 Device ${deviceGuid} provisioned successfully (Task: ${payload.taskId})`);
            this.updateServerTaskStatusInternal(payload.taskId, 'completed_ack_received');
            this.updateServerDeviceStatus(deviceGuid, 'active');

        } else if (payload.status_type === 'pairwise_key_established') {
            logInfo(`🔐 Pairwise key established: ${deviceGuid} ↔ ${payload.peerDeviceGuid}`);
            this.reportPairwiseKeyToServer(payload);

        } else if (payload.status_type === 'pairwise_key_refresh_processed' && payload.taskId) {

            logInfo(`🔄 Device ${deviceGuid} ACKed pairwise key refresh (Task: ${payload.taskId})`);

            // 1. Update the task status on server
            this.updateServerTaskStatusInternal(payload.taskId, 'completed_refresh_ack_received');
            // 2. Update DeviceKey records on server
            this.reportPairwiseKeyRefreshToServer(payload);
            // 3. Update device status back to 'running'
            this.updateServerDeviceStatus(deviceGuid, 'running');


        } else if (payload.status_type === 'scheduled_key_refresh_completed' && payload.taskId) {

            logInfo(`⏱ Device ${deviceGuid} completed scheduled key refresh (Task: ${payload.taskId})`);

            // 1. Update task status
            this.updateServerTaskStatusInternal(payload.taskId, 'device_refresh_completed');

            // 2. Update device status
            this.updateServerDeviceStatus(deviceGuid, 'running');

            // 3. Update key versions in server
            // this.reportKeyRefreshCompletion(payload);

        }

        else {
            logInfo(`📊 General status from ${deviceGuid}: ${payload.status_type || 'unknown'}`);
        }
    }

    // =================== SERVER COMMUNICATION ===================
    async updateServerDeviceStatus(deviceGuid, newStatus) {
        if (!this.sessionKey) {
            logWarning(`No session key - cannot update device ${deviceGuid} status`);
            return;
        }

        try {
            await axios.patch(
                `${this.serverBaseUrl}/device/${deviceGuid}`,
                { status: newStatus }
            );
            logInfo(`Device ${deviceGuid} status → ${newStatus}`);
        } catch (error) {
            const errorMsg = error.response
                ? `${error.response.status} ${JSON.stringify(error.response.data)}`
                : error.message;
            logError(`Failed to update device ${deviceGuid} status: ${errorMsg}`);
        }
    }

    async reportPairwiseKeyToServer(deviceStatusPayload) {
        const { deviceGuid, peerDeviceGuid, keyHash } = deviceStatusPayload;

        try {
            // Create DeviceKey record
            const deviceKeyPayload = {
                ownerDeviceGuid: deviceGuid,
                peerDeviceGuid: peerDeviceGuid,
                keyType: 'pairwise',
                keyHash: keyHash,
                keyStatus: 'active'
            };

            await axios.post(`${this.serverBaseUrl}/device-key/create`, deviceKeyPayload);
            logInfo(`Pairwise key reported: ${deviceGuid} ↔ ${peerDeviceGuid}`);

            // Update both devices to 'running' status
            for (const dGuid of [deviceGuid, peerDeviceGuid]) {
                await axios.patch(
                    `${this.serverBaseUrl}/device/${dGuid}`,
                    { status: 'running' }
                );
                logInfo(`Device ${dGuid} status → running`);
            }
        } catch (error) {
            const errorMsg = error.response
                ? `${error.response.status} ${JSON.stringify(error.response.data)}`
                : error.message;
            logError(`Failed to report pairwise key: ${errorMsg}`);
        }
    }

    async updateServerTaskStatusInternal(taskId, newStatus, resultMessage = null) {
        if (!this.sessionKey) {
            logWarning(`No session key - cannot update task ${taskId}`);
            return;
        }

        try {
            await axios.patch(
                `${this.serverBaseUrl}/task/${taskId}`,
                { status: newStatus, resultMessage: resultMessage }
            );
            logTask(`Task ${taskId} → ${newStatus}`);
        } catch (error) {
            const errorMsg = error.response
                ? `${error.response.status} ${JSON.stringify(error.response.data)}`
                : error.message;
            logError(`Failed to update task ${taskId}: ${errorMsg}`);
        }
    }

    async reportPairwiseKeyRefreshToServer(ackPayload) {
        if (!this.sessionKey) {
            logWarning(`No session key - cannot report key refresh for ${ackPayload.deviceGuid}`);
            return;
        }

        try {
            await axios.patch(
                `${this.serverBaseUrl}/device-key/refresh-status`, // NEW ENDPOINT
                {
                    acknowledgingDeviceGuid: ackPayload.deviceGuid,
                    // The device that refreshed
                    processedTaskId: ackPayload.taskId,
                    refreshedPeerGuid: ackPayload.refreshedPeerGuid, // If specific peer was targeted
                    wasCentralRefresh: ackPayload.wasCentralRefresh, // If it was the central device's "all related" refresh
                    timestamp: ackPayload.timestamp

                },
            );
            logInfo(`Reported key refresh for device ${ackPayload.deviceGuid} to server.`);
        } catch (error) {
            const errorMsg = error.response ? `${error.response.status} ${JSON.stringify(error.response.data)}` : error.message;
            logError(`Failed to report key refresh for ${ackPayload.deviceGuid}: ${errorMsg}`);
        }

    }


    async reportKeyRefreshCompletion(payload) {
        try {
            await axios.patch(
                `${this.serverBaseUrl}/device-key/refresh-completion`,
                {
                    deviceGuid: payload.deviceGuid,
                    taskId: payload.taskId,
                    keysRefreshedCount: payload.keysRefreshedCount,
                    timestamp: payload.timestamp
                }
            );
            logInfo(`Reported key refresh completion for ${payload.deviceGuid}`);
        } catch (error) {
            logError(`Failed to report key refresh completion: ${error.message}`);
        }
    }

    // =================== TASK POLLING ===================
    async startPollingTasks() {
        logTask("Started task polling (15s interval)");

        setInterval(async () => {
            if (!this.sessionKey) {
                logWarning("No session key - skipping task fetch");
                return;
            }

            try {
                const response = await axios.get(`${this.serverBaseUrl}/gateway/${this.gatewayGuid}/task`);
                const { tasks } = response.data;

                if (tasks.length > 0) {
                    logTask(`Processing ${tasks.length} task(s)`);
                }

                for (const task of tasks) {
                    await this.processTask(task);
                }
            } catch (error) {
                logError(`Failed to fetch tasks: ${error.message}`);
            }
        }, 15 * 1000);
    }

    async processTask(task) {

        let payload = typeof task.payload === "string" ? JSON.parse(task.payload) : task.payload;
        payload.taskId = task.taskId;


        if (task.taskType === 'provision_evkms_device' && task.device) {
            logTask(`📱 Provisioning device: ${task.device.deviceGuid} (Task: ${task.taskId})`);
            this.publishProvisioningToDevice(task.device.deviceGuid, payload);

        } else if (task.taskType === 'process_device_revocation') {
            logTask(`🚫 Processing revocation: ${payload.revokedDeviceGuid} (Task: ${task.taskId})`);
            await this.handleDeviceRevocation(payload);
            await this.updateServerTaskStatusInternal(task.taskId, 'gateway_processing_revocation');

        } else if (task.taskType === TYPE_TASK.REFRESH_PAIRWAISE_KEY) {
            logTask(`🔄 Processing pairwise key refresh for device: ${task.device.deviceGuid} (Task: ${task.taskId})`);
            await this.handlePairwiseKeyRefresh(payload, task.device.deviceGuid);
            await this.updateServerTaskStatusInternal(task.taskId, 'refresh_command_sent');
        } else if (task.taskType === TYPE_TASK.SCHEDULED_PAIRWISE_KEY_REFRESH_ORCHESTRATION) {

            logTask(`⏱ Processing scheduled refresh orchestration (Task: ${task.taskId})`);
            // Just acknowledge - actual processing is server-side

            await this.broadcastKeyRefresh(payload);
            await this.updateServerTaskStatusInternal(task.taskId, 'gateway_acknowledged');

        } else {
            logWarning(`Unknown task type: ${task.taskType}`);
        }
    }

    // =================== DEVICE OPERATIONS ===================

    async broadcastKeyRefresh(payload) {

        const taskId = payload.taskId;
        const refreshNonce = payload.refreshNonce;
        const subsetIdentifier = payload.targetSubsetIdentifier;

        const broadcastTopic = `${MQTT_TOPIC_PREFIX}/subsets/${subsetIdentifier}/key_refresh`;

        const refreshMessage = {
            type: "SCHEDULED_KEY_REFRESH",
            refreshNonce: refreshNonce,
            issuer: this.gatewayGuid,
            taskId: taskId,
            timestamp: new Date().toISOString()
        };

        this.mqttClient.publish(
            broadcastTopic,
            JSON.stringify(refreshMessage),
            { qos: 1, retain: false },
            (err) => {
                if (err) {
                    logError(`Failed to broadcast key refresh: ${err.message}`);
                    this.updateServerTaskStatusInternal(taskId, 'broadcast_failed');
                } else {
                    logInfo(`Key refresh broadcasted to subset ${subsetIdentifier}`);
                    this.updateServerTaskStatusInternal(taskId, 'broadcast_refresh_sent');
                }
            }
        );


    }

    async handleDeviceRevocation(revocationPayload) {
        const { revokedDeviceGuid, revokedDeviceSubsetId, taskId } = revocationPayload;

        // Add to internal revocation list
        this.revokedDeviceGuids.add(revokedDeviceGuid);
        logInfo(`Added ${revokedDeviceGuid} to revocation list`);

        // Broadcast revocation alert
        const revocationBroadcastMessage = {
            type: "REVOCATION_ALERT",
            revokedGuid: revokedDeviceGuid,
            issuer: this.gatewayGuid,
            timestamp: new Date().toISOString()
        };

        const subsetBroadcastTopic = `${MQTT_TOPIC_PREFIX}/subsets/${revokedDeviceSubsetId}/broadcast_alerts`;

        this.mqttClient.publish(
            subsetBroadcastTopic,
            JSON.stringify(revocationBroadcastMessage),
            { qos: 1 },
            (err) => {
                if (err) {
                    logError(`Failed to broadcast revocation alert: ${err.message}`);
                    this.updateServerTaskStatusInternal(taskId, 'failed_revocation_broadcast');
                } else {
                    logInfo(`Revocation alert broadcasted for ${revokedDeviceGuid}`);
                    this.updateServerTaskStatusInternal(taskId, 'revocation_alert_sent');
                }
            }
        );
    }

    publishProvisioningToDevice(deviceGuid, payloadWithTaskId) {
        const topic = `${MQTT_TOPIC_PREFIX}/${this.gatewayGuid}/devices/${deviceGuid}/config`;

        this.mqttClient.publish(
            topic,
            JSON.stringify(payloadWithTaskId),
            { qos: 1, retain: true },
            async (err) => {
                if (err) {
                    logError(`Failed to publish provisioning to ${deviceGuid}: ${err.message}`);
                } else {
                    logInfo(`Provisioning payload sent to ${deviceGuid}`);
                    await this.updateServerTaskStatusInternal(payloadWithTaskId.taskId, 'in_progress_payload_sent');
                }
            }
        );
    }


    async handlePairwiseKeyRefresh(refreshPayload, DeviceGuidFromServer) {

        const { taskId, type, refreshNonce, targetDeviceGuid, targetPeerGuid, triggeringDeviceGuid } = refreshPayload;


        // Message to send to the device
        const refreshCommandMessage = {
            type: type,   // this type is create by server based on type of refresh all or only one
            refreshNonce: refreshNonce,
            issuer: this.gatewayGuid,
            taskId: taskId,
            timestamp: new Date().toISOString()
        };

        if (type === "REFRESH_SPECIFIC_PAIRWISE_KEY") {

            refreshCommandMessage.targetPeerGuid = targetPeerGuid; // For Device B/C, this is A's GUID

        } else if (type === "REFRESH_ALL_RELATED_PAIRWISE_KEYS") {

            refreshCommandMessage.triggeringDeviceGuid = triggeringDeviceGuid; // For Device A, this is A's GUID
        }


        const deviceCommandTopic = `${MQTT_TOPIC_PREFIX}/${this.gatewayGuid}/devices/${DeviceGuidFromServer}/commands`;


        this.mqttClient.publish(
            deviceCommandTopic,
            JSON.stringify(refreshCommandMessage),
            { qos: 1 },
            (err) => {
                if (err) {
                    logError(`Failed to publish pairwise key refresh command to ${DeviceGuidFromServer}: ${err.message}`);
                    this.updateServerTaskStatusInternal(taskId, 'failed_refresh_command_publish');
                } else {
                    logInfo(`Pairwise key refresh command sent to ${DeviceGuidFromServer}. Task: ${taskId}`);
                    // Await device ACK, then update task status to completed/failed
                    // For now, task is marked 'refresh_command_sent' by processTask
                    this.updateServerTaskStatusInternal(taskId, 'refresh_command_sent');
                }
            }
        );
    }

    // =================== EXPRESS SETUP (Optional) ===================
    async setupExpress() {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                gatewayGuid: this.gatewayGuid,
                mqttConnected: this.mqttClient?.connected || false,
                sessionKeyPresent: !!this.sessionKey,
                revokedDevicesCount: this.revokedDeviceGuids.size
            });
        });

        this.server = this.app.listen(3001, () => {
            logInfo("Express API running on port 3001");
        });
    }
}

