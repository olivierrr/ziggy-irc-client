var Handlebars = require('handlebars')

var view = require('./view')

/*
	tab handler view
*/

module.exports = function(tabHandler, document) {

	document.getElementById('MENU').innerHTML = view({ openTabs: tabHandler.openTabs })

	// binds function to elems click event
	function onClick(query, cb){
		var elem = document.querySelectorAll(query)
		for(var i=0; i<elem.length; i++){
			elem[i].addEventListener('click', cb)
		}
	}

	function focusTab(e) {
		var id = e.target.getAttribute('tab')
		tabHandler.setFocus(id)
		tabHandler.updateMenu()
	}

	function newTab(e) {
		tabHandler.open('form', {mode:0})
		tabHandler.updateMenu()
	}

	function closeTab(e) {
		var id = e.target.getAttribute('closeTab')
		tabHandler.close(id)
		tabHandler.updateMenu()
	}

	onClick('[closeTab]', closeTab)
	onClick('[tab]', focusTab)
	onClick('[add]', newTab)
}