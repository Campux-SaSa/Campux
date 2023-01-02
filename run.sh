#!/bin/bash

pm2 kill;
cd Server;
./node_modules/.bin/pm2 --name node start app.ts;
pm2 save --force
cd ..;
pm2 --name ws start WebSocket/server.js;