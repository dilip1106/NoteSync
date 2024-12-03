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
const userCounts = {}; // Object to keep track of users for each uniqueUrl

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinPage", (uniqueUrl) => {
    if (!userCounts[uniqueUrl]) {
      userCounts[uniqueUrl] = new Set();
    }
    userCounts[uniqueUrl].add(socket.id);
    // Emit updated user count to clients on the same uniqueUrl
    io.emit("userCountUpdated", userCounts[uniqueUrl].size);

    // Join the user to a specific room for the uniqueUrl
    socket.join(uniqueUrl);
  });

  socket.on("leavePage", (uniqueUrl) => {
    if (userCounts[uniqueUrl]) {
      userCounts[uniqueUrl].delete(socket.id);
      if (userCounts[uniqueUrl].size === 0) {
        delete userCounts[uniqueUrl]; // Clean up when no users are left
      } else {
        io.to(uniqueUrl).emit("userCountUpdated", userCounts[uniqueUrl].size);
      }
    }

    socket.leave(uniqueUrl);
  });

  socket.on("disconnect", () => {
    // Remove the user from all uniqueUrl tracking
    Object.keys(userCounts).forEach((uniqueUrl) => {
      if (userCounts[uniqueUrl].has(socket.id)) {
        userCounts[uniqueUrl].delete(socket.id);
        if (userCounts[uniqueUrl].size === 0) {
          delete userCounts[uniqueUrl];
        } else {
          io.to(uniqueUrl).emit("userCountUpdated", userCounts[uniqueUrl].size);
        }
      }
    });

    console.log("A user disconnected");
  });
});

export {app ,io,server};