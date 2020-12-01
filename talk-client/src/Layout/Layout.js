import React, { Component } from 'react';

export class CreateRoomPopup extends Component {
	constructor(props) {
		super(props);
	}

	createRoom = () => {
		if (document.getElementsByClassName('createRoomTitle')[0].value === '') {
			alert('Input Room Title!');
			return false;
		}
		this.props.socket.emit('Create Room', { roomId : btoa('room' + (Math.random() * new Date().getTime())), roomTitle : document.getElementsByClassName('createRoomTitle')[0].value });
		this.props.closeCreateRoom();
	}

	keyEvent = (e) => {
		if (e.key === 'Enter') {
			this.createRoom();
		}
	}

	render() {
		return (
			<div className="layout-wrap" id="create-room-wrap">
				<div>
					<div className="layout-title">Create Room<span className="layout-close" onClick={this.props.closeCreateRoom} >X</span></div>
					<div className="layout-contents">
						<span>Room Title</span>
						<input type="text" className="createRoomTitle" onKeyUp={this.keyEvent} />
					</div>
					<div className="layout-btn" onClick={this.createRoom}>Create</div>
				</div>
			</div>
		);
	}
}

export class ChangeNamePopup extends Component {
	constructor(props) {
		super(props);
	}

	keyEvent = (e) => {
		if (e.key === 'Enter') {
			this.props.changeName();
		}
	}

	render() {
		return (
			<div className="layout-wrap" id="change-name-wrap">
				<div>
					<div className="layout-title">Create Room<span className="layout-close" onClick={this.props.closeNameChange} >X</span></div>
					<div className="layout-contents">
						<span>Change Name</span>
						<input type="text" className="changeNameInput" onKeyUp={this.keyEvent} />
					</div>
					<div className="layout-btn" onClick={this.props.changeName}>Change</div>
				</div>
			</div>
		);
	}
}