
module.exports = function(pluginName, arg) {

	var id = getRandomString()

	var tabHandler = this

	// assemble tab
	var tab = {
		name: pluginName,
		pluginName: pluginName,
		focus: false,
		storage: null,
		id: id,
		notifications: 0,
		setStorage: function(data) {
			tabHandler.storage.setItem(pluginName, JSON.stringify(data))
		},
		getStorage: function() {
			var storage
			if(tabHandler.storage.getItem(pluginName) == 'undefined') storage = {}
			else storage = JSON.parse(tabHandler.storage.getItem(pluginName)) || {}
			return storage
		},
		updateStorage: function(cb){
			var storage = this.getStorage()
			var updatedStorage = cb(storage)
			this.setStorage(updatedStorage)
			this.storage = this.getStorage()
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

	tab.storage = tab.getStorage()
	tab.src = this.plugins[pluginName].call(null, tabHandler, tab, arg) /*tabHandler, tabInstante, argument*/

	// add instance to tabs
	this.tabs[tab.id] = tab

	this.setFocus(tab.id)

	return tab
}

function getRandomString() {
	var text = ''
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

    for( var i=0; i < 20; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text;
}