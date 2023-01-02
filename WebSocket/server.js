import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';


function heartbeat() {
  clearTimeout(this.pingTimeout);
  console.log("Beep")
  // Use `WebSocket#terminate()`, which immediately destroys the connection,
  // instead of `WebSocket#close()`, which waits for the close timer.
  // Delay should be equal to the interval at which your server
  // sends out pings plus a conservative assumption of the latency.
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}

// This very weird, I need more research on it
const server = createServer();
const wss1 = new WebSocketServer({ noServer: true });
const wss2 = new WebSocketServer({ noServer: true });

wss1.on('connection', function connection(ws) {
  wss1.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(wss1.clients.size)
      }
  });
  
  ws.on('message', function message(data) {
    wss1.clients.forEach(function each(client) {
        console.log(wss1.clients.size)
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
            client.send(wss1.clients.size)
          }
      });
  });
  ws.on('ping', heartbeat)
  ws.on('open', function Beep(){
    ws.send("You opened a websocket")
  });
  ws.on('ping', heartbeat);
  ws.on('close', function clear() {
    console.log(wss1.clients.size)
    wss1.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
          client.send(wss1.clients.size)
        }
    });
    clearTimeout(this.pingTimeout);
});
});

wss2.on('connection', function connection(ws) {
  
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);
  if (pathname === '/live') {
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
    });
    // To be implemented later
  } else if (pathname === '/chat') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(8080);
