var Handlebars = require('handlebars')

var view = require('./view')

/*
	room ui plugin

	todo:
	-refactor

*/

module.exports.name = 'room_tab'

module.exports.src = function(tabHandler, tab, arg) {

	var document = tabHandler.dom
	var ziggy = tabHandler.ziggy

	// connection info
	var server = arg.server,
		channel = arg.channel

	var inputVal, input

	var messages = [], 
		room = arg.room || {}

	if(arg.mode===1) {
		tab.setName(channel)
		assembleMessage('', 'connecting...', 'messageConnecting')
		joinChannel(ziggy.getNick(), server, channel)
	}
	else if(arg.mode===2) {
		tab.setName('@' + channel)
		assembleMessage(channel, arg.message)
		joinPM()
	}
	else return //error

	function renderChatRoom() {

		document.getElementById('TAB').innerHTML = view({messages: messages, id: tab.id, nick: ziggy.getNick()})

		if(input) inputVal = input.value
		input = document.querySelector('.chat_input')
		if(inputVal) input.value = inputVal

		input.focus()
		input.addEventListener('keydown', onKeyDown, false)

		var chatbox = document.querySelector('.messageContainer')
		chatbox.scrollTop = chatbox.scrollHeight

		/*
			get input value
			e.keyCode 13 = 'ENTER'
		*/
		function onKeyDown(e) {
			if(e.keyCode !== 13) return
			parseInput(input.value)
			input.value = ''
		}
	}

	function parseInput(string) {

		if(string.length === 0) return

		if(string[0] === '/') {

			var words = string.split(' ')

			// '/nick [newNick]'
			if(words[0] === '/nick' && words[1]) {
				ziggy.setNick(words[1])
				return
			}

			// '/join [channel]'
			if(words[0] === '/join' && words[1]) {
				if(ziggy.isConnectedToChannel(server, words[1])) {
					assembleMessage('', 'you are already connected to ' + words[1])
					return
				}
				else {
					tabHandler.open('room_tab', {
						mode: 1,
						channel: words[1],
						server: server,
					})
				}
				return
			}
		}

		room.say(channel, string)
		assembleMessage(ziggy.getNick(), string, 'isUser')
	}

	tabHandler.ee.on('focus#'+tab.id, renderChatRoom)
	tabHandler.ee.on('close#'+tab.id, function() {
		messages = []
		document.getElementById('TAB').innerHTML = ''
	})
	tabHandler.ee.on('blur#'+tab.id, function() {
		document.getElementById('TAB').innerHTML = ''
	})

	function joinPM() {

		room.on('pm', function(user, text) {
			if(user.nick === channel) {
				assembleMessage(user.nick, text)
			}
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

		// disconnect from PM session on close event
		tabHandler.ee.on('close#'+tab.id, function() {
			ziggy.leavePm(channel, server)
		})
	}

	function joinChannel(nick, server, channel) {

		room = ziggy.joinChannel(server, channel, nick)

		.on('message', function(user, chan, text) {
			if(chan !== channel) return
			assembleMessage(user.nick, text)
		})

		/*
			if is new PM
			open new room and pass object
		*/
		.on('pm', function(user, text) {
			if(ziggy.isPm(user.nick, server)) return
			tabHandler.open('room_tab', {
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

		// disconnect from channel on close event
		tabHandler.ee.on('close#'+tab.id, function() {
			ziggy.leaveChannel(room, channel)
		})
	}

	function assembleMessage(nick, text, flag) {

		var message = {
			nick: nick,
			text: text,
			flag: flag
		}
		messages.push(message)

		if(tab.focus === true) {
			renderChatRoom()
		}
		if(tab.focus === false) {
			tab.setNotification()
		}
	}
}