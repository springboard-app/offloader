const firebase = require('firebase-admin');
const http = require('http');
const {OffloadedTask} = require('./src/offloaded-task');
const si = require('systeminformation');
const WebSocket = require("ws");

const ipAddress = require('ip').address();
const serviceAccount = require("./service-account");

const HTTP_PORT = 3030;
const WS_PORT = 8080;

const taskQueue = [];

// noinspection SpellCheckingInspection
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    storageBucket: "springboard-core.appspot.com"
});

function handleRequest(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === 'POST') {
        const chunks = [];
        req.on('data', chunk => {
            chunks.push(chunk)
        });
        req.on('end', async () => {
            const body = JSON.parse(Buffer.concat(chunks).toString());
            console.log("Received POST request with ", body);
            const offloadedTask = OffloadedTask.parse(body);
            offloadedTask.on('aborted', () => {
                taskQueue.splice(0, 1);
                res.statusCode = 500;
                res.end();
            });
            offloadedTask.on('done', () => {
                taskQueue.splice(0, 1);
                res.statusCode = 204;
                res.end();
            });
            taskQueue.push(offloadedTask);
            await offloadedTask.start();
        });
    } else {
        res.statusCode = 200;
        res.end(`Springboard offloader ${serviceAccount.private_key_id}, reporting for duty!`);
    }
}

const httpServer = http.createServer(handleRequest);
const webSocketServer = new WebSocket.Server({port: WS_PORT});

async function startOffloaderServices() {
    console.info(`Started an HTTP server at ${ipAddress}:${HTTP_PORT}`);
    await firebase.firestore().doc(`offloaders/${serviceAccount.private_key_id}`).set({
        httpEndpoint: `http://${ipAddress}:${HTTP_PORT}`,
        monitorEndpoint: `ws://${ipAddress}:${WS_PORT}`
    });
}

httpServer.once("listening", startOffloaderServices);

async function onNewMonitorConnection(connection) {
    console.info(`A new monitor just connected on port ${WS_PORT}`);
    async function sendUpdatedMessage() {
        const cpu =  await si.cpu();
        const data = {
            cpu: `${cpu.manufacturer} ${cpu.brand}`,
            load_data: await si.fullLoad(),
            status: taskQueue.length > 0 ? taskQueue[0].getStatus() : "Inactive"
        };
        connection.send(JSON.stringify(data));
    }
    setInterval(sendUpdatedMessage, 100);
}

// noinspection JSUnresolvedFunction
webSocketServer.on('connection', onNewMonitorConnection);

httpServer.listen(HTTP_PORT);