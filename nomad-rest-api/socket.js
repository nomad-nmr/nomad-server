//Initialization of socket.io
import { Server } from 'socket.io'

let io

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONT_HOST_URL,
      methods: ['GET', 'POST']
    }
  })
  console.log(io)
  return io
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!')
  }
  return io
}
