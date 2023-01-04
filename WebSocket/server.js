import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';
import { Schema, model, connect } from 'mongoose';


const  Comment = model('Comment', { 
  id: {type: String, required: true},
  body: {type: String, required: true},
  date: {type: String, required: true},
  authorID: {type: String, required: true}
});

async function run() {
  // 4. Connect to MongoDB
  await connect("mongodb://AzureDiamond:Parvardegar007Saghafian@localhost:27017/db?authSource=admin");
}

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

wss1.on('connection', async function connection(ws) {
  
  const obj = await Comment.find({}).sort({date : -1}).limit(50)
  ws.send(Buffer.from(JSON.stringify(obj)))

  wss1.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(wss1.clients.size * 1)
      }
  });
  
  ws.on('message', function message(data) {
    console.log(data)
    let json = JSON.parse(data.toString());
    console.log(json)
    wss1.clients.forEach(async function each(client) {

        const comment = new Comment({
          id: json.id,
          body: json.body,
          date: json.date,
          authorID: json.authorID
         });
         await comment.save()
        if (client.readyState === WebSocket.OPEN) {
            let newComment = {id: json.id, body: json.body, date: json.date, authorID: json.authorID}
            client.send(Buffer.from(JSON.stringify(newComment)));
            // client.send(wss1.clients.size)
          }
      });
  });
  // ws.on('ping', heartbeat)
  ws.on("open", ()=>{
    console.log("is open")
    
  })
  // ws.on('ping', heartbeat);
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

run().catch(err => console.log(err));
server.listen(8080);
