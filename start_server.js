const { log, error } = require('./helpers/logger.js');
// const WebSocket = require('ws');
const { WebSocket, WebSocketServer } = require('ws');
const https = require('https');
const fs = require('fs');

class WebSocketService {
  constructor() {
    this.clients = new Set();
  }

  async onClientConnect(url, sendFn) {
    log('Client connected', url);

    const client = { url, sendFn, sendingNumbers: false };

    this.clients.add(client);

    return client;
  }

  onClientDisconnect(client) {
    log(new Date().toISOString(), 'Client disconnected', client.url);

    if (client.intervalId) {
      clearInterval(client.intervalId);
    }
    this.clients.delete(client);
  }

  onClientError(client, error) {
    error(new Date().toISOString(), 'WebSocket error:', error);
  }

  onClientMessage(client, message, sendFn) {
    log('Received:', message);
    sendFn(`Server received: ${message}`);
    message = message.trim();

    if (message === 'start') {
      log(new Date().toISOString(), 'Starting to send random numbers');
      client.sendingNumbers = true;
      this.startSendingRandomNumbers(client);
    } else if (message === 'stop') {
      log('Stopping random numbers');
      client.sendingNumbers = false;
      if (client.intervalId) {
        clearInterval(client.intervalId);
      }
    } else if (message === 'hello server') {
      log(new Date().toISOString(), `Client ${client.url} says: hello server`);
      sendFn('Hello client!');
    }
  }

  startSendingRandomNumbers(client) {
    log('Setting up interval for random numbers');
    client.intervalId = setInterval(() => {
      if (client.sendingNumbers) {
        const randomNumber = Math.random();
        log(`Sending random number: ${randomNumber}`);
        client.sendFn(randomNumber.toString());
      } else {
        log('Clearing interval');
        clearInterval(client.intervalId);
      }
    }, 250);
  }
}

function createWebsocketServer({ websocketService }, server) {
  const wss = new WebSocketServer({
    // noServer: true
    server
  });

  wss.on('connection', async (ws, req) => {
    log('New WebSocket connection established');
    log('Headers:', req.headers);
    let connected = true;
    const url = req.url;

    ws.send('Connected to server');

    const sendFn = (...args) => {
      console.log("ARGSSS");
      console.log(args);
      if (connected) {
        ws.send(...args);
      }
    };

    const client = await websocketService.onClientConnect(url, sendFn);

    if (client === null) {
      ws.close();
      return;
    }

    ws.on('error', (e) => {
      error('Server-side WebSocket error:', error);
      websocketService.onClientError &&
        websocketService.onClientError(client, e);
    });

    ws.on('close', () => {
      log(`Connection closed: ${url}`);
      websocketService.onClientDisconnect &&
        websocketService.onClientDisconnect(client);
      connected = false;
    });

    ws.on('message', (message) => {
      log('Raw message received on server:', message);
      try {
        const stringMessage = message.toString();
        log('Parsed message:', stringMessage);
        websocketService.onClientMessage(client, stringMessage, sendFn);
      } catch (error) {
        error('Error parsing message:', error);
      }
    });

    ws.onmessage = (event) => {
      log('Message received:', event.data);
    };
  });

  return wss;
}

// Create an HTTP server
const server = https.createServer(
  {
  cert: fs.readFileSync('./localhost.crt'),
  key: fs.readFileSync('./localhost.key')
}, 
(req, res) => {
  // console.log('REQUESTSS');
  // console.log(req.method);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

const websocketService = new WebSocketService();
const wss = createWebsocketServer({ websocketService }, server);

// server.on('upgrade', (request, socket, head) => {
//   wss.handleUpgrade(request, socket, head, (ws) => {
//     wss.emit('connection', ws, request);
//   });
// });

// server.on('request')

// Start sending random numbers

// Start the server
const PORT = 8090;
server.listen(52525,
  // PORT, '0.0.0.0', () => {
  function listening() {
    //
    // If the `rejectUnauthorized` option is not `false`, the server certificate
    // is verified against a list of well-known CAs. An 'error' event is emitted
    // if verification fails.
    //
    // The certificate used in this example is self-signed so `rejectUnauthorized`
    // is set to `false`.
    //
    log(`Random port ${server.address().port}`)
    const ws = new WebSocket(`wss://localhost:${server.address().port}`, {
      rejectUnauthorized: false
    });
  
    ws.on('error', console.error);
  
    ws.on('open', function open() {
      ws.send('All glory to WebSockets!');
    });
  }
  // log(`Server is listening on port ${PORT}`);
// }
);
