const path = require('path');
const http = require('http');
const uuid = require('uuid');
const WebSocket = require('ws');
const express = require('express');
const session = require('express-session');

const app = express();
const state = {
  TOTAL: 10000,
  current: 9000,
};

const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
});

app.use(express.static(path.join(__dirname, '../dist')));
app.use(sessionParser);
app.use(express.json());

app.get('/me', function (req, res) {
  if (req.session.userId) {
    res.status(200).send({me: req.session.userId});
  } else {
    res.status(401).send({err: 'enter username'});
  }
});

app.post('/login', function (req, res) {
  if (req.session.userId) {
    console.log(`userId already exists: ${req.session.userId}`);
    return res.status(200).send({});
  }
  if (!req.body.me) {
    return res.status(400).send({err: 'invalid user'});
  }
  if (has(wss, req.body.me)) {
    return res.status(400).send({err: 'username already taken'});
  }
  const id = req.body.me;
  console.log(`creating new userId: ${id}`);
  req.session.userId = id;
  res.status(201).send({});
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: true, noServer: true });

server.on('upgrade', function (request, socket, head) {
  console.log('HTTP UPGRADE...');

  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      console.log('upgrade failed');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log('HTTP UPGRADE SUCCESS!!!');
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', function (ws, request) {
  const userId = request.session.userId;
  console.log('ws connected:', userId);
  // console.log(request.socket.remoteAddress);
  // console.log(request.headers);
  console.log();

  const interval = setInterval(function() {
    const total = state.TOTAL;
    const current = state.current;
    const percentage = ((current / total) * 100).toFixed(2);
    const users = clients(wss);
    ws.send(JSON.stringify({percentage, users}));
  }, 300);
  ws.userId = userId;
  ws.interval = interval;

  ws.on('message', function (message) {
    // console.log(`Incoming message: ${message}, from user: ${userId}`);
    try {
      const msg = JSON.parse(message);
      if (state.current > 0) {
        state.current += parseInt(msg.cmd, 10);
      }
    } catch (err) {
      ws.send(JSON.stringify({err}));
    }
  });

  ws.on('close', function () {
    // request.session.destroy();
    clearInterval(ws.interval);
    ws.terminate();
    console.log('ws closed:', ws.userId);
    console.log();
  });
});

server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});

// utils
function has(wss, user) {
  const clients = new Set([...wss.clients].map(x => x.userId));
  return clients.has(user);
}

function clients(wss) {
  const clients = new Set([...wss.clients].map(x => x.userId));
  return [...clients];
}
