var EE = require('events').EventEmitter
var Ziggy_client = require('./ziggy-client')
var menu = require('./gui/menu')
var Tab = require('./tab')
var storageHandler = require('./storage-handler')

/*
	tab manager
	simple view manager

	tabs are created from registered plugins
*/
tabManager = {}

tabManager.init = function(settings) {

	// event emitter
	this.ee = Object.create(EE.prototype)

	this.storage = storageHandler(settings.localStorage)

	// dom handle
	this.dom = settings.dom

	this.shell = settings.shell

	this.ziggy = Object.create(Ziggy_client)
	this.ziggy.init()

	this.plugins = {}

	// register plugins
	for(var i=0; i<settings.plugins.length; i++) {
		if(settings.plugins[i].background) settings.plugins[i].background.call(null, this)
		this.plugins[settings.plugins[i].name] = settings.plugins[i]
	}

	// instantiated tabs
	this.tabs = {}

	// menu is tabManagers 'view'
	this.menu = menu(this,this.dom)
}

/*
	updateMenu
	renders view
*/
tabManager.updateMenu = function() {
	this.menu()
}

/*
	creates tab instance
*/
tabManager.open = function(plugin, arg) {

	var newTab = new Tab(plugin, this, arg)

	this.tabs[newTab.id] = newTab

	this.setFocus(newTab.id)

	return newTab
}

/*
	close tab instance
	emit tab close events
*/
tabManager.close = function(id) {

	if(!this.tabs[id]) return

	this.ee.emit('close', id)
	this.ee.emit('close#'+id)

	delete this.tabs[id]
}

/*
	blur tabs
	focus tab @id
*/
tabManager.setFocus = function(id) {

	for(var tab in this.tabs) {
		if(this.tabs[tab].focus === true && this.tabs[tab].id !== id) {
			this.tabs[tab].focus = false
			this.ee.emit('blur', this.tabs[tab].id)
			this.ee.emit('blur#'+this.tabs[tab].id)
		}
	}

	for(var tab in this.tabs) {
		if(this.tabs[tab].id === id && this.tabs[tab].focus !== true) {
			this.tabs[tab].focus = true
			this.ee.emit('focus', this.tabs[tab].id)
			this.ee.emit('focus#'+this.tabs[tab].id)
		}
	}
}

module.exports = tabManager