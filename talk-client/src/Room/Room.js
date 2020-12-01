import React, { Component } from 'react';

class Room extends Component {
	constructor(props) {
		super(props);
		this.state = {
			roomId : this.props.data.roomId,
			roomTitle : this.props.data.roomTitle,
			participants : this.props.data.user,
		};
	}
	
	inRoom = (e) => {
		if (this.props.user.currentRoom === this.state.roomId) {
			return false;
		}
		if (this.props.user.currentRoom && this.props.user.currentRoom !== this.state.roomId && this.props.user.currentRoom !== 'null') {
			alert('Leave the current room');
			return false;
		}
		this.props.socket.emit('Entrance Room', { roomId : this.state.roomId, name : this.props.user.name, userId : this.props.user.id });
	}

	render() {
		var active = '';
		if (this.props.user.currentRoom === this.state.roomId) {
			active = ' active';
		}
		return (
			<div className={"room-row" + active} onDoubleClick={this.inRoom}>{ this.state.roomTitle }</div>
		);
	}
}

export default Room;