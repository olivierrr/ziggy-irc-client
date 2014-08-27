var Handlebars = require('handlebars')

var view1 = require('./view1')
var view2 = require('./view2')

/*
	room ui plugin

	todo:
	-rewrite
	-rewrite
	-rewrite
*/

module.exports = function(tab) {

	console.log(this)

	var document = this.dom
	var ziggy = this.ziggy

	// templates
	var form_template = view2
	var room_template = view1

	// room misc
	var nick, server, channel, messages = [], inputVal, input

	// dom nodes
	var chatbox, room

	// mode0 = form // mode1 = chatroom
	var mode = 0


	this.ee.on('focus#'+tab.id, function() {
		if(mode===0) renderForm()
		if(mode===1) renderChatRoom()
	})

	this.ee.on('blur#'+tab.id, function() {
		//
	})

	this.ee.on('close#'+tab.id, function() {
		if(room) ziggy.leaveChannel(room, channel)
		document.getElementById('TAB').innerHTML = ''
		//if(channel)room.part(channel)
	})

	function renderForm() {
		document.getElementById('TAB').innerHTML = form_template()
		document.getElementById('roomSubmit').addEventListener('click', roomSubmit, false)
	}

	function renderChatRoom() {

		if(input) inputVal = input.value

		document.getElementById('TAB').innerHTML = room_template({messages: messages, id: tab.id})

		input = document.createElement('input')
		input.className = 'chat_input'
		if(inputVal) input.value = inputVal
		document.getElementById('partial_input').appendChild(input)

		input.focus()
		input.addEventListener('keydown', chatInput, false)

		chatbox = document.getElementById('TAB_ROOM')
		chatbox.scrollTop = chatbox.scrollHeight
	}

	// should validate, handle missing fields/errors
	function roomSubmit(e) {
		nick = document.getElementById('formNick').value || 'ziggyClient'
		server = document.getElementById('formServer').value || 'irc.freenode.net'
		channel = document.getElementById('formChannel').value || '#testingbot'

		joinRoom(nick, server, channel)
	}

	function joinRoom(nick, server, channel) {

		if(mode===0) {
			mode = 1
			assembleMessage('', 'connecting...', 'messageConnecting')
		}
		
		renderChatRoom()

		room = ziggy.joinChannel(server, channel, nick)

		.on('message', function(user, channel, text) {
			assembleMessage(user.nick, text)
		})

		.on('pm', function(user, text) {
			console.log('pm')
		})

		.on('nick', function(oldNick, user, channels) {
			assembleMessage(channels, oldNick + ' is now ' + user.nick, 'userNickChange')
		})

		.on('join', function(channel, user) {
			assembleMessage(channel, user.nick + ' has joined', 'userJoined')
		})

		.on('ziggyjoin', function(channel, user) {
			assembleMessage(channel, 'connected', 'ziggyJoined')
		})

		.on('part', function(user, channel, reason) {
			assembleMessage(channel, user.nick + ' has left', 'userLeft')
		})

		.on('quit', function(user, reason) {
			assembleMessage(channel, user.nick + ' has disconnected ' + reason, 'userQuit')
		})

		.on('kick', function(kicked, kickedBy, channel, reason) {
			assembleMessage(channel, kicked + ' has been kicked by ' + kickedBy + 'for ' + reason, 'userKicked')
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
		else {
			//todo
		}
	}

	function chatInput(e) {

		if(e.keyCode !== 13) return

		room.say(room.settings.channels[0], input.value)
		assembleMessage(nick, input.value)

		input.value = ''
	}
}