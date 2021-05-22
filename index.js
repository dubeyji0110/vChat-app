const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const { v4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});
const peerServer = ExpressPeerServer(server, {
	debug: true,
});

app.set("view engine", "ejs");
app.use("/peerjs", peerServer);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/join", (req, res) => {
	res.redirect(`/room/${v4()}`);
});

app.get("/room/:roomId", (req, res) => {
	res.render("room", { roomId: req.params.roomId });
});

const users = {};

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId, userName) => {
		socket.join(roomId);
		users[socket.id] = userName;
		socket.to(roomId).broadcast.emit("user-connected", userName, userId);
		socket.on("send", (message) => {
			socket.to(roomId).broadcast.emit("receive", message, userName);
		});
		socket.on("disconnect", (message) => {
			delete users[socket.id];
		});
	});
});

server.listen(process.env.PORT || 3000);
