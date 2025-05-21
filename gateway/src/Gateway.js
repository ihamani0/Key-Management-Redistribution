import dotenv from "dotenv";
import express from 'express';
import cors from "cors";
import mqtt from "mqtt";
import axios from "axios";
import cryptoService from "./services/crypto.service.js"

import { GATEWAY_PRIVATE_KEY, MQTT_BROKER_URL, MQTT_TOPIC_PREFIX, GATEWAY_GUID, SERVER_BASE_URL, KEY_ENCRYPTION_PASS, TOPICS } from "./config/config.js"


dotenv.config();



export default class Gateway {

    constructor() {
        this.app = express();
        this.gatewayGuid = GATEWAY_GUID
        this.serverBaseUrl = SERVER_BASE_URL
        this.keyPassPrivateKey = KEY_ENCRYPTION_PASS
        this.GatewayPrivateKey = GATEWAY_PRIVATE_KEY;

        this.sessionKey = null;
        this.mqttClient = null;

        this.server = null;
        this.deviceSubscriptions = new Map(); // Track device subscriptions

        this.handleMqttMessage = this.handleMqttMessage.bind(this);
    }


    //Method For point Start the Gateway
    async start() {


        //await this.setupExpress();
        await this.setupMqtt();

        try {
            await this.authenticateWithServer();
        } catch (error) {
            console.error("Authentication failed. Gateway will retry.");
            await new Promise(r => setTimeout(r, 5000)); // Retry after delay
            await this.authenticateWithServer();
        }

        this.startDeviceStatusListener();

        await this.startPollingTasks();
    }



    async authenticateWithServer() {

        console.log(`\nGATEWAY (${GATEWAY_GUID}): Attempting to authenticate with server...`);

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
                gatewayGuid: this.gatewayGuid, // Often sent in body too or as a header
                payload: payload,
                signature: signature,
            });

            console.log(`GATEWAY (${GATEWAY_GUID}): Authentication successful:`, response.data.message);

            console.log(`GATEWAY (${GATEWAY_GUID}): Received data from server:`, response.data);



            this.sessionKey = cryptoService.decryptWithPrivateKey(
                response.data.sessionKeyEncrypted,
                this.GatewayPrivateKey,
                this.keyPassPrivateKey
            )

            // the session key in hex format now 
            console.log("Gateway SessionKey :", this.sessionKey)



            // 2) Convert hex string to Buffer:
            const sessionKeyBuf = Buffer.from(this.sessionKey, 'hex');



            // Validate session key format
            if (this.sessionKey === 'DECRYPTION_FAILED' || sessionKeyBuf.length !== 32) {
                throw new Error('Invalid session key format');
            }



            //save Session In Tpm for signature the JWt after each request and check it from server if is the truth gateway or not in session

        } catch (error) {
            if (error.response) {
                console.error(`GATEWAY (${GATEWAY_GUID}): Authentication failed (Res):`, error.response.status, error.response.data.message || error.response.data);
            } else {
                console.error(`GATEWAY (${GATEWAY_GUID}): Authentication failed (loc):`, error.message);
            }
        }
    }

    startDeviceStatusListener() {
        this.mqttClient.subscribe(
            `${MQTT_TOPIC_PREFIX}/${this.gatewayGuid}/devices/+/status`,
            { qos: 1 },
            (err) => {
                if (err) console.error('MQTT: Failed to subscribe to status topics');
            }
        );
    }


    async setupExpress() {

        this.app.use(cors());
        this.app.use(express.json()); //parsing json payload

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                gatewayGuid: this.gatewayGuid,
                mqttConnected: this.mqttClient?.connected || false
            });
        });

        this.server = this.app.listen(3001, () => {
            console.log(`GATEWAY: Express API running on port 3001`);
        });
    }



    async setupMqtt() {

        console.log("*******************************")
        console.log(MQTT_BROKER_URL)
        console.log("*******************************")

        this.mqttClient = mqtt.connect(MQTT_BROKER_URL, {
            clientId: this.gatewayGuid,
        })

        this.mqttClient.on('connect', () => {

            console.log(`MQTT: Connected to broker ${MQTT_BROKER_URL}`);

            this.mqttClient.subscribe(
                `${MQTT_TOPIC_PREFIX}/${this.gatewayGuid}/devices/+/status`,
                { qos: 1 }
            );
            //Listen for discovery broadcasts
        });


        this.mqttClient.on('error', err => {
            console.error('MQTT Error:', err.message);
        });
        this.mqttClient.on('reconnect', () => {
            console.log('MQTT: Attempting to reconnect…');
        });
        this.mqttClient.on('offline', () => {
            console.log('MQTT: Went offline');
        });

        //action

        this.mqttClient.on('message', (topic, message) => {

            //It listens for messages published to topics (..../devices/+/status) that  has subscribed to 
            //message : A Buffer containing the raw binary payload of the message
            this.handleMqttMessage(topic, message);
        })


    }


    handleMqttMessage(topic, message) {
        // Handle device status updates
        if (topic.includes('/status')) {
            //buffer to utf8 string and pars it to json payload for sendind to the server
            try {
                const payload = JSON.parse(message.toString());

                console.log(`HANDLE STATUS: ${topic}`, payload);

                const taskId = payload.taskId; // Extract from payload
                // Forward status to server


                this.updateServerTaskStatus(taskId, payload);

            } catch (error) {
                console.error('MQTT: Failed to parse status message:', error);
            }
        }
    }



    async updateServerTaskStatus(taskId, payload) {
        //this is payload from device
        if (taskId && payload.status === 'provisioned') {
            try {
                //the Task Completed and the Device is Active now 
                await axios.patch(
                    `${this.serverBaseUrl}/task/${taskId}`,
                    { status: 'completed' },
                );

                console.log(`[Gateway] Task ${taskId} marked as completed`);
                //update the status of the device to active 

                await axios.patch(
                    `${this.serverBaseUrl}/device/${payload.deviceGuid}`,
                    { status: 'active' },
                );
                console.log(`[Gateway] Device ${payload.deviceGuid} marked as active`);



            } catch (error) {
                console.error('SERVER: Failed to update task status:', error);
            }
        }
    }


    async startPollingTasks() {
        setInterval(async () => {

            try {

                console.log("Polling: Fetech Tasks ")
                const response = await axios.get(`${this.serverBaseUrl}/gateway/${this.gatewayGuid}/task`);


                // 2) Destructure the tasks array out of the response
                const { tasks } = response.data;

                for (const task of tasks) {


                    //before send payload we assign to him teh task id for updating the status in admin panal 

                    const Payload = { ...task.payload, taskId: task.taskId };


                    const topic = `${MQTT_TOPIC_PREFIX}/${this.gatewayGuid}/devices/${task.device.deviceGuid}/config`;

                    this.mqttClient.publish(
                        topic,
                        JSON.stringify(Payload), // ✅ Convert object to JSON string
                        { qos: 1, retain: true },
                        (err) => {
                            if (err) {
                                return console.error(`MQTT publish error for task ${task.taskId}:`, err);
                            }

                            // console.log(`PUBLISHED: Task ${task.taskId} to ${topic}`);


                            axios.patch(`${this.serverBaseUrl}/task/${task.taskId}`, { status: 'in_progress' })
                                .then(() => console.log(`Status updated for task ${task.taskId}`))
                                .catch(err => console.error(`Failed to update status for task ${task.taskId}:`, err));
                        });
                }
            } catch (error) {
                console.error('TASK: Failed to fetch tasks:', error);
            }

        }, 5 * 1000) //1 min sec
    }




}//fin de class gateway

