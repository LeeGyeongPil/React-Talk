module.exports = class Rooms {
	constructor() {
		this.state = {
			roomList : [],
		};
	}

	get = () => {
		return this.state.roomList;
	}

	add = (room) => {
		room = Object.assign(room, { user : [], msg : [] });
		this.state.roomList.push(room);
		return this.state.roomList;
	}

	check = (route, obj) => {
		var keys = Object.keys(this.state.roomList);
		var currentKey = null;
		keys.forEach((key,i) => {
			if (this.state.roomList[key].roomId === obj.roomId) {
				if (route === 'out') {
					var newuser = new Array();
					this.state.roomList[key].user.forEach((ai,akey) => {
						if (ai[0] !== obj.userId) {
							newuser.push([ai[0], ai[1]]);
						}
					});
					this.state.roomList[key].user = newuser;
				}
				if (route === 'chN') {
					this.state.roomList[key].user.forEach((ai,akey) => {
						if (ai[0] === obj.userId) {
							this.state.roomList[key].user[akey][1] = obj.changeName
						}
					});
				}
				currentKey = key;
			}
		});
		if (currentKey) {
			return currentKey;
		} else {
			return false;
		}
	}

	act = (route, obj, socket) => {
		var currentKey = this.check(route, obj);
		if (currentKey) {
			if (route === 'join') {
				this.state.roomList[currentKey].user.push([obj.userId, obj.name]);
			}
			return this.state.roomList[currentKey];
		} else {
			if (obj.roomId) {
				socket.leave(obj.roomId);
			}
			return [];
		}
	}

	saveMsg = (obj,name,msg,type) => {
		var currentKey = this.check('msg', obj);
		if (currentKey) {
			this.state.roomList[currentKey].msg.push([msg,name,type]);
		}
	}
}