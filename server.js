const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use(express.static("public"));

const rooms = {}; // room -> kullanıcı listesi

io.on("connection", socket => {
  socket.on("join", ({ room, name }) => {
    socket.join(room);
    rooms[room] = rooms[room] || [];
    rooms[room].push({ id: socket.id, name });
    io.to(room).emit("users", rooms[room]);
    socket.to(room).emit("new-peer", socket.id);

    socket.on("signal", data => io.to(data.to).emit("signal", { from: socket.id, data: data.data }));
    socket.on("disconnect", () => {
      rooms[room] = (rooms[room] || []).filter(u => u.id !== socket.id);
      io.to(room).emit("users", rooms[room]);
    });
  });
});

http.listen(3000, () => console.log("3000 portunda çalışıyor"));
