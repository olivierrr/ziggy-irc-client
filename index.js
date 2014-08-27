// load plugins
var room_tab = require('./plugins/room-tab/index')

// instance
var tabManager = Object.create(require('./core/tab-manager'))

// init
tabManager.init({

	// plugins
	tabs: [{ src: room_tab, name: 'room_tab'}],

	// dom handle
	dom: document

})