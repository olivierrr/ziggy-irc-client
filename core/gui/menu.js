var rivets = window.rivets

var fs = require('fs')
,	path = require("path")

/*
	tab handler view
*/

module.exports = function(tabHandler, document) {

	//temp
	function ooo() {
		var arr = []
		for(var i in tabHandler.tabs) {
			arr.push(tabHandler.tabs[i])
		}
		return arr
	}

	var tabs = ooo()

	fs.readFile(path.join(__dirname, 'test.html'), 'utf8', function(err, html) {
		if(err) throw err
		else render(html)
	})

	function render(html) {

		document.getElementById('MENU').innerHTML = html

		var o = rivets.bind(document.getElementById('menu'), {
			tabs: tabs,
			controller: {
				newTab: newTab,
				focusTab: focusTab,
				closeTab: closeTab,
				openSettings: openSettings
			}
		})

		function focusTab(event, obj) {
			tabHandler.setFocus(obj.tab.id)
			tabHandler.updateMenu()
		}
		function newTab() {
			tabHandler.open(tabHandler.plugins['form'])
			tabHandler.updateMenu()
		}
		function closeTab(event, obj) {
			tabHandler.close(obj.tab.id)
			tabHandler.updateMenu()
		}
		function openSettings() {
			tabHandler.open(tabHandler.plugins['settings'])
			tabHandler.updateMenu()
		}
	}
}