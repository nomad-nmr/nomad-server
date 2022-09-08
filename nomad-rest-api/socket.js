//Initialization of socket.io

let io

module.exports = {
	init: httpServer => {
		io = require('socket.io')(httpServer, {
			cors: {
				origin: process.env.FRONT_HOST_URL,
				methods: ['GET', 'POST']
			}
		})
		return io
	},
	getIO: () => {
		if (!io) {
			throw new Error('Socket.io not initialized!')
		}
		return io
	}
}
