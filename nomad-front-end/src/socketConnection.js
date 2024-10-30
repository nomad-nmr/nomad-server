import { io } from 'socket.io-client'

const socket = io(
  import.meta.env.PROD ? window.location.hostname : import.meta.env.VITE_SOCKETS_URL
)

export default socket
