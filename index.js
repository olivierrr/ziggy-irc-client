// plugins
var chatroom = require('./plugins/chatroom/index')
var connectForm_tab = require('./plugins/connectForm-tab/index')

// instance
var tabManager = Object.create(require('./core/tab-manager'))

// init
tabManager.init({

	// plugins
	plugins: [chatroom, connectForm_tab],

	// dom handle
	dom: document

})