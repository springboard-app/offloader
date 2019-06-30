// // Your web app's Firebase configuration
// const firebase = require('firebase');
//
// const firebaseConfig = {
//     apiKey: "AIzaSyCNnu5sEkT_VzqC0GTPT7tv_IziF-Azw2I",
//     authDomain: "springboard-core.firebaseapp.com",
//     databaseURL: "https://springboard-core.firebaseio.com",
//     projectId: "springboard-core",
//     storageBucket: "springboard-core.appspot.com",
//     messagingSenderId: "292547213939",
//     appId: "1:292547213939:web:bb1922bb8b628950"
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

//var storage = firebase.storage();
const admin = require("firebase-admin");

/* Firebase Admin Storage */
// var storage = require('@google-cloud/storage')
const serviceAccount = require("./service-account");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "springboard-core.appspot.com"
});

/* Firebase Cloud Firestore */
const db = admin.firestore();

const bucket = admin.storage().bucket();

db.collection("jobs").onSnapshot(snapshot => {
    const data = snapshot.docs.map(doc => doc.data());

    data.filter(it => !it.assigned && !it.completed).forEach((job, i) => {
        bucket.file(job.projectId).get().then(([file]) => {
            const {projectId, training} = job;
            const exec = require('child_process').exec;
            exec("python train_model.py " + job.projectId + " " + train_test_percentage_stat + " " + type_stat, function (error, stdout, stderr) {
                console.log(stdout);

                var path_id = projectId + ".joblib";

                var metadata = {
                    id: path_id
                };

                var options = {
                    destination: admin.storage().bucket().file(path_id),
                    resumable: false,
                    metadata: {
                        metadata: metadata
                    }
                };

                /* Upload Trained Model to Firebase Storage */
                bucket.upload(path_id, options, function (err, remoteFile) {
                    if (!err) {

                        admin.storage().bucket().get.ref(path_id).getDownloadURL().then(function (downloadURL) {
                            console.log(downloadURL)
                            db.collection("jobs").doc(projectId).set({
                                //assigned: true,
                                //completed: true,
                                assigned: true,
                                completed: true,
                                trained_model: downloadURL,
                                train_test_percentage: train_test_percentage_stat,
                                data_location: data_url,
                                type: type_stat
                            })

                        });
                        console.log("Uploaded!");

                    } else {
                        console.log(err);
                    }
                });

            });
        });
    });

    // for (var i = 0; i < len;i++){
    //     if(data[i].assigned == false && data[i].completed == false){
    //
    //         id = snapshot.docs[i].id;
    //         console.log(id)
    //         var completed_stat = data[i].completed;
    //
    //         train_test_percentage_stat = data[i].train_test_percentage;
    //
    //         type_stat = data[i].type;
    //         data_url = data[i].data_location;
    //
    //         db.collection("jobs").doc(id).set({
    //             //assigned: true,
    //             assigned: false,
    //             completed: false,
    //             trained_model: "none",
    //             train_test_percentage: train_test_percentage_stat,
    //             data_location: data_url,
    //             type: type_stat
    //         })
    //
    //         var http = require('https');
    //         var fs = require('fs');
    //
    //         /* Read Data */
    //
    //         var file = fs.createWriteStream("data_matrix.csv");
    //         var request = http.get(data_url, function(response) {
    //             response.pipe(file);
    //         });
    //
    /* Run Python Script to Train*/


    //
    //         break;
    //     }
    // }

});

