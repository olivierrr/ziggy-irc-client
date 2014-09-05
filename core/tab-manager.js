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
	this.openTabs = {}

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

	if(!this.plugins[pluginName]) return

	// tab constructor
	return Tab.call(this, pluginName, arg)
}

/*
	close tab instance
	emit tab close events
*/
tabManager.close = function(id) {

	if(!this.openTabs[id]) return

	this.ee.emit('close', id)
	this.ee.emit('close#'+id)

	delete this.openTabs[id]
}

/*
	blur tabs
	focus tab @id
*/
tabManager.setFocus = function(id) {

	var openTabs = this.openTabs

	for(var tab in openTabs) {
		if(openTabs[tab].focus === true && openTabs[tab].id !== id) {
			openTabs[tab].focus = false
			this.ee.emit('blur', openTabs[tab].id)
			this.ee.emit('blur#'+openTabs[tab].id)
		}
	}

	for(var tab in openTabs) {
		if(openTabs[tab].id === id && openTabs[tab].focus !== true) {
			openTabs[tab].focus = true
			this.ee.emit('focus', openTabs[tab].id)
			this.ee.emit('focus#'+openTabs[tab].id)
		}
	}
}

module.exports = tabManager