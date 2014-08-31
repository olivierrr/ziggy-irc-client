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

	var messages = [], inputVal, room

	// dom nodes
	var input

	// mode0 = form // mode1 = chatroom // mode 2 = pm
	var mode = arg.mode || 0
	setMode(mode)

	/*
		render templates
	*/
	function renderForm(alert) {

		var context = {
			nick: ziggy.getNick(),
			id: tab.id,
			alert: alert
		}

		document.getElementById('TAB').innerHTML = view2(context)
		document.getElementById('roomSubmit').addEventListener('click', roomSubmit, false)
		document.getElementById(tab.id).addEventListener('keydown', formKeyDown, false)
	}
	function renderChatRoom() {

		document.getElementById('TAB').innerHTML = view1({messages: messages, id: tab.id, nick: ziggy.getNick()})

		if(input) inputVal = input.value
		input = document.querySelector('.chat_input')
		if(inputVal) input.value = inputVal

		input.focus()
		input.addEventListener('keydown', chatInput, false)

		var chatbox = document.querySelector('.messageContainer')
		chatbox.scrollTop = chatbox.scrollHeight
	}

	/*
		template events
	*/
	function roomSubmit() {
		var nick = document.getElementById('formNick').value || 'ziggyClient'
		server = document.getElementById('formServer').value || 'irc.freenode.net'
		channel = document.getElementById('formChannel').value || '#testingbot'

		ziggy.setNick(nick)

		setMode(1)
	}
	function chatInput(e) {

		if(e.keyCode !== 13) return

		room.say(channel, input.value)
		assembleMessage(ziggy.getNick(), input.value, 'isUser')

		input.value = ''
	}
	function formKeyDown(e) {

		if(e.keyCode !== 13) return
		roomSubmit()
	}

	/*
		mode 'initializer'
	*/
	function setMode(newMode) {

		if(newMode===0) {

			mode = 0

			tabHandler.ee.on('focus#'+tab.id, function() {
				if(mode===0) renderForm()
			})

			tabHandler.ee.on('close#'+tab.id, function() {
				document.getElementById('TAB').innerHTML = ''
			})
		}

		if(newMode===1) {

			/*
				returns if channel is already open on another tab
			*/
			if(ziggy.isConnectedToChannel(server, channel)) {

				var alert = {
					message: 'already connected to ' + channel + ' on ' + server,
					flag: 'error'
				}
				renderForm(alert)
				return
			}

			mode = 1

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

			assembleMessage(channel, 'connecting...', 'messageConnecting')
			tab.setName(channel)

			renderChatRoom()
			joinChannel(ziggy.getNick(), server, channel)
		}

		if(newMode===2) {

			mode = 2

			tabHandler.ee.on('focus#'+tab.id, function() {
				if(mode===2) renderChatRoom()
			})

			tabHandler.ee.on('close#'+tab.id, function() {
				if(mode===2 && room) {
					ziggy.leavePm(arg.nick, server)
					messages = []
					document.getElementById('TAB').innerHTML = ''
				}
			})

			channel = arg.nick
			server = arg.server
			tab.setName('@' + arg.nick)

			// ziggy instance
			room = arg.room

			assembleMessage(arg.nick, arg.message)

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
			assembleMessage(chan, 'connected', 'ziggyJoined')
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

				assembleMessage(oldNick, ' is now ' + user.nick, 'userNickChange')
			}

			else assembleMessage(channel, oldNick + ' is now ' + user.nick, 'userNickChange')
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
				nick: user.nick,
				server: server,
				message: text
			})
		})

		.on('nick', function(oldNick, user, channels) {
			if(channels.indexOf(channel) === -1) return

			assembleMessage(channel, oldNick + ' is now ' + user.nick, 'userNickChange')
		})

		.on('join', function(chan, user) {
			if(chan !== channel) return
			assembleMessage(channel, user.nick + ' has joined', 'userJoined')
		})

		.on('ziggyjoin', function(chan, user) {
			if(chan !== channel) return
			assembleMessage(chan, 'connected', 'ziggyJoined')
		})

		.on('part', function(user, chan, reason) {
			if(chan !== channel) return
			assembleMessage(channel, user.nick + ' has left', 'userLeft')
		})

		.on('quit', function(user, reason, channels) {
			if(channels.indexOf(channel) === -1) return
			assembleMessage(channel, user.nick + ' has disconnected ' + reason, 'userQuit')
		})

		.on('kick', function(kicked, kickedBy, chan, reason) {
			if(chan !== channel) return
			assembleMessage(channel, kicked + ' has been kicked by ' + kickedBy + 'for ' + reason, 'userKicked')
		})

		.on('topic', function(chan, topic, nick) {
			if(chan !== channel) return
			console.log('topic')
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