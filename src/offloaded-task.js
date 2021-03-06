const EventEmitter = require('events');
const exec = require('child_process').exec;
const firebase = require('firebase-admin');
const fs = require('fs');

class OffloadedTask extends EventEmitter {
    constructor(projectId) {
        super();
        this.projectId = projectId;
        this.projectSnapshot = firebase.firestore().doc(`projects/${projectId}`).get();
        this.status = "Not started";
        this.started = false;
        this.on('started', () => {
            this.started = true;
        });
    }

    async getProject() {
        return (await this.projectSnapshot).data();
    }

    getStatus() {
        return this.status;
    }

    abort(err) {
        this.status = "Aborted";
        this.emit('aborted', err);
    }

    async start() {
        if (this.started) return;
        this.status = "Starting";
        this.emit('started');
        this.status = `Downloading Data Matrix`;
        const [dataMatrix] = await firebase.storage().bucket().file(this.projectId).download();
        this.status = `Caching Data Matrix`;
        fs.writeFile(`data_matrix.csv`, dataMatrix, async err => {
            if (err) {
                console.error(err);
                this.abort(err);
                return;
            }
            const {trainingPercent, type} = (await this.getProject()).params;
            this.status = "Training";
            exec(`python train_model.py ${this.projectId} ${trainingPercent / 100} "${type}"`, async (err1, stdout, stderr) => {
                process.stdout.write(stdout);
                process.stderr.write(stderr);
                if (err1) {
                    console.error(err1);
                    this.abort(err1);
                    return;
                }
                this.status = "Uploading Model";
                try {
                    await firebase.storage().bucket().upload(`${this.projectId}.joblib`);
                    this.status = "Inactive";
                    this.emit("done", {
                        accuracy: stdout
                    });
                } catch (err2) {
                    console.error(err2);
                    this.abort(err2);
                }
            });
        });
    }

    static parse(body) {
        return new OffloadedTask(body.projectId);
    }
}

module.exports.OffloadedTask = OffloadedTask;
