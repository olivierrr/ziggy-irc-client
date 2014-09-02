// plugins
var chatroom = require('./plugins/chatroom/index')
var form = require('./plugins/form/index')

// instance
var tabManager = Object.create(require('./core/tab-manager'))

// init
tabManager.init({

	// plugins
	plugins: [chatroom, form],

	// dom handle
	dom: document

})