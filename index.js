// plugins
var room_tab = require('./plugins/room-tab/index')
var connectForm_tab = require('./plugins/connectForm-tab/index')

// instance
var tabManager = Object.create(require('./core/tab-manager'))

// init
tabManager.init({

	// plugins
	plugins: [room_tab, connectForm_tab],

	// dom handle
	dom: document

})