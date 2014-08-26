var EE = require('events').EventEmitter

/*
	tab manager
	simple view manager

	todo:
	- add event emitters (focus / blur)
*/

tabManager = {}

tabManager.init = function(tabs, ziggy) {

	this.ziggy = ziggy
	this.tabs = {}
	this.openTabs = []

	for(var i=0; i<tabs.length; i++) {
		this.register(tabs[i])
	}
}

tabManager.register = function(tab) {

	this.tabs[tab.name] = tab.src
}

/*
	creates tab instance
*/
tabManager.open = function(name) {

	// if tab doesn't exist
	if(!this.tabs[name]) return

	// assemble tab
	var tab = {
		src: new this.tabs[name](this.ziggy),
		focus: false,
		id: Math.random()
	}

	this.openTabs.push(tab)
	this.setFocus(tab)

	return tab
}

/*
	get openTab by @id
*/
tabManager.getById = function(id) {

	for(var i=0; i<this.openTabs.length; i++) {
		if(this.openTabs[i].id === id) return tab
	}
}

/*
	set @tab focus to true
	set all other tabs to false
*/
tabManager.setFocus = function(tab) {

	for(var i=0; i<this.openTabs.length; i++) {
		if(this.openTabs[i] === tab) this.openTabs[i].focus = true
		else this.openTabs[i].focus = false
	}
}

module.exports = tabManager