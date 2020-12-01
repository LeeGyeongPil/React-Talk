const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*', } });
const Rooms = require('./Rooms');
var rooms = new Rooms();

io.on('connection', (socket) => {
	console.log('Connection >> ' + socket.id);

	// Room List Initialize
	io.to(socket.id).emit('Room List',rooms.get());

	// Create Room
	socket.on('Create Room', (room) => {
		console.log(socket.id + ' >>> Create Room');

		// All Connector Room List Refresh
		io.emit('Room List',rooms.add(room));
	});

	// Entrance Room
	socket.on('Entrance Room', (obj) => {
		console.log(socket.id + ' >>> Entrance Room');

		// Message Save
		const msg = obj.name + ' Connect';
		rooms.saveMsg(obj, 'System', msg, 'text');

		// Join Room User Alert Message
		var roomInfo = rooms.act('join',obj,socket);
		io.to(obj.roomId).emit('Entrance Room Alert',{ msg : msg, users : roomInfo.user, type : 'text' });

		// Room Join
		socket.join(obj.roomId);

		// Join Room Processing
		io.to(socket.id).emit('Entrance Room',{ roomId : obj.roomId, msg : roomInfo.msg });
	});

	// Exit Room
	socket.on('Exit Room', (obj) => {
		console.log(socket.id + ' >>> Exit Room');
		// Room Leave
		socket.leave(obj.roomId);

		// Message Save
		const msg = obj.name + ' Disconnect';
		rooms.saveMsg(obj, 'System', msg, 'text');

		// Join Room User Alert Message
		var roomInfo = rooms.act('out',obj,socket);
		io.to(obj.roomId).emit('Exit Room Alert',{ msg : msg, users : roomInfo.user, type : 'text' });
	});

	// Re Connection ( F4 , Page Refresh )
	socket.on('Re-Connection', (obj) => {
		// Already Join Room
		if (obj.roomId && obj.roomId !== null && obj.roomId !== 'null') {
			// Room ReJoin
			socket.join(obj.roomId);

			// Send Room Infomation
			var roomInfo = rooms.act('info',obj,socket);
			io.to(socket.id).emit('Refresh',{ roomId : roomInfo.roomId, users : roomInfo.user, msg : roomInfo.msg });
		}
	});

	// Send Message
	socket.on('Send Message', (obj) => {
		console.log(socket.id + ' >>> Send Message');
		// Message Save
		rooms.saveMsg(obj, obj.name, obj.msg, 'text');

		// Join Room User Message Send
		io.to(obj.roomId).emit('Receive Message',{ msg : obj.msg, name : obj.name, type : 'text'});
	});

	// Send Image Message
	socket.on('Send Image Message', (obj) => {
		console.log(socket.id + ' >>> Send Image Message');
		// Message Save
		rooms.saveMsg(obj, obj.name, obj.image, 'image');

		// Join Room User Message Send
		io.to(obj.roomId).emit('Receive Message',{ msg : obj.image, name : obj.name, type : 'image'});
	});

	// Changed User Name
	socket.on('Change Name', (obj) => {
		console.log(socket.id + ' >>> Change Name');
		// Message Save
		const msg = '`' + obj.originName + '` has changed name to `' + obj.changeName + '`';
		rooms.saveMsg(obj, 'System', msg, 'text');

		// Join Room User Message Send
		var roomInfo = rooms.act('chN',obj,socket);
		io.to(obj.roomId).emit('Change Name Alert',{ msg : msg, users : roomInfo.user, type : 'text' });
	});
});

// Server Open
server.listen(3001, 
	function(){
		console.log('Server Running...');
	}
);