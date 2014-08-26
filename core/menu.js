var Handlebars = require('handlebars')

/*
	tab handler 'UI'
*/

module.exports = function() {

	var document = this.ziggy.dom

	var template = Handlebars.compile(document.getElementById('menu_template').innerHTML)

	document.getElementById('MENU').innerHTML = template({openTabs: this.openTabs})

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

	onClick('[tab]', tabClick.bind(this))
	onClick('[add]', addTab.bind(this))

}