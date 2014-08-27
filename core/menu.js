var Handlebars = require('handlebars')

/*
	tab handler 'UI'
*/

module.exports = function() {

	var document = this.ziggy.dom

	var template = Handlebars.compile(document.getElementById('menu_template').innerHTML)

	var context = { openTabs: this.openTabs }

	document.getElementById('MENU').innerHTML = template(context)

	function onClick(query, cb){
		var elem = document.querySelectorAll(query)
		for(var i=0; i<elem.length; i++){
			elem[i].addEventListener('click', cb)
		}
	}

	function tabClick(e) {
		var id = e.target.getAttribute('tab')
		this.setFocus(id)
	}

	function addTab(e) {
		this.open('room_tab')
		this.updateMenu()
	}

	function tabClose(e) {
		var id = e.target.getAttribute('closeTab')
		this.close(id)
		this.updateMenu()
	}

	onClick('[closeTab]', tabClose.bind(this))
	onClick('[tab]', tabClick.bind(this))
	onClick('[add]', addTab.bind(this))

}