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
	this.pm = []
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

Ziggy_client.getRealNick = function(server) {
	for(var i=0; i<this.servers.length; i++) {
		if(this.servers[i].settings.server === server) {
			return this.servers[i].client.nick
		} 
	}
	//fallback
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
Ziggy_client.isPm = function(session, server) {

	for(var i=0; i<this.pm.length; i++) {
		if(this.pm[i].session === session && this.pm[i].server === server) return true
	}

	this.pm.push({
		session: session,
		server: server	
	})

	return false
}

Ziggy_client.updatePm = function(session, server, newSession) {

	for(var i=0; i<this.pm.length; i++) {
		if(this.pm[i].session === session && this.pm[i].server === server) {
			this.pm[i].session = newSession
		}
	}
}

/*
	terminate a PM session
*/
Ziggy_client.leavePm = function(session, server) {

	console.log('leaving pm......')

	for(var i=0; i<this.pm.length; i++) {
		if(this.pm[i].session === session && this.pm[i].server === server) {
			console.log('leavesPm: ' + session + ' ' + server)
			this.pm.splice(i, 1)
		}
	}

	// if(!this.pm[name]) return
	// delete this.pm[name]
	
	this.leaveServer()
}

/*
	part from channel
*/
Ziggy_client.leaveChannel = function(ziggy, room) {

	console.log('leaving channel...')

	for(var i=0; i<this.servers.length; i++) {

		if(this.servers[i] == ziggy) {
			console.log('leaves channel: ' + room)
			this.servers[i].part(room)
			this.leaveServer()
		}
	}
}

/*
	disconnect from server if there are no more channels attached
*/
Ziggy_client.leaveServer = function() {

	console.log('leaving server.....')

	for(var i=0; i<this.servers.length; i++) {
		if(this.servers[i].settings.channels.length === 0 && Object.keys(this.pm).length === 0) {
			console.log('leaves server: ' + this.servers[i].settings.server)
			this.servers[i].disconnect()
			this.servers.splice(i,1)
		}
	}
}

module.exports = Ziggy_client