#!/bin/bash

pm2 kill;
pm2 list;
cd Server;
./node_modules/.bin/pm2 --name node start app.ts;
pm2 save --force
pm2 list;
cd ..;
pm2 --name ws start WebSocket/server.js;
pm2 list;