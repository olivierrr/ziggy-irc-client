var EE = require('events').EventEmitter
var Ziggy_client = require('./ziggy-client')
var menu = require('./gui/menu')

/*
	tab manager
	simple view manager

	tabs are created from registered plugins
*/
tabManager = {}

tabManager.init = function(settings) {

	// events
	this.ee = Object.create(EE.prototype)

	// dom handle
	this.dom = settings.dom

	this.ziggy = Object.create(Ziggy_client)
	this.ziggy.init()

	this.plugins = settings.plugins || {}

	// instantiated tabs
	this.openTabs = []

	// menu is tabManagers 'view'
	this.menu = menu
	this.updateMenu()

	this.registerPlugins()
}

/*
	updateMenu
	renders view
*/
tabManager.updateMenu = function() {
	this.menu(this, this.dom)
}

/*
	registerPlugins
*/
tabManager.registerPlugins = function() {

	var plugins = this.plugins

	this.plugins.forEach(function(plugin) {
		plugins[plugin.name] = plugin.src
	})
}

/*
	creates tab instance
*/
tabManager.open = function(name, arg) {

	// if tab doesn't exist
	if(!this.plugins[name]) return

	var id = Math.random()

	var tabHandler = this

	// assemble tab
	var tab = {
		name: name,
		focus: false,
		id: id,
		notifications: 0,
		setName: function(name) {
			this.name = name
			tabHandler.updateMenu()
		},
		setNotifications: function(number) {
			this.notifications = number
			tabHandler.updateMenu()
		}
	}

	tab.src = this.plugins[name].call(null, this, tab, arg) /*tabHandler, tabInstante, argument*/

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