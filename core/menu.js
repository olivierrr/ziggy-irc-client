var Handlebars = require('handlebars')

var view = require('./view')

/*
	tab handler view
*/

module.exports = function(tabHandler, document) {

	var template = view

	var context = { openTabs: tabHandler.openTabs }

	document.getElementById('MENU').innerHTML = template(context)

	function onClick(query, cb){
		var elem = document.querySelectorAll(query)
		for(var i=0; i<elem.length; i++){
			elem[i].addEventListener('click', cb)
		}
	}

	function tabClick(e) {
		var id = e.target.getAttribute('tab')
		tabHandler.setFocus(id)
		tabHandler.updateMenu()
	}

	function addTab(e) {
		tabHandler.open('room_tab')
		tabHandler.updateMenu()
	}

	function tabClose(e) {
		var id = e.target.getAttribute('closeTab')
		tabHandler.close(id)
		tabHandler.updateMenu()
	}

	onClick('[closeTab]', tabClose)
	onClick('[tab]', tabClick)
	onClick('[add]', addTab)
}