module.exports = class User {
	constructor(cookie) {
		this.info = {
			id : cookie.load('userid') || btoa('session' + (Math.random() * new Date().getTime())),
			name : cookie.load('username') || 'guest-' + Math.floor(Math.random() * 1000),
			currentRoom : cookie.load('currentRoom') || null,
		};
		cookie.save('userid', this.info.id,{path:'/'});
		cookie.save('username', this.info.name,{path:'/'});
	}

	get = () => {
		return this.info;
	}
}