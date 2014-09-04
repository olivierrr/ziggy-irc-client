var Handlebars = require('handlebars')
var view = require('./view')

/*
	settings plugin
*/

module.exports.name = 'settings'

module.exports.src = function(tabHandler, tab, arg) {

	var document = tabHandler.dom
	var ziggy = tabHandler.ziggy

	tabHandler.ee.on('focus#'+tab.id, render)
	tabHandler.ee.on('close#'+tab.id, function() {
		document.getElementById('TAB').innerHTML = ''
	})
	tabHandler.ee.on('blur#'+tab.id, function() {
		document.getElementById('TAB').innerHTML = ''
	})

	function render() {
		document.getElementById('TAB').innerHTML = view({id: tab.id})
	}
}