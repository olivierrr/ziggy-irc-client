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

	var subTabs = function(focus) {
		return Object.keys(tabHandler.plugins).map(function(name, i) {
			return {
				name: name,
				focus: focus === name ? true:false
			}
		})
	}

	var focus = Object.keys(tabHandler.plugins)[0]

	function getContext() {

		var storage
		if(tabHandler.storage.getItem(focus) == 'undefined') storage = null
		else storage = JSON.parse(tabHandler.storage.getItem(focus)) || null

		return {
			id: tab.id,
			settings: storage,
			subTabs: subTabs(focus)
		}
	}

	function render() {
		var context = getContext()
		document.getElementById('TAB').innerHTML = view(context)

		onClick('[settingsSubtab]', function handleClick(e) {
			focus = e.target.getAttribute('settingsSubtab')
			render()
		})

		onClick('[settingsSave]', function handleSave(e) {
			
		})
	}
}