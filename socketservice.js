const WebSocket = require('ws');

const si = require('systeminformation');
 
// promises style - new since version 3
var cpu_data;
var load_data;
var active = "Active";

si.cpu()
    .then(data => cpu_data = data.manufacturer + " " + data.brand)
    .catch(error => console.error(error));

si.fullLoad()
    .then(data => load_data = HTMLTableDataCellElement)

module.exports.jobstarted = function (projectId){
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            si.cpu()
            .then(data => cpu_data = data.manufacturer + " " + data.brand)
                .catch(error => console.error(error));
            
            si.fullLoad()
                .then(data => load_data = data)
            
                ws.send(JSON.stringify({
                    cpu_data,
                    load_data,
                    active
                }));
            
            });
      
        ws.send(JSON.stringify({
            cpu_data,
            load_data,
            active
        }));
      });
}

module.exports.jobstarted();