var EE = require('events').EventEmitter
var Ziggy_client = require('./ziggy-client')
var menu = require('./gui/menu')
var Tab = require('./tab')
/*
	tab manager
	simple view manager

	tabs are created from registered plugins
*/
tabManager = {}

tabManager.init = function(settings) {

	// events
	this.ee = Object.create(EE.prototype)

	this.storage = settings.localStorage || {}

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

	// names of registered plugins
	this.pluginNames = []

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
	note: second forEach = dirty fix!
*/
tabManager.registerPlugins = function() {

	var plugins = this.plugins
	var pluginNames = this.pluginNames
	var tabHandler = this

	this.plugins.forEach(function(plugin) {
		pluginNames.push(plugin.name)
		if(plugin.background) plugin.background.call(null, tabHandler)
		plugins[plugin.name] = plugin.src
	})

	this.plugins.forEach(function(plugin) {
		if(plugin.name) delete plugins[plugin]
	})
}

/*
	creates tab instance
*/
tabManager.open = function(pluginName, arg) {

	// if plugin doesn't exist
	if(!this.plugins[pluginName]) return

	return Tab.call(this, pluginName, arg)
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
	get tab by @id
*/
tabManager.getById = function(id) {

	for(var i=0; i<this.openTabs.length; i++) {
		if(this.openTabs[i].id == id) return this.openTabs[i]
	}
}

/*
	blur tabs
	focus tab @id
*/
tabManager.setFocus = function(id) {

	for(var i=0; i<this.openTabs.length; i++) {
		if(this.openTabs[i].focus === true && this.openTabs[i].id !== id) {
			
			this.openTabs[i].focus = false
			this.ee.emit('blur', this.openTabs[i].id)
			this.ee.emit('blur#'+this.openTabs[i].id)
		}
	}

	for(var i=0; i<this.openTabs.length; i++) {
		if(this.openTabs[i].id === id && this.openTabs[i].focus !== true) {

			this.openTabs[i].focus = true
			this.ee.emit('focus', this.openTabs[i].id)
			this.ee.emit('focus#'+this.openTabs[i].id)
		}
	}
}

module.exports = tabManager