const express = require("express");
const app = express();
const path = require("path");
const server = require("http").Server(app);
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

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId, userName) => {
		socket.join(roomId);
		socket.to(roomId).broadcast.emit("user-connected", userId);
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message, userName);
		});
	});
});

server.listen(process.env.PORT || 3000, () => {
	console.log(`App Started on port: ${process.env.PORT || 3000}`);
});
