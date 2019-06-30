// Your web app's Firebase configuration
var firebase = require('firebase');

var firebaseConfig = {
  apiKey: "AIzaSyCNnu5sEkT_VzqC0GTPT7tv_IziF-Azw2I",
  authDomain: "springboard-core.firebaseapp.com",
  databaseURL: "https://springboard-core.firebaseio.com",
  projectId: "springboard-core",
  storageBucket: "springboard-core.appspot.com",
  messagingSenderId: "292547213939",
  appId: "1:292547213939:web:bb1922bb8b628950"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/* Firebase Cloud Firestore */
var db = firebase.firestore();

/* Firebase Admin Storage */
//var storage = firebase.storage();
// var storage = require('@google-cloud/storage')
var admin = require("firebase-admin");
var serviceAccount = require("./springboard-core-firebase-adminsdk-v07h5-bf702ed7aa.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "springboard-core.appspot.com"
});

var bucket = admin.storage().bucket();

db.collection("jobs").onSnapshot(function (snapshot){
    var data = snapshot.docs.map(doc => doc.data());
    console.log(data);
    
    var len = data.length;
    
    var id;
    var type_stat;
    var data_url;

    for (var i = 0; i < len;i++){
        if(data[i].assigned == false && data[i].completed == false){
            
            id = snapshot.docs[i].id;
            console.log(id)
            var completed_stat = data[i].completed;
            
            train_test_percentage_stat = data[i].train_test_percentage;
            
            type_stat = data[i].type;
            data_url = data[i].data_location;

            db.collection("jobs").doc(id).set({
                //assigned: true,
                assigned: false,
                completed: false,
                trained_model: "none",
                train_test_percentage: train_test_percentage_stat,
                data_location: data_url,
                type: type_stat
            })

            var http = require('https');
            var fs = require('fs');

            /* Read Data */
            
            var file = fs.createWriteStream("data_matrix.csv");
            var request = http.get(data_url, function(response) {
                response.pipe(file);
            });

            /* Run Python Script to Train*/
            
            var exec = require('child_process').exec;
            exec("python train_model.py " + id + " " + train_test_percentage_stat + " " + type_stat, function(error, stdout, stderr){ 
                console.log(stdout);
                
                var path_id = id + ".joblib";

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
                bucket.upload(path_id, options, function(err, remoteFile) {
                    if (!err) {
                        
                        admin.storage().bucket().file(path_id).getDownloadURL().then( function(downloadURL) {
                            console.log(downloadURL)
                            db.collection("jobs").doc(id).set({
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

            break;
        }
    }
    
});

