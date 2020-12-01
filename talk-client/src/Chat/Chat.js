import React, { Component } from 'react';
import Room from '../Room/Room';
import User from '../User/User';
import {CreateRoomPopup, ChangeNamePopup} from '../Layout/Layout';
import cookie from 'react-cookies';

class Chat extends Component {
	constructor(props) {
		super(props);
		var user = new User(cookie);
		this.state = {
			userInfo : user.get(),
			roomList : [],
			roomStatus : {
				users : []
			},
			layout : {
				createroom : false,
				changename : false,
			}
		};
		if (this.state.userInfo.currentRoom && this.state.userInfo.currentRoom !== null && this.state.userInfo.currentRoom !== 'null') {
			this.props.socket.emit('Re-Connection', { roomId : this.state.userInfo.currentRoom });
		}
	}

	componentDidMount = () => {
		var initialize = false;
		this.props.socket.on('Room List', (obj) => {
			this.setState({
				roomList : obj
			});
			document.getElementsByClassName('room-list-count')[0].innerText = obj.length;
		});
		this.props.socket.on('Entrance Room', (obj) => {
			this.setState({
				userInfo : {
					id : this.state.userInfo.id,
					name : this.state.userInfo.name,
					currentRoom : obj.roomId
				}
			});
			// Render Message
			obj.msg.forEach((v,i) => {
				this.createMsg(v[1],v[0],v[2]);
			});
			cookie.save('currentRoom', obj.roomId,{path:'/'});
		});
		this.props.socket.on('Entrance Room Alert', (obj) => {
			this.createMsg('System', obj.msg, obj.type);
			this.setState({
				roomStatus : {
					users : obj.users
				}
			});
		});
		this.props.socket.on('Exit Room Alert', (obj) => {
			this.createMsg('System', obj.msg, obj.type);
			this.setState({
				roomStatus : {
					users : obj.users
				}
			});
		});
		this.props.socket.on('Change Name Alert', (obj) => {
			this.createMsg('System',obj.msg, obj.type);
			this.setState({
				roomStatus : {
					users : obj.users
				}
			});
		});
		this.props.socket.on('Refresh', (obj) => {
			if (initialize === false) {
				initialize = true;
				if (obj.roomId) {
					this.setState({
						roomStatus : {
							users : obj.users
						}
					});

					// Render Message
					obj.msg.forEach((v,i) => {
						this.createMsg(v[1],v[0],v[2]);
					});
				} else {
					this.setState({
						userInfo : {
							id : this.state.userInfo.id,
							name : this.state.userInfo.name,
							currentRoom : null,
						},
						roomStatus : {
							users : []
						}
					});
					cookie.save('currentRoom', null,{path:'/'});
				}
			}
		});
		this.props.socket.on('Receive Message', (obj) => {
			this.createMsg(obj.name, obj.msg, obj.type);
		});
	}

	createMsg = (name,msg,type) => {
		var rowCls = '';
		if (name === 'System') rowCls = 'alert';
		var msgclone = document.createElement('div');
		if (type === 'text') {
			msgclone.innerHTML = "<div class='talk-row " + rowCls + "'><label class='talk-name'>" + name + " : </label><span class='talk-msg'>" + msg + "</span></div>";
		} else if (type === 'image') {
			msgclone.innerHTML = "<div class='talk-row " + rowCls + "'><label class='talk-name'>" + name + " : </label><span class='talk-msg'><image src=\"" + msg + "\" /></span></div>";
		}
		document.getElementsByClassName('talk-msg-box')[0].appendChild(msgclone.children[0]);
		document.getElementsByClassName('talk-msg-box')[0].scrollTop = document.getElementsByClassName('talk-msg-box')[0].scrollHeight;
	}

	openCreateRoom = () => {
		this.setState({ layout : { createroom : true }});
		document.getElementById('layout-form').className = 'active';
	}

	openNameChange = () => {
		this.setState({ layout : { changename : true }});
		document.getElementById('layout-form').className = 'active';
	}

	outRoom = () => {
		if (this.state.userInfo.currentRoom && this.state.userInfo.currentRoom !== null && this.state.userInfo.currentRoom !== 'null') {
			document.getElementsByClassName('talk-msg-box')[0].innerHTML = '';
			this.props.socket.emit('Exit Room', { roomId : this.state.userInfo.currentRoom, name : this.state.userInfo.name, userId : this.state.userInfo.id });
			this.setState({
				userInfo : {
					id : this.state.userInfo.id,
					name : this.state.userInfo.name,
					currentRoom : null,
				},
				roomStatus : {
					users : []
				}
			});
			cookie.save('currentRoom', null,{path:'/'});
		}
	}

