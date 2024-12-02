import { Server } from 'socket.io';  // Correct way to import Socket.IO
import http from 'http';
import express from "express";

const app = express();

const server = http.createServer(app); // Creating an HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow requests from the frontend URL
    methods: ['GET', 'POST'], // Allowed methods
  },
});

export {app ,io,server};