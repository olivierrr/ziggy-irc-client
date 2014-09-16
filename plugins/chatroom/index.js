var Handlebars = require('handlebars')
Handlebars.registerPartial('userlist', require('./view/partials/userlist'))
Handlebars.registerPartial('messages', require('./view/partials/messages'))

var view = require('./view/view')

/*
	chatroom plugin
*/

var name ='chatroom'

module.exports.name = name

module.exports.background = function(tabHandler) {

	if(!tabHandler.storage.getStorage(name)) {
		tabHandler.storage.setStorage(name, {
			'allow PM': true
		})
	}
}

module.exports.src = function(tabHandler, tab, arg) {

	var document = tabHandler.dom
	var ziggy = tabHandler.ziggy

	// connection info
	var server = arg.server,
		channel = arg.channel

	var inputVal, input

	var messages = [], 
		room = arg.room || {}

	// channel
	if(arg.mode===1) {
		tab.setName(channel)
		assembleMessage('', 'connecting...', 'messageConnecting')
		room = ziggy.joinChannel(server, channel)
		commonEvents()
		channelEvents()
	}
	// pm
	else if(arg.mode===2) {
		tab.setName('@' + channel)
		if(arg.message) assembleMessage(channel, arg.message)
		commonEvents()
		pmEvents()
	}
	else return

	// sorts userlist
	function getUsersList() {
		if(room.client && room.client.chans[channel]) {
			var list = room.client.chans[channel].users
			return Object.keys(list).map(function(key){ return list[key]+key }).sort()
		} else return null
	}

	function renderChatRoom() {

		var userListScroll = document.querySelector('.userList') ? document.querySelector('.userList').scrollTop : 0

		document.getElementById('TAB').innerHTML = view({
			messages: messages, 
			users: getUsersList(),
			id: tab.id, 
			nick: ziggy.getRealNick(server)})

		if(input) inputVal = input.value
		input = document.querySelector('.chat_input')
		if(inputVal) input.value = inputVal

		input.focus()
		input.addEventListener('keydown', onKeyDown, false)

		var chatbox = document.querySelector('.messageContainer')
		chatbox.scrollTop = chatbox.scrollHeight

		document.querySelector('.userList').scrollTop = userListScroll

		var links = document.querySelectorAll('[link]')
		for(var i=0; i<links.length; i++) {
			links[i].addEventListener('click', function(e) { tabHandler.shell.Shell.openExternal(this.getAttribute('link')) })
		}
		var rooms = document.querySelectorAll('[room]')
		for(var i=0; i<rooms.length; i++) {
			rooms[i].addEventListener('click', function(e) {
				var chan = this.getAttribute('room')
				openNewChannel(server, chan)
			})
		}
		var zirc = document.querySelectorAll('[zirc]')
		for(var i=0; i<zirc.length; i++) {
			zirc[i].addEventListener('click', function(e) {
				var words = this.innerText.split('.')
				if(!tabHandler.plugins[words[1]]) {
					assembleMessage('', 'plugin not installed', 'warning')
					return
				}
				var arg = words[2] ? {key:words.slice(2).join('.')} : {key:null}
				console.log(arg)
				tabHandler.open(tabHandler.plugins[words[1]], arg)
			})
		}

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

	var commands = [
		{name:'/me',help:'action message'},
		{name:'/msg',help:'start a private chat'}, 
		{name:'/nick',help:'change your nickname'}, 
		{name:'/join',help:'join a channel'}, 
		{name:'/topic',help:'...'},
		{name:'/whois',help:'see more info about an user'},
		{name:'/invite',help: 'invite an user to a room'},
		{name:'/help',help: 'get a list of available commands'},
		{name:'/notice',help: 'send a notice to a channel or user'}
	]

	function parseInput(string) {

		console.log(string)

		if(string.length === 0) return

		if(string[0] === '/') {

			var words = string.split(/\s+/)

			// '/me [message]'
			if(words[0] === '/me' && words[1]) {
				var message = words.splice(1, words.length).join(' ')
				room.action(channel, message)
				assembleMessage('', ziggy.getRealNick(server) + ' ' + message, 'action')
			}

			// '/msg <recipient> [message(optional)]'
			if(words[0] === '/msg' && words[1]) {
				var message = words[2] ? words.splice(2).join(' ') : null
				var chan = words[1]
				openNewPm(room, server, chan, message)
			}

			// '/nick <newNick>'
			if(words[0] === '/nick' && words[1]) {
				ziggy.setNick(words[1])
			}

			// '/join <channel>'
			if(words[0] === '/join' && words[1]) {
				var chan = words[1]
				openNewChannel(server, chan)
			}

			// '/topic'
			if(words[0] === '/topic') {
				if(room.client.chans[channel] && room.client.chans[channel].topic) {
					var topic = room.client.chans[channel].topic
					assembleMessage('topic', topic, 'topic')
				} else {
					assembleMessage('', 'no topic set', 'topic')
				}
			}

			// '/whois <user>'
			if(words[0] === '/whois' && words[1]) {
				room.whois(words[1], function(obj) {
					Object.keys(obj.info.whois).forEach(function(key) {
						assembleMessage('', key + ': ' + obj.info.whois[key])
					})
				})
			}

			// '/invite <user> <room>'
			if(words[0] === '/invite' && words[1] && words[2]) {
				room.client.send('INVITE', words[1], words[2])
			}

			// '/notice <target> [message]' 
			if(words[0] === '/notice' && words[1] && words[2]) {
				var message = words.splice(2).join(' ')
				room.notice(words[1], message)
			}

			// '/help'
			if(words[0] === '/help') {
				commands.forEach(function(c) { assembleMessage(c.name, c.help) })
			}
		}

		else {
			room.say(channel, string)
			assembleMessage(ziggy.getRealNick(server), string, 'isUser')
		}
	}

	tabHandler.ee.on('focus#'+tab.id, renderChatRoom)
	tabHandler.ee.on('close#'+tab.id, function() {
		messages = []
		document.getElementById('TAB').innerHTML = ''
	})
	tabHandler.ee.on('blur#'+tab.id, function() {
		document.getElementById('TAB').innerHTML = ''
	})

	function pmEvents() {

		room.on('pm', function(user, text) {
			if(user.nick === channel) assembleMessage(user.nick, text)
		})

		room.on('part', function(user, chan, reason) {
			if(user.nick !== channel) return
			assembleMessage('', user.nick + ' has left', 'userLeft')
		})

		room.on('quit', function(user, reason, channels) {
			if(user.nick !== channel) return
			assembleMessage('', user.nick + ' has disconnected ' + reason, 'userQuit')
		})

		room.on('join', function(chan, user) {
			if(user.nick !== channel) return
			assembleMessage('', user.nick + ' has joined', 'userJoined')
		})

		room.on('notice', function(user, to, text) {
			if(user.nick !== channel) return
			assembleMessage('NOTICE', to + ': ' + text)
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
		})

		// disconnect from PM session on close event
		tabHandler.ee.on('close#'+tab.id, function() {
			ziggy.leavePm(channel, server)
		})
	}

	function commonEvents() {

		room.on('server', function(text) {
			assembleMessage('server', text)
		})

		room.client.addListener('error', function(message) {
			assembleMessage('ERROR', JSON.stringify(message), 'error')
			console.log(JSON.stringify(message))
		})
	}

	function channelEvents() {

		room.on('message', function(user, chan, text) {
			if(chan !== channel) return
			assembleMessage(user.nick, text)
		})

		room.on('action', function(user, chan, text){
			if(chan !== channel) return
			assembleMessage('', user.nick + ' ' + text, 'action')
		})

		/*
			if is new PM
			open new room and pass object
		*/
		room.on('pm', function(user, text) {

			if(tab.storage['allow PM'] === false) return // SETTINGS
			openNewPm(room, server, user.nick, text)
		})

		room.on('part', function(user, chan, reason) {
			if(chan !== channel) return
			assembleMessage('', user.nick + ' has left', 'userLeft')
		})

		room.on('quit', function(user, reason, channels) {
			if(channels.indexOf(channel) === -1) return
			assembleMessage('', user.nick + ' has disconnected ' + reason, 'userQuit')
		})

		room.on('nick', function(oldNick, user, channels) {
			if(channels.indexOf(channel) === -1) return
			assembleMessage('', oldNick + ' is now ' + user.nick, 'userNickChange')
		})

		room.on('join', function(chan, user) {
			if(chan !== channel) return
			assembleMessage('', user.nick + ' has joined', 'userJoined')
		})

		room.on('ziggyjoin', function(chan, user) {
			if(chan !== channel) return
			assembleMessage('', 'connected', 'ziggyJoined')
		})

		room.on('kick', function(kicked, kickedBy, chan, reason) {
			if(chan !== channel) return
			assembleMessage('', kicked.nick + ' has been kicked by ' + kickedBy.nick + 'for ' + reason, 'userKicked')
		})

		room.on('topic', function(chan, topic, nick) {
			if(chan !== channel) return
			assembleMessage('topic', topic, 'topic')
		})

		room.on('invite', function(chan, user) {
			assembleMessage('', 'You have been invited to ' + chan + ' by ' + user.nick)
		})

		room.on('notice', function(user, to, text) {
			assembleMessage('NOTICE', to + ': ' + text)
		})

		// disconnect from channel on close event
		tabHandler.ee.on('close#'+tab.id, function() {
			ziggy.leaveChannel(room, channel)
		})
	}

	function openNewChannel(server, channel) {
		if(ziggy.isConnectedToChannel(server, channel)) {
			assembleMessage('', 'you are already on that channel', 'warning')
		} else {

			if(!server||!channel) return

			tabHandler.open(tabHandler.plugins['chatroom'], {
				mode: 1,
				channel: channel,
				server: server
			})
		}
	}

	function openNewPm(room, server, channel, message) {
		if(ziggy.isPm(channel, server)) {
			assembleMessage('', 'you are already in session with that user', 'warning' )
		} else {

			if(!room||!server||!channel) return

			tabHandler.open(tabHandler.plugins['chatroom'], {
				mode: 2,
				room: room,
				channel: channel,
				server: server,
				message: message || null
			})
		}
	}

	function assembleMessage(nick, text, flag) {

		var message = {
			nick: nick,
			text: parseMessage(text),
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

	function parseMessage(str) {

		var str = str.split(' ')

		// http
		.map(function(x,i) {
			if(x[0]=='h' && x[1]=='t' && x[2]=='t' && x[3]=='p') {
				var img
				if(x.split('.').some(function(s){return s==='gif'||s==='png'||s==='jpeg'||s==='jpg'})) {img = '<img src="'+x+'"  >'}
				return '<a class="bold" href="#" link="'+x+'">'+ (img||x) +'</a>'
			} else return x
		})

		// mentions
		.map(function(x,i) {
			if(x === ziggy.getRealNick(server)) return '<b class="bold">'+x+'</b>'
			else return x
		})

		// channel
		.map(function(x,i) {
			if(x[0]==='#') return '<a class="bold" href="#" room="'+x+'">'+x+'</a>'
			else return x
		})

		// key
		.map(function(x,i) {
			if(x[0]==='z'&&x[1]==='i'&&x[2]==='r'&&x[3]==='c') return '<a class="bold" href="#" zirc="'+x+'">'+x+'</a>' 
			else return x
		})

		return str.join(' ')
	}
}
