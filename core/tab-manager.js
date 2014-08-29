var EE = require('events').EventEmitter
var Ziggy_client = require('./ziggy-client')
var menu = require('./gui/menu')

/*
	tab manager
	simple view manager

	todo:
*/
tabManager = {}

tabManager.init = function(settings) {

	this.ee = Object.create(EE.prototype)
	this.dom = settings.dom

	this.ziggy = Object.create(Ziggy_client)
	this.ziggy.init()

	this.tabs = settings.tabs || {}
	this.openTabs = []
	this.menu = menu

	this.updateMenu()

	for(var i=0; i<this.tabs.length; i++) {
		this.register(this.tabs[i])
	}
}

tabManager.updateMenu = function() {
	this.menu(this, this.dom)
}

tabManager.register = function(tab) {
	this.tabs[tab.name] = tab.src
}

/*
	creates tab instance
*/
tabManager.open = function(name, arg) {

	// if tab doesn't exist
	if(!this.tabs[name]) return

	var id = Math.random()

	// assemble tab
	var tab = {
		name: name,
		focus: false,
		id: id,
		notifications: 0
	}

	tab.src = this.tabs[name].call(null, this, tab, arg) /*tabHandler, tabInstante, argument*/

	this.openTabs.push(tab)
	this.setFocus(tab.id)

	return tab
}

/*
	close tab instance
	emit tab close events
*/
tabManager.close = function(id) {

	var tab = this.getById(id)
	var index = this.openTabs.indexOf(tab)

	this.ee.emit('close', id)
	this.ee.emit('close#'+id)

	this.openTabs.splice(index, 1)
}

/*
	get openTab by @id
*/
tabManager.getById = function(id) {

	for(var i=0; i<this.openTabs.length; i++) {
		if(this.openTabs[i].id == id) return this.openTabs[i]
	}
}

/*
	set @tab focus to true
	set all other tabs to false
	emit focus/blur events
*/
tabManager.setFocus = function(id) {

	for(var i=0; i<this.openTabs.length; i++) {
		if(this.openTabs[i].id == id) {

			this.openTabs[i].focus = true
			this.ee.emit('focus', this.openTabs[i].id)
			this.ee.emit('focus#'+this.openTabs[i].id)
		}
		else {

			this.openTabs[i].focus = false
			this.ee.emit('blur', this.openTabs[i].id)
			this.ee.emit('blur#'+this.openTabs[i].id)
		}
	}
}

module.exports = tabManager