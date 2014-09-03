var Handlebars = require('handlebars')
var view = require('./view')
var joinChannel = require('./channel-events')
var joinPM = require('./pm-events')

/*
	chatroom plugin
*/

module.exports.name = 'chatroom'

module.exports.src = function(tabHandler, tab, arg) {

	var document = tabHandler.dom
	var ziggy = tabHandler.ziggy

	// connection info
	var server = arg.server,
		channel = arg.channel

	var room

	var inputVal, input

	var messages = []

	// mode 1 = channel chat
	if(arg.mode===1) {
		tab.setName(channel)
		assembleMessage('', 'connecting...', 'messageConnecting')

		room = joinChannel(ziggy.getNick(), server, channel, ziggy, assembleMessage)

		// disconnect from channel on close event
		tabHandler.ee.on('close#'+tab.id, function() {
			ziggy.leaveChannel(room, channel)
		})
	}
	// mode 2 = pm chat
	else if(arg.mode===2) {
		tab.setName('@' + channel)
		if(arg.message) assembleMessage(channel, arg.message)

		room = arg.room || {}

		joinPM(room, server, channel, ziggy, assembleMessage)

		// disconnect from PM session on close event
		tabHandler.ee.on('close#'+tab.id, function() {
			ziggy.leavePm(channel, server)
		})
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
			keyCode 13 = 'ENTER'
			keyCode 40 = 'up arrow'
			keyCode 38 = 'down arrow'
		*/
		function onKeyDown(e) {

			if(e.keyCode === 13) {
				parseInput(input.value)

				this.lastUser = null
				this.lastMessage = null
				input.value = ''
			}

			// input.value = last user to talks name
			else if(e.keyCode === 40) {
				this.lastUser = this.lastUser-1 || messages.length-1
				input.value = (messages[this.lastUser] ? messages[this.lastUser].nick : ziggy.getNick()) + ' '
				setTimeout(function(){
					input.setSelectionRange(input.value.length, input.value.length)
				}, 0)
			}

			// input.value = last message
			else if(e.keyCode === 38) {
				this.lastMessage = this.lastMessage-1 || messages.length-1
				input.value = (messages[this.lastMessage] ? messages[this.lastMessage].text : '') + ' '
				setTimeout(function(){
					input.setSelectionRange(input.value.length, input.value.length)
				}, 0)
			}
		}
	}

	function parseInput(string) {

		if(string.length === 0) return

		if(string[0] === '/') {

			var words = string.split(/\s+/)

			// '/me [string(s)]'
			if(words[0] === '/me' && words[1]) {

				var message = words.splice(1, words.length).join(' ')
				room.action(channel, message)
				assembleMessage('', ziggy.getNick() + ' ' + message, 'action')
				return
			}

			// '/pm [recipient]'
			if(words[0] === '/pm' && words[1]) {

				if(ziggy.isPm(words[1], server)) {
					assembleMessage('', 'you are already in session with ' + words[1], 'warning')
					return
				}

				var message = words[2] ? words.splice(2, words.length).join(' ') : null

				tabHandler.open('chatroom', {
					mode: 2,
					channel: words[1],
					room: room,
					server: server,
					message: message
				})
				return
			}

			// '/nick [newNick]'
			if(words[0] === '/nick' && words[1]) {
				ziggy.setNick(words[1])
				return
			}

			// '/join [channel]'
			if(words[0] === '/join' && words[1]) {
				if(ziggy.isConnectedToChannel(server, words[1])) {
					assembleMessage('', 'you are already connected to ' + words[1], 'warning')
					return
				}
				else {
					tabHandler.open('chatroom', {
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
