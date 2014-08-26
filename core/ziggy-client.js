var Ziggy = require('ziggy')

var Tab_manager = require('./tab-manager')

/*
	Ziggy wrapper
	channel centered approach

	todo:
	- leaveChannel
*/

var Ziggy_client = {}

Ziggy_client.init = function(settings) {

	this.dom = settings.dom || {}

	this.tabs = Object.create(Tab_manager)
	this.tabs.init(settings.tabs || [], this)

	this.plugins = settings.plugins || []

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

	return chan
}

Ziggy_client.leaveChannel = function() { 

}

module.exports = Ziggy_client