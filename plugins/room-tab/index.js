var Handlebars = require('handlebars')

var view1 = require('./view1')
var view2 = require('./view2')

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
	var server, channel

	var messages = [], room

	// mode1 = chatroom // mode 2 = pm
	var mode = arg.mode || 1
	setMode(mode)


	function renderChatRoom() {

		var inputVal, input

		document.getElementById('TAB').innerHTML = view1({messages: messages, id: tab.id, nick: ziggy.getNick()})

		if(input) inputVal = input.value
		input = document.querySelector('.chat_input')
		if(inputVal) input.value = inputVal

		input.focus()
		input.addEventListener('keydown', chatInput, false)

		var chatbox = document.querySelector('.messageContainer')
		chatbox.scrollTop = chatbox.scrollHeight

		/*
			get input value
			e.keyCode 13 = 'ENTER'
		*/
		function chatInput(e) {
			if(e.keyCode !== 13) return
			room.say(channel, input.value)
			assembleMessage(ziggy.getNick(), input.value, 'isUser')
			input.value = ''
		}
	}

	/*
		mode 'initializer'
	*/
	function setMode(newMode) {

		if(newMode===1) {

			mode = 1

			channel = arg.channel
			server = arg.server

			tabHandler.ee.on('focus#'+tab.id, function() {
				if(mode===1) renderChatRoom()
			})

			tabHandler.ee.on('close#'+tab.id, function() {
				if(mode===1 && room) {
					ziggy.leaveChannel(room, channel)
					messages = []
					document.getElementById('TAB').innerHTML = ''
				}
			})

			assembleMessage('', 'connecting...', 'messageConnecting')
			tab.setName(channel)

			renderChatRoom()
			joinChannel(ziggy.getNick(), server, channel)
		}

		if(newMode===2) {

			mode = 2

			channel = arg.channel //channel = user pm with
			server = arg.server

			tabHandler.ee.on('focus#'+tab.id, function() {
				if(mode===2) renderChatRoom()
			})

			tabHandler.ee.on('close#'+tab.id, function() {
				if(mode===2 && room) {
					ziggy.leavePm(channel, server)
					messages = []
					document.getElementById('TAB').innerHTML = ''
				}
			})


			tab.setName('@' + channel)

			// ziggy instance
			room = arg.room

			assembleMessage(channel, arg.message)

			joinPM()
		}
	}

	/*
		actions
	*/
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