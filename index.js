var Ziggy_client = require('./core/ziggy-client')

var room_tab = require('./core/room-tab')
var menu = require('./core/menu')

// instance
var ziggy_client = Object.create(Ziggy_client)

ziggy_client.init({

	// regular ziggyplugins applied globablly (all rooms)
	plugins: [],

	// ui plugins, [0] is opened by default
	tabs: [{ src: room_tab,
			 name: 'room_tab'}],

	menu: menu,

	dom: document

})

//debug
console.log(ziggy_client)