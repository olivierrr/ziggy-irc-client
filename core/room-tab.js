var Handlebars = require('handlebars')

/*
	room ui plugin

	todo:
	-rewrite
	-rewrite
	-rewrite
*/

module.exports = function(tab) {

	var document = this.ziggy.dom
	var ziggy = this.ziggy

	// templates
	var form_template = Handlebars.compile(document.getElementById('tab_room_template_q').innerHTML)
	var room_template = Handlebars.compile(document.getElementById('tab_room_template').innerHTML)

	// room misc
	var nick, server, channel, messages = []

	// dom nodes
	var chatbox, room

	// mode0 = form // mode1 = chatroom
	var mode = 0


	this.ee.on('focus#'+tab.id, function() {
		if(mode===0) {
			document.getElementById('TAB').innerHTML = form_template()
			document.getElementById('roomSubmit').addEventListener('click', roomSubmit, false)
		}
		if(mode===1) {
			renderChatRoom()
		}
	})

	this.ee.on('blur#'+tab.id, function() {
		//
	})

	this.ee.on('close#'+tab.id, function() {
		//
	})


	function renderChatRoom() {
		document.getElementById('TAB').innerHTML = room_template({messages: messages, id: tab.id})
		chatbox = document.getElementById('TAB_ROOM')
		input = document.getElementById('chat_input_' + tab.id)
		input.focus()
		input.addEventListener('keydown', chatInput, false)
		chatbox.scrollTop = chatbox.scrollHeight
	}

	// should validate, handle missing fields/errors
	function roomSubmit(e) {
		nick = document.getElementById('formNick').value || 'ziggyClient'
		server = document.getElementById('formServer').value || 'irc.freenode.net'
		channel = document.getElementById('formChannel').value || '#testingbot'

		console.log(nick + ' ' + server + ' ' + channel)

		joinRoom(nick, server, channel)
	}

	function joinRoom(nick, server, channel) {

		mode = 1

		renderChatRoom()

		room = ziggy.joinChannel(server, channel, nick)

		.on('message', function(user, channel, text) {

			assembleMessage(user.nick, text)
		})

		.on('pm', function(user, text) {
			console.log('pm')
		})

		.on('nick', function(oldNick, user, channels) {
			console.log('nick')
		})

		.on('join', function(channel, user) {
			console.log('join')
		})

		.on('part', function(user, channel, reason) {
			console.log('part')
		})

		.on('quit', function(user, reason) {
			console.log('quit')
		})

		.on('kick', function(kicked, kickedBy, channel, reason) {
			console.log('kick')
		})

		.on('topic', function(channel, topic, nick) {
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
		if(tab.focus === true) renderChatRoom()
	}

	function chatInput(e) {

		if(e.keyCode !== 13) return

		room.say(room.settings.channels[0], input.value)
		assembleMessage(nick, input.value)

		input.value = ''
	}
}