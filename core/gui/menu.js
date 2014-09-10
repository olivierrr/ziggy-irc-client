var rivets = window.rivets

var fs = require('fs')
,	path = require("path")

/*
	tab handler view
*/

module.exports = function(tabHandler, document) {

	fs.readFile(path.join(__dirname, 'test.html'), 'utf8', function(err, html) {
		if(err) throw err
		else render(html)
	})

	function genTabsArray() {
		var arr = []
		for(var i in tabHandler.tabs) {
			arr.push(tabHandler.tabs[i])
		}
		return arr
	}

	var model = {tabs: genTabsArray()}

	var controller = function() {
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
		return {
			newTab: newTab,
			focusTab: focusTab,
			closeTab: closeTab,
			openSettings: openSettings
		}
	}

	function render(html) {
		document.getElementById('MENU').innerHTML = html
		var menu = rivets.bind(document.getElementById('menu'), {
			model: model,
			controller: controller()
		})
	}

	return function() {
		model.tabs = genTabsArray()
	}
}