	closeCreateRoom = () => {
		this.setState({ layout : { createroom : false }});
		document.getElementById('layout-form').className = '';
	}

	closeNameChange = () => {
		this.setState({ layout : { changename : false }});
		document.getElementById('layout-form').className = '';
	}

	changeName = () => {
		var chname = document.getElementsByClassName("changeNameInput")[0].value;
		if (chname === '') {
			alert('Input Change Name!');
			return false;
		}
		var originName = this.state.userInfo.name;
		this.setState({
			userInfo : {
				id : this.state.userInfo.id,
				name : chname,
				currentRoom : this.state.userInfo.currentRoom,
			},
		});
		cookie.save('username', chname,{path:'/'});
		if (this.state.userInfo.currentRoom !== 'null' && this.state.userInfo.currentRoom !== null) {
			this.props.socket.emit('Change Name', { roomId : this.state.userInfo.currentRoom, userId : this.state.userInfo.id, originName : originName, changeName : chname });
		}
		this.closeNameChange();
	}

	msgBox = (e) => {
		if (e.key === 'Enter') {
			this.msgSend();
		}
	}
	
	msgSend = () => {
		if (document.getElementsByClassName('msg-text-box')[0].value) {
			if (this.state.userInfo.currentRoom) {
				this.props.socket.emit('Send Message', { roomId : this.state.userInfo.currentRoom, msg : document.getElementsByClassName('msg-text-box')[0].value, name : this.state.userInfo.name });
				document.getElementsByClassName('msg-text-box')[0].value = '';
			}
		}
	}

	fileSelect = () => {
		if (this.state.userInfo.currentRoom) {
			document.getElementsByClassName('talk-img-file')[0].click();
		}
	}

	imgSend = (e) => {
		if (this.state.userInfo.currentRoom) {
			var obj = document.getElementsByClassName('talk-img-file')[0];
			var file_kind = obj.value.lastIndexOf('.');
			var file_name = obj.value.substring(file_kind+1, obj.length);
			var file_type = file_name.toLowerCase();
			var check_file_type = [];
			check_file_type = ['jpg', 'gif', 'png', 'jpeg', 'bmp', 'tif'];
			if (check_file_type.indexOf(file_type) === -1) {
				alert('Only image file can be uploaded.');
				obj.value = "";
				obj.select();
				document.selection.clear();
				return false;
			}

			var reader = new FileReader();
			reader.onload = () => {
				var result = reader.result;
				this.props.socket.emit('Send Image Message', { roomId : this.state.userInfo.currentRoom, image : result, name : this.state.userInfo.name });
			};
			reader.readAsDataURL(obj.files[0]);
		}
	}

	render() {
		const roomComponent = data => {
			return data.map((key, i) => {
				return (<Room data={data[i]} user={this.state.userInfo} socket={this.props.socket} key={i} />);
			});
		};
		const userComponent = data => {
			if (data) {
				return data.map((key, i) => {
					return (<div className="participants-elements" key={i}>{data[i][1]}</div>);
				});
			}
		};
		return (
			<div id="chat-wrap">
				<div id="user-info">
					<span className="user-name">Name : { this.state.userInfo.name }</span>
					<div className="user-name-change" onClick={this.openNameChange}>Name Change</div>
				</div>
				<div id="participants-wrap">
					<div className="participants-list-title">participants (<label>0</label>)</div>
					<div className="participants-list">
					{userComponent(this.state.roomStatus.users)}
					</div>
				</div>
				<div id="room-wrap">
					<div className="room-list-title">Room List (<label className="room-list-count">0</label>)</div>
					<div className="room-action">
						<div className="room-action-create" onClick={this.openCreateRoom}>Create Room</div>
						<div className="room-action-exit" onClick={this.outRoom}>Exit Room</div>
					</div>
					<div className="room-list">
						{roomComponent(this.state.roomList)}
					</div>
				</div>
				<div id="talk-wrap">
					<div className="talk-msg-box"></div>
					<div className="talk-input">
						<input type="text" className="msg-text-box" onKeyUp={this.msgBox} />
						<span className="talk-send-btn" onClick={this.msgSend} >Send</span>
						<input type="file" className="talk-img-file" onChange={this.imgSend} />
						<span className="talk-img-btn" onClick={this.fileSelect} ></span>
					</div>
				</div>
				<div id="layout-form">
					<div className="layout-bg"></div>
					{this.state.layout.createroom === true &&
						<CreateRoomPopup closeCreateRoom={this.closeCreateRoom} socket={this.props.socket} />
					}
					{this.state.layout.changename === true &&
						<ChangeNamePopup changeName={this.changeName} closeNameChange={this.closeNameChange} socket={this.props.socket} />
					}
				</div>
			</div>
		);
	}
}

export default Chat;