var Handlebars = require('handlebars')

module.exports = function(tab) {

	var document = this.ziggy.dom
	//var tab = this.getById(id)
	tab.messages = []

	var template = Handlebars.compile(document.getElementById('tab_room_template').innerHTML)
	var context = {}

	this.ee.on('focus#'+tab.id, function() {
		document.getElementById('TAB').innerHTML = template(context)
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


	function appendToChat(from, msg){
		var chatbox = document.getElementById('TAB_ROOM')
		// create and append
		var o = document.createElement('div')
		o.className = 'message'
		o.innerHTML = '<b>' + from + '</b>' + ': ' + msg
		chatbox.appendChild(o)

		// scroll
		chatbox.scrollTop = chatbox.scrollHeight
	}


	this.ziggy.joinChannel('irc.freenode.net', '#testingbot', 'ziggy-client')

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