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
			document.getElementById('TAB').innerHTML = room_template({messages: messages})
			chatbox = document.getElementById('TAB_ROOM')
			input = document.getElementById('chat_input')
			input.addEventListener('keydown', chatInput, false)
		}
	})

	this.ee.on('blur#'+tab.id, function() {
		//
	})

	this.ee.on('close#'+tab.id, function() {
		//
	})


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

		document.getElementById('TAB').innerHTML = room_template()
		chatbox = document.getElementById('TAB_ROOM')

		input = document.getElementById('chat_input')
		input.addEventListener('keydown', chatInput, false)

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
		appendToChat(nick, text)
	}

	function chatInput(e) {

		if(e.keyCode !== 13) return

		assembleMessage(nick, input.value)

		room.say(room.settings.channels[0], input.value)

		input.value = ''
	}

	// temp
	function appendToChat(nick, text){
		// create and append
		var o = document.createElement('div')
		o.className = 'message'
		o.innerHTML = nick + ': ' + text
		chatbox.appendChild(o)

		// scroll
		chatbox.scrollTop = chatbox.scrollHeight
	}
}