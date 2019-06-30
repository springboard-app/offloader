const admin = require("firebase-admin");
const serviceAccount = require("./service-account");
const exec = require('child_process').exec;
const fs = require('fs');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "springboard-core.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

db.collection("jobs").onSnapshot(async snapshot => {
    const jobs = snapshot.docs.map(doc => doc.data());

    for (let job of jobs.filter(it => !it.assigned && !it.completed)) {
        const projectId = job.projectId;
        const [contents] = await bucket.file(projectId).download();
        const snapshot = await db.doc(`projects/${projectId}`).get();
        const {trainingPercent, type} = snapshot.data().params;

        await db.doc(`projects/${projectId}`).update({
            assigned: true
        });
        fs.writeFile(`data_matrix.csv`, contents, async err => {
            if (err) {
                console.error(err);
                return;
            }
            exec(`python train_model.py ${projectId} ${trainingPercent / 100} "${type}"`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(stderr);
                    await db.doc(`projects/${projectId}`).update({
                        completed: true,
                        errored: true
                    });
                    return;
                }
                let path = `${projectId}.joblib`;
                await bucket.upload(path, {
                    destination: admin.storage().bucket().get(path),
                    resumable: false
                });
                console.log(`Uploaded joblib for ${projectId} to storage`);
                await db.doc(`projects/${projectId}`).update({
                    errored: false,
                    completed: true
                });
            });
        });
    }
});
