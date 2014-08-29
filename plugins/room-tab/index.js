var Handlebars = require('handlebars')

var view1 = require('./view1')
var view2 = require('./view2')

/*
	room ui plugin

	todo:
	-refactor

*/

module.exports = function(tabHandler, tab) {

	var document = tabHandler.dom
	var ziggy = tabHandler.ziggy

	// templates
	var form_template = view2
	var room_template = view1

	// room misc
	var nick, server, channel, messages = [], inputVal, input

	// dom nodes
	var chatbox, room

	// mode0 = form // mode1 = chatroom
	var mode = 0

	var renderForm_context = {}

	/*
		tab events
	*/
	tabHandler.ee.on('focus#'+tab.id, function() {
		if(mode===0) renderForm()
		if(mode===1) {
			renderChatRoom()
			tab.notifications = 0
			tabHandler.updateMenu()
		}
	})
	tabHandler.ee.on('blur#'+tab.id, function() {
		//
	})
	tabHandler.ee.on('close#'+tab.id, function() {
		if(room) ziggy.leaveChannel(room, channel)
		document.getElementById('TAB').innerHTML = ''
	})

	/*
		render templates
	*/
	function renderForm() {

		document.getElementById('TAB').innerHTML = form_template(renderForm_context)
		renderForm_context = {}

		document.getElementById('roomSubmit').addEventListener('click', roomSubmit, false)
		document.getElementById('roomForm').addEventListener('keydown', formKeyDown, false)

		document.getElementById('formNick').focus()
	}
	function renderChatRoom() {

		document.getElementById('TAB').innerHTML = room_template({messages: messages, id: tab.id, nick: nick})

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

		room.say(room.settings.channels[room.settings.channels.indexOf(channel)], input.value)
		assembleMessage(nick, input.value)

		input.value = ''
	}
	function formKeyDown(e) {

		if(e.keyCode !== 13) return
		roomSubmit()
	}

	/*
		actions
	*/
	function joinRoom(nick, server, channel) {

		if(ziggy.isConnectedToChannel(server, channel)) {

			renderForm_context.alert = {
				message: 'already connected to ' + channel + ' on ' + server,
				flag: 'error'
			}

			renderForm()
			return
		}

		if(mode===0) {
			mode = 1
			assembleMessage(channel, 'connecting...', 'messageConnecting')
			tab.name = channel
			tabHandler.updateMenu()
		}
		
		renderChatRoom()

		room = ziggy.joinChannel(server, channel, nick)

		.on('message', function(user, chan, text) {
			if(chan !== channel) return
			assembleMessage(user.nick, text)
		})

		.on('pm', function(user, text) {
			console.log('pm')
		})

		.on('nick', function(oldNick, user, channels) {
			assembleMessage(channels, oldNick + ' is now ' + user.nick, 'userNickChange')
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

		.on('quit', function(user, reason) {
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
			tab.notifications += 1
			tabHandler.updateMenu()
		}
	}
}