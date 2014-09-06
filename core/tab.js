module.exports = Tab = function(pluginName, tabHandler, arg) {

	this.tabHandler = tabHandler
	this.name = pluginName
	this.plugin = pluginName
	this.focus = false
	this.storage = this.getStorage()
	this.id = getRandomString()
	this.notifications = 0

	// exec plugin script
	this.src = this.tabHandler.plugins[pluginName].call(null, this.tabHandler, this, arg) /*tabHandler, tabInstance, argument*/

	// clear notifications on focus
	this.tabHandler.ee.on('focus#'+this.id, this.clearNotifications.bind(this))
}

Tab.prototype.setStorage = function(data) {
	this.tabHandler.storage.setItem(this.plugin, JSON.stringify(data))
}

Tab.prototype.getStorage = function() {
	var storage
	if(this.tabHandler.storage.getItem(this.plugin) == 'undefined') storage = {}
	else storage = JSON.parse(this.tabHandler.storage.getItem(this.plugin)) || {}
	return storage
}

Tab.prototype.updateStorage = function(callback) {
	var updatedStorage = callback(this.getStorage())
	this.setStorage(updatedStorage)
	this.storage = this.getStorage()
}

Tab.prototype.setName = function(name) {
	this.name = name
	this.tabHandler.updateMenu()	
}

Tab.prototype.setNotification = function(number) {
	this.notifications += number || 1
	this.tabHandler.updateMenu()
}

Tab.prototype.clearNotifications = function() {
	this.notifications = 0
	this.tabHandler.updateMenu()
}

Tab.prototype.switchPlugin = function(pluginName, arg) {

	// should probably close tab if plugin requested doesn't exist
	if(!this.tabHandler.plugins[pluginName]) return

	// emit close events
	this.tabHandler.ee.emit('close', this.id)
	this.tabHandler.ee.emit('close#'+this.id)

	// start up new plugin
	this.name = pluginName
	this.plugin = pluginName

	// update storage namespace
	this.storage = this.getStorage()

	// execute new plugin script
	this.src = this.tabHandler.plugins[pluginName].call(null, this.tabHandler, this, arg)
}

// Util
function getRandomString() {
	var text = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    for(var i=0; i<20; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}