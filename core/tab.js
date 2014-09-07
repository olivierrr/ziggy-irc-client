module.exports = Tab = function(plugin, tabHandler, arg) {

	this.tabHandler = tabHandler
	this.name = plugin.name
	this.plugin = plugin.name
	this.focus = false
	this.storage = this.getStorage()
	this.id = getRandomString()
	this.notifications = 0

	// exec plugin script
	this.src = plugin.src.call(null, this.tabHandler, this, arg) /*tabHandler, tabInstance, argument*/

	// clear notifications on focus
	this.tabHandler.ee.on('focus#'+this.id, this.clearNotifications.bind(this))
}

Tab.prototype.setStorage = function(data) {
	this.tabHandler.storage.setStorage(this.plugin, data)
}

Tab.prototype.getStorage = function() {
	return this.tabHandler.storage.getStorage(this.plugin)
}

Tab.prototype.updateStorage = function(callback) {
	this.storage = this.tabHandler.storage.updateStorage(this.plugin, callback)
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

Tab.prototype.switchPlugin = function(plugin, arg) {

	// emit close events
	this.tabHandler.ee.emit('close', this.id)
	this.tabHandler.ee.emit('close#'+this.id)

	// start up new plugin
	this.name = plugin.name
	this.plugin = plugin.name

	// update storage namespace
	this.storage = this.getStorage()

	// execute new plugin script
	this.src = plugin.src.call(null, this.tabHandler, this, arg)
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