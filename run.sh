#!/bin/bash

pm2 kill;
pm2 list;
cd Server;
npm run build
./node_modules/.bin/pm2 start --name node app.ts --watch;
pm2 save --force
pm2 list;
cd ..;
pm2 start --name ws watch WebSocket/server.js;
pm2 list;