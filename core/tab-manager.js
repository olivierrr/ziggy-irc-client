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

	this.plugins.forEach(function(plugin) {
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

	var id = getRandomString()

	var tabHandler = this

	// assemble tab
	var tab = {
		name: pluginName,
		pluginName: pluginName,
		focus: false,
		id: id,
		notifications: 0,
		setStorage: function(data) {
			tabHandler.storage.setItem(pluginName, JSON.stringify(data))
		},
		getStorage: function() {
			var storage = JSON.parse(tabHandler.storage.getItem(pluginName)) || {}
			return storage
		},
		setName: function(name) {
			this.name = name
			tabHandler.updateMenu()
		},
		setNotification: function(number) {
			this.notifications += number || 1
			tabHandler.updateMenu()
		},
		clearNotifications: function() {
			this.notifications = 0
			tabHandler.updateMenu()
		},
		switchPlugin: function(pluginName, arg) {

			// should probably close tab if plugin requested doesn't exist
			if(!tabHandler.plugins[pluginName]) return

			// emit close events
			tabHandler.ee.emit('close', this.id)
			tabHandler.ee.emit('close#'+this.id)

			// start up new plugin
			this.name = pluginName
			this.pluginName = pluginName
			this.src = tabHandler.plugins[pluginName].call(null, tabHandler, this, arg)
		}
	}

	// clear notifications on focus
	this.ee.on('focus#'+tab.id, function() {
		tab.clearNotifications()
	})

	tab.src = this.plugins[pluginName].call(null, tabHandler, tab, arg) /*tabHandler, tabInstante, argument*/

	// add instance to openTabs array
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

function getRandomString() {
	var text = ''
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

    for( var i=0; i < 20; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text;
}

module.exports = tabManager