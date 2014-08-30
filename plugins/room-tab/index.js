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

	// templates
	var form_template = view2
	var room_template = view1

	// connection info
	var nick, server, channel, isConnected = false

	var messages = [], inputVal, input, room

	// dom nodes
	var chatbox

	// mode0 = form // mode1 = chatroom // mode 2 = pm
	var mode = arg.mode || 0

	var renderForm_context = {}
	renderForm_context.nick = ziggy.nick

	/*
		tab events
	*/
	tabHandler.ee.on('focus#'+tab.id, function() {

		if(mode===0) {
			renderForm()
		}
		if(mode===1) {
			renderChatRoom()
		}
		if(mode===2) {
			renderChatRoom()
			if(room) return
			else joinPM()
		}

		tab.setNotifications(0)
	})
	tabHandler.ee.on('close#'+tab.id, function() {

		if(mode===1 && room) {
			ziggy.leaveChannel(room, channel)
			messages = []
		}
		if(mode===2 && room) {
			ziggy.leavePm(arg.nick)
			messages = []
		}

		document.getElementById('TAB').innerHTML = ''
	})

	/*
		render templates
	*/
	function renderForm() {

		document.getElementById('TAB').innerHTML = form_template(renderForm_context)
		renderForm_context.alert = {}

		document.getElementById('roomSubmit').addEventListener('click', roomSubmit, false)
		document.getElementById('roomForm').addEventListener('keydown', formKeyDown, false)
	}
	function renderChatRoom() {

		document.getElementById('TAB').innerHTML = room_template({messages: messages, id: tab.id, nick: ziggy.nick})

		if(input) inputVal = input.value
		input = document.querySelector('.chat_input')
		if(inputVal) input.value = inputVal

		input.focus()
		input.addEventListener('keydown', chatInput, false)

		chatbox = document.getElementById('TAB_ROOM')
		chatbox.scrollTop = chatbox.scrollHeight
	}

	/*
		template events
	*/
	function roomSubmit() {
		nick = document.getElementById('formNick').value || 'ziggyClient'
		server = document.getElementById('formServer').value || 'irc.freenode.net'
		channel = document.getElementById('formChannel').value || '#testingbot'

		joinRoom(nick, server, channel)
	}
	function chatInput(e) {

		if(e.keyCode !== 13) return

		room.say(channel, input.value)
		assembleMessage(nick, input.value, 'isUser')

		input.value = ''
	}
	function formKeyDown(e) {

		if(e.keyCode !== 13) return
		roomSubmit()
	}

	/*
		actions
	*/
	function joinPM() {

		channel = arg.nick
		tab.setName('@' + arg.nick)

		nick = arg.myNick

		// ziggy instance
		room = arg.room
		
		assembleMessage(arg.nick, arg.message)

		room.on('pm', function(user, text) {
			if(user.nick === channel) {
				assembleMessage(user.nick, text)
			}
		})

		room.on('ziggyjoin', function(chan, user) {
			if(chan !== channel) return
			isConnected = true
			assembleMessage(chan, 'connected', 'ziggyJoined')

		})

		/*
			when PM session changes nick
			update ziggy.pm so we don't open a new room
		*/
		room.on('nick', function(oldNick, user) {

			// if we change nick
			if(oldNick === nick) {
				if(isConnected) {
					nick = user.nick
					assembleMessage('', 'you are now' + user.nick, 'userNickChange')
				}
				else {
					room.on('ziggyjoin', function() {
						nick = user.nick
						assembleMessage('', 'you are now' + user.nick, 'userNickChange')
					})
				}
			}

			if(oldNick === channel) {

				if(isConnected) nick = user.nick
				else {
					room.on('ziggyjoin', function() {
						nick = user.nick
					})
				}

				delete ziggy.pm[channel]

				channel = user.nick

				ziggy.pm[channel] = {}

				assembleMessage(oldNick, ' is now ' + user.nick, 'userNickChange')
			}
		})
	}

	function joinRoom(nick, server, channel) {

		if(ziggy.isConnectedToChannel(server, channel)) {

			renderForm_context.alert = {
				message: 'already connected to ' + channel + ' on ' + server,
				flag: 'error'
			}
			renderForm()
			return
		}

		mode = 1
		assembleMessage(channel, 'connecting...', 'messageConnecting')
		tab.setName(channel)

		ziggy.setNick(nick)
		nick = ziggy.getNick()

		renderChatRoom()

		room = ziggy.joinChannel(server, channel, nick)

		.on('message', function(user, chan, text) {
			if(chan !== channel) return
			assembleMessage(user.nick, text)
		})

		.on('pm', function(user, text) {
			if(ziggy.isPm(user.nick)) return
			tabHandler.open('room_tab', {
				mode: 2,
				room: room,
				nick: user.nick,
				message: text,
				myNick: nick
			})
		})

		.on('nick', function(oldNick, user, channels) {
			if(channels.indexOf(channel) === -1) return

			// if we change nick
			if(oldNick === nick) {

				if(isConnected) {
					nick = user.nick
					assembleMessage('channel', oldNick + ' is now ' + user.nick, 'userNickChange')
				}
				else {
					room.on('ziggyjoin', function() {
						nick = user.nick
						assembleMessage(channel, oldNick + ' is now ' + user.nick, 'userNickChange')
					})
				}
				
			}
			else assembleMessage(channel, oldNick + ' is now ' + user.nick, 'userNickChange')
			
		})

		.on('join', function(chan, user) {
			if(chan !== channel) return
			assembleMessage(channel, user.nick + ' has joined', 'userJoined')
		})

		.on('ziggyjoin', function(chan, user) {
			if(chan !== channel) return
			isConnected = true
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
			var count = tab.notifications + 1
			tab.setNotifications(count)
		}
	}
}