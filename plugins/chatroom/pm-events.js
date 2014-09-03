
module.exports = function(room, server, channel, ziggy, assembleMessage) {

	room.on('pm', function(user, text) {
		if(user.nick !== channel) return
		assembleMessage(user.nick, text)
	})
	room.on('action', function(user, chan, text){
		if(user.nick !== channel) return
		assembleMessage('', user.nick + ' ' + text, 'action')
	})
	room.on('ziggyjoin', function(chan, user) {
		if(chan !== channel) return
		assembleMessage('', 'connected', 'ziggyJoined')
	})
	/*
		when PM session changes nick
		update ziggy.pm so we don't open a new room
	*/
	room.on('nick', function(oldNick, user) {
			// channel = user you are in pm session with
		if(oldNick === channel) {
				ziggy.updatePm(oldNick, server, user.nick)
				channel = user.nick // nope
				assembleMessage('', oldNick + ' is now ' + user.nick, 'userNickChange')
			}
			else assembleMessage('', oldNick + ' is now ' + user.nick, 'userNickChange')
	})
}