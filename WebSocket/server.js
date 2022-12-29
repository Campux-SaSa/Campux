import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    wss.clients.forEach(function each(client) {
        //client !== ws && 
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
      });
  });
  ws.send("Your are added");
  ws.emit("New user added");
});