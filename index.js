// load plugins
var room_tab = require('./plugins/room-tab/index')

var tabManager = require('./core/tab-manager')

// instance
var tabManager = Object.create(tabManager)

tabManager.init({

	tabs: [{ src: room_tab, name: 'room_tab'}],

	dom: document

})