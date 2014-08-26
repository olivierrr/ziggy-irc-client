var Handlebars = require('handlebars')

module.exports = function() {

	//var template = Handlebars.compile('<h1> HELLO </h1>')

	this.ziggy.dom.getElementById('TAB').innerHTML = '<h1> HELLO </h1>'

	this.ee.on('focus', function(id) {
		//console.log('focus: ' + id)
	})

	this.ee.on('blur', function(id) {
		//console.log('blur: ' + id)
	})



	this.ziggy.joinChannel('irc.freenode.net', '#testingbot', 'ziggy-client')

	.on('message', function(user, channel, text) {
		console.log('message')
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