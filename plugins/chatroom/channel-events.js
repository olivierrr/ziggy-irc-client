
module.exports = function(nick, server, channel, ziggy, assembleMessage) {

	var room = ziggy.joinChannel(server, channel, nick)

	.on('message', function(user, chan, text) {
		if(chan !== channel) return
		assembleMessage(user.nick, text)
	})
	.on('action', function(user, chan, text){
		if(chan !== channel) return
		assembleMessage('', user.nick + ' ' + text, 'action')
	})
	/*
		if is new PM
		open new room and pass object
	*/
	.on('pm', function(user, text) {
		if(ziggy.isPm(user.nick, server)) return
			tabHandler.open('chatroom', {
			mode: 2,
			room: room,
			channel: user.nick, // other users nick
			server: server,
			message: text
		})
	})
	.on('nick', function(oldNick, user, channels) {
		if(channels.indexOf(channel) === -1) return
		assembleMessage('', oldNick + ' is now ' + user.nick, 'userNickChange')
	})
	.on('join', function(chan, user) {
		if(chan !== channel) return
		assembleMessage('', user.nick + ' has joined', 'userJoined')
	})
	.on('ziggyjoin', function(chan, user) {
		if(chan !== channel) return
		assembleMessage('', 'connected', 'ziggyJoined')
	})
	.on('part', function(user, chan, reason) {
		if(chan !== channel) return
		assembleMessage('', user.nick + ' has left', 'userLeft')
	})
	.on('quit', function(user, reason, channels) {
		if(channels.indexOf(channel) === -1) return
		assembleMessage('', user.nick + ' has disconnected ' + reason, 'userQuit')
	})
	.on('kick', function(kicked, kickedBy, chan, reason) {
		if(chan !== channel) return
		assembleMessage('', kicked.nick + ' has been kicked by ' + kickedBy.nick + 'for ' + reason, 'userKicked')
	})
	.on('topic', function(chan, topic, nick) {
		if(chan !== channel) return
		assembleMessage(channel, topic)
	})

	return room
}