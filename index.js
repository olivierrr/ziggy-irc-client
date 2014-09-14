// plugins
var chatroom = require('./plugins/chatroom/index')
var form = require('./plugins/form/index')
var settings = require('./plugins/settings/index')

var shell = require('nw.gui')

// instance
var tabManager = Object.create(require('./core/tab-manager'))

// init
tabManager.init({

	// plugins
	plugins: [chatroom, form, settings],

	// dom handle
	dom: document,

	// local storage reference
	localStorage: localStorage,

	// shell API reference
	shell: shell

})