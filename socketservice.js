const WebSocket = require('ws');

const si = require('systeminformation');
 
// promises style - new since version 3
var cpu_data;
var load_data;
var system_data;
var graphics_data;
var active = "Active";

si.cpu()
    .then(data => cpu_data = data.manufacturer + " " + data.brand)
    .catch(error => console.error(error));

si.fullLoad()
    .then(data => load_data = data)

si.system()
    .then(data => system_data = data.manufacturer + " " + data.model)

var n;
si.graphics()
    .then(data => n = data.controllers.length - 1)

si.graphics()
    .then(data => graphics_data = data.controllers[n].vendor + " " + data.controllers[n].model)

    module.exports.jobstarted = function (projectId){
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            si.cpu()
            .then(data => cpu_data = data.manufacturer + " " + data.brand)
                .catch(error => console.error(error));
            
            si.fullLoad()
                .then(data => load_data = data)
            
                si.system()
    .then(data => system_data = data.manufacturer + " " + data.model)
            
    si.graphics()
    .then(data => graphics_data = data.controllers[n].vendor + " " + data.controllers[n].model)

                ws.send(JSON.stringify({
                    cpu_data,
                    graphics_data,
                    load_data,
                    system_data,
                    active
                }));
            
            });
      
        ws.send(JSON.stringify({
            cpu_data,
            graphics_data,
            load_data,
            system_data,
            active
        }));
      });
}

module.exports.jobstarted();