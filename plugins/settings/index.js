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

	// binds function to elems click event
	function onClick(query, cb){
		var elem = document.querySelectorAll(query)
		for(var i=0; i<elem.length; i++){
			elem[i].addEventListener('click', cb)
		}
	}

	//

	var focus = tabHandler.pluginNames[0] || null

	function getContext() {

		var storage
		if(tabHandler.storage.getItem(focus) == 'undefined') storage = null
		else storage = JSON.parse(tabHandler.storage.getItem(focus)) || null

		return {
			id: tab.id,
			settings: storage,
			subTabs: tabHandler.pluginNames,
		}
	}

	function render() {
		var context = getContext()
		document.getElementById('TAB').innerHTML = view(context)

		onClick('[settingsSubtab]', function handleClick(e) {
			focus = e.target.getAttribute('settingsSubtab')
			render()
		})
	}
}