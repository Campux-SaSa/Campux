#!/bin/bash

# -fflags +genpts -stream_loop -1 is for 
# this needs to be copied and pasted in terminal to work right, don't forget the '&'
ffmpeg -re -fflags +genpts -stream_loop -1 -i agi.mp4 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -ar 44100 -f flv rtmp://localhost:1935/live/rfBd56ti2SMtYvSgD5xAV0YU99zampta7Z7S575KLkIZ9PYk &
