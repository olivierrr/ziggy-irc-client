var Ziggy_client = require('./core/ziggy-client')

var room_tab = require('./core/room-tab')

// instance
var ziggy_client = Object.create(Ziggy_client)

ziggy_client.init({

	// regular ziggyplugins applied globablly (all rooms)
	plugins: [],

	// ui plugins, [0] is opened by default
	tabs: [{ src: room_tab,
			 name: 'rom_tab'}]
})

//debug
console.log(ziggy_client)