var Ziggy = require('ziggy')

/*
	Ziggy wrapper
	channel centered approach

	todo:
	- leaveChannel
*/

var Ziggy_client = {}

Ziggy_client.init = function(settings) {

	this.channels = []
}


Ziggy_client.joinChannel = function(server, channel, nick) {

	var chan = Ziggy({
		server: server,
		nickname: nick,
		channels: [channel]
	})

	chan.start()

	this.channels.push(chan)
	console.log(this.channels)
	return chan
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