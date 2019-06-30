const WebSocket = require('ws');

const si = require('systeminformation');
 
// promises style - new since version 3
var cpu_data;

si.cpu()
    .then(data => cpu_data = data.manufacturer + " " + data.brand)
    .catch(error => console.error(error));

module.exports.jobstarted = function (projectId){
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
          console.log('received: %s', message);
        });
      
        ws.send('CPU Info: ' + cpu_data);
      });
}

module.exports.jobstarted();