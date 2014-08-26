var EE = require('events').EventEmitter

/*
	tab manager
	simple view manager

	todo:
	- add event emitters (focus / blur)
*/

tabManager = {}

tabManager.init = function(tabs) {

	this.tabs = {}
	this.openTabs = []

	for(var i=0; i<tabs.length; i++) {
		this.register(tabs[i])
	}
}

tabManager.register = function(tab) {

	this.tabs[tab.name] = tab.src
}

tabManager.open = function(name) {

	// assemble tab
	var tab = {
		script: this.tabs[name],
		isFocus: false,
		id: Math.random()
	}

	this.openTabs.push(tab)
	return tab
}

// find a tab by id
tabManager.getById = function(id) {

	this.openTabs.forEach(function(tab) {
		if(tab.id === id) return tab
	})
}

// set focus
tabManager.setFocus = function(tab) {

	this.openTabs.forEach(function(t) {
		if(t === tab) t.isFocus = true
		else t.isFocus = false
	})
}

module.exports = tabManager