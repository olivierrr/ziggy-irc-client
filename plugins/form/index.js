var Handlebars = require('handlebars')
var view = require('./view')

/*
	form plugin

	starts up a chatroom tab with form values
*/

var name = 'form'

module.exports.name = name

module.exports.background = function(tabHandler) {

	if(!tabHandler.storage.getStorage(name)) {
		tabHandler.storage.setStorage(name, {
			nick: 'ziggy_client',
			server: 'irc.freenode.net',
			channel: '#learnjavascript'
		})
	}
}

module.exports.src = function(tabHandler, tab) {

	var document = tabHandler.dom
	var ziggy = tabHandler.ziggy

	tab.setName("new session")

	tabHandler.ee.on('focus#'+tab.id, render)
	tabHandler.ee.on('blur#'+tab.id, function() {
		document.getElementById('TAB').innerHTML = ''
	})
	tabHandler.ee.on('close#'+tab.id, function() {
		document.getElementById('TAB').innerHTML = ''
	})

	/*
		render view
		attach event handlers
	*/
	function render(alert) {

		var renderContext = {
			nick: tab.storage.nick || ziggy.getNick(),
			id: tab.id,
			alert: alert
		}
		document.getElementById('TAB').innerHTML = view(renderContext)

		document.getElementById('formSubmit').addEventListener('click', parseForm, false)
		document.getElementById(tab.id).addEventListener('keydown', onKeyDown, false)
	}

	// on 'ENTER' key down: parseForm
	function onKeyDown(e) {
		if(e.keyCode !== 13) return
		parseForm()
	}

	// parseForm
	function parseForm() {

		// get form values
		var nick = document.getElementById('formNick').value || 'ziggyClient'
		var server = document.getElementById('formServer').value || 'irc.freenode.net'
		var channel = document.getElementById('formChannel').value || '#testingbot'

		// render alert if channel is already open on another tab
		if(ziggy.isConnectedToChannel(server, channel)) {
			var alert = {
				message: 'already connected to ' + channel + ' on ' + server,
				flag: 'warning'
			}
			render(alert)
			return
		}

		// set global nick
		ziggy.setNick(nick)

		// note: make sure to return storage!
		tab.updateStorage(function(storage) {
			storage.nick = nick
			storage.server = server
			storage.channel = channel
			return storage
		})

		// start chatroom
		tab.switchPlugin(tabHandler.plugins['chatroom'], {
			mode: 1,
			server: server,
			channel: channel
		})
	}
}