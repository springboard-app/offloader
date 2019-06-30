const admin = require("firebase-admin");
const serviceAccount = require("./service-account");
const exec = require('child_process').exec;
const fs = require('fs');
const socketService = require("./socketservice");
const http = require('http');

const ip = require('ip').address();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "springboard-core.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();


require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    db.doc(`offloaders/${serviceAccount.private_key_id}`).set({
        offloaderEndpoint: `http://${ip}:3030`,
        socketUrl: `ws://${ip}:8080`
    });
});

const server = http.createServer((req, res) => {
    if (req.method === "POST") {
        const chunks = [];
        req.on('chunk', chunk => chunks.push);
        req.on('end', () => {
            const body = JSON.parse(Buffer.concat(chunks).toString());
            console.debug(body);
        });
    }
});

server.on('listening', e => {
    console.log(`Started an HTTP server at ${ip}:3030`);
});

server.listen(3030);

// db.collection("jobs").onSnapshot(async snapshot => {
//     const jobs = snapshot.docs.map(doc => doc.data());
//
//     for (let job of jobs.filter(it => !it.assigned && !it.completed)) {
//         socketService.active = "Active";
//         const projectId = job.projectId;
//         const [contents] = await bucket.file(projectId).download();
//         const snapshot = await db.doc(`projects/${projectId}`).get();
//         const {trainingPercent, type} = snapshot.data().params;
//
//         await db.doc(`projects/${projectId}`).update({
//             assigned: true
//         });
//         fs.writeFile(`data_matrix.csv`, contents, async err => {
//             if (err) {
//                 console.error(err);
//                 return;
//             }
//             exec(`python train_model.py ${projectId} ${trainingPercent / 100} "${type}"`, async (error, stdout, stderr) => {
//                 if (error) {
//                     socketService.active = "Failed";
//                     console.error(stderr);
//                     await db.doc(`projects/${projectId}`).update({
//                         completed: true,
//                         errored: true
//                     });
//                     return;
//                 }
//                 let path = `${projectId}.joblib`;
//                 console.log(stdout)
//                 await bucket.upload(path, {
//                     destination: admin.storage().bucket().get(path),
//                     resumable: false
//                 });
//                 console.log(`Uploaded joblib for ${projectId} to storage`);
//                 await db.doc(`projects/${projectId}`).update({
//                     errored: false,
//                     completed: true
//                 });
//                 socketService.active = "Inactive";
//             });
//         });
//     }
// });
