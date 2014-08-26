var Handlebars = require('handlebars')

/*
	room ui plugin

	todo:
	-rewrite
*/

module.exports = function(tab) {

	var document = this.ziggy.dom
	var ziggy = this.ziggy
	tab.messages = []

	var form_template = Handlebars.compile(document.getElementById('tab_room_template_q').innerHTML)
	var room_template = Handlebars.compile(document.getElementById('tab_room_template').innerHTML)

	var chatbox

	this.ee.on('focus#'+tab.id, function() {

		document.getElementById('TAB').innerHTML = form_template()

		onClick('#roomSubmit', roomSubmit)
	})

	this.ee.on('blur#'+tab.id, function() {
		//
	})

	function onClick(query, cb){
		var elem = document.querySelectorAll(query)
		for(var i=0; i<elem.length; i++){
			elem[i].addEventListener('click', cb)
		}
	}

	// should validate, handle missing fields/errors
	function roomSubmit(e) {

		var nick = document.getElementById('formNick').value || 'ziggyClient'
		var server = document.getElementById('formServer').value || 'irc.freenode.net'
		var channel = document.getElementById('formChannel').value || '#testingbot'
		
		joinRoom(nick, server, channel)
	}

	function joinRoom(nick, server, channel) {

		document.getElementById('TAB').innerHTML = room_template()
		chatbox = document.getElementById('TAB_ROOM')

		ziggy.joinChannel('irc.freenode.net', '#testingbot', 'ziggy-client')

		.on('message', function(user, channel, text) {
			console.log('message')
			tab.messages.push(text)
			appendToChat(user.nick, text)
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

	// temp
	function appendToChat(from, msg){
		// create and append
		var o = document.createElement('div')
		o.className = 'message'
		o.innerHTML = '<b>' + from + '</b>' + ': ' + msg
		chatbox.appendChild(o)

		// scroll
		chatbox.scrollTop = chatbox.scrollHeight
	}


	

}