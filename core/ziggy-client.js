var Ziggy = require('ziggy')

/*
	Ziggy wrapper
	channel centered approach
*/
var Ziggy_client = {}

Ziggy_client.init = function() {

	// default nick
	this.nick = "ziggy_client"

	// holds ziggy instances
	this.servers = []

	// holds pm sessions
	this.pm = {}
}

// todo: validate
// test// bug
Ziggy_client.setNick = function(nick) {

	this.nick = nick

	for(var i=0; i<this.servers.length; i++) {
		this.servers[i].nick(nick)
	}
}

Ziggy_client.getNick = function() {
	return this.nick
}

Ziggy_client.joinChannel = function(server, channel) {

	// check if already connected to server
	for(var i=0; i<this.servers.length; i++) {
		if(this.servers[i].settings.server === server) {
			this.servers[i].join([channel])
			return this.servers[i]
		}
	}

	// new ziggy instance
	var newServer = Ziggy({
		server: server,
		nickname: this.nick,
		channels: [channel]
	})

	newServer.start()

	this.servers.push(newServer)

	return newServer
}

Ziggy_client.isConnectedToChannel = function(server, channel) {

	var _servers = this.servers

	for(var i=0; i<_servers.length; i++) {
		if(_servers[i].settings.server === server && _servers[i].settings.channels.indexOf(channel) !== -1) {
			return true
		}
	}
	return false
}

/*
	check if already in PM session with @name
*/
Ziggy_client.isPm = function(name) {

	if(this.pm[name]) return true
	else {
		this.pm[name] = {}
		return false
	}
}

/*
	terminate a PM session
*/
Ziggy_client.leavePm = function(name) {

	if(!this.pm[name]) return
	delete this.pm[name]
}

/*
	part from channel
	disconnect from server if there are no more channels attached
*/
Ziggy_client.leaveChannel = function(ziggy, room) {

	for(var i=0; i<this.servers.length; i++) {

		if(this.servers[i] == ziggy) {
			this.servers[i].part(room)

			if(this.servers[i].settings.server.length === 0 && this.pm.length === 0) {
				this.servers.splice(i,1)
			}
		}
	}
}

module.exports = Ziggy_client