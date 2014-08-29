var Ziggy = require('ziggy')

/*
	Ziggy wrapper
	channel centered approach

	todo:
	- should be a 'plugin'
	- join should check if already connected to server
*/

var Ziggy_client = {}

Ziggy_client.init = function(settings) {

	this.channels = []
}


Ziggy_client.joinChannel = function(server, channel, nick) {

	// check if already connected to server
	for(var i=0; i<this.channels.length; i++) {
		if(this.channels[i].settings.server === server) {
			this.channels[i].join([channel])
			return this.channels[i]
		}
	}

	// new ziggy instance
	var chan = Ziggy({
		server: server,
		nickname: nick,
		channels: [channel]
	})

	chan.start()

	this.channels.push(chan)

	return chan
}

Ziggy_client.isConnectedToChannel = function(server, channel, nick) {

	// check if already connected to server
	for(var i=0; i<this.channels.length; i++) {
		if(this.channels[i].settings.server === server) {
			if(this.channels[i].settings.channels.indexOf(channel) !== -1) {
				return true
			}
		}
	}

	return false
}

Ziggy_client.leaveChannel = function(instance, room) { 

	for(var i=0; i<this.channels.length; i++) {
		if(this.channels[i] === instance) {
			instance.part(room)
			this.channels.splice(i,1)
		}
	}
}

module.exports = Ziggy_client