var Ziggy = require('ziggy')

var Tab_manager = require('./lib/tab-manager')

module.exports = Ziggy_client

/*
	Ziggy wrapper
	channel centered approach

	todo:
	- leaveChannel
*/

var Ziggy_client = {}

Ziggy_client.init = function(settings) {

	this.tabs = settings.tabs || []

	this.plugins = settings.plugins || []
}

Ziggy_client.joinChannel = function(server, channel, nick) {

	this.channels = this.channels || {}

	if(this.channels[server+channel]) return this.channels[server+channel]

	var chan = this.channels[server+channel] = Ziggy({
		server: server,
		nickname: nick,
		channels: [channel]
	})

	chan.start()

	return chan
}

Ziggy_client.leaveChannel = function() { 

}