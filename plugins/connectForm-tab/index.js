
var view = require('./view')

module.exports.name = 'connection_form'

module.exports.src = function(tabHandler, tab, arg) {

	var document = tabHandler.dom
	var ziggy = tabHandler.ziggy

	tab.setName("new session")

	/*
		tabHandler events
	*/
	tabHandler.ee.on('focus#'+tab.id, function() {
		renderForm()
	})
	tabHandler.ee.on('close#'+tab.id, function() {
		document.getElementById('TAB').innerHTML = ''
	})
	
	function renderForm(alert) {

		var context = {
			nick: ziggy.getNick(),
			id: tab.id,
			alert: alert
		}

		document.getElementById('TAB').innerHTML = view(context)
		document.getElementById('roomSubmit').addEventListener('click', roomSubmit, false)
		document.getElementById(tab.id).addEventListener('keydown', formKeyDown, false)

		function formKeyDown(e) {
			if(e.keyCode !== 13) return
			roomSubmit()
		}

		/*	
			roomSubmit

			get form values
			update global nick
			initiate chatroom
		*/
		function roomSubmit() {

			var nick = document.getElementById('formNick').value || 'ziggyClient'
			var server = document.getElementById('formServer').value || 'irc.freenode.net'
			var channel = document.getElementById('formChannel').value || '#testingbot'

			/*
				go back if channel is already open on another tab + send 'alert'
			*/
			if(ziggy.isConnectedToChannel(server, channel)) {
				var alert = {
					message: 'already connected to ' + channel + ' on ' + server,
					flag: 'error'
				}
				renderForm(alert)
				return
			}

			ziggy.setNick(nick)

			tab.switchPlugin('room_tab', {
				mode: 1,
				server: server,
				channel: channel
			})
		}
	}
}