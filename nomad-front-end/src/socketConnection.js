import { io } from 'socket.io-client'

const socket = io(
  import.meta.env.NODE_ENV === 'production'
    ? window.location.hostname
    : import.meta.env.VITE_API_URL
)

export default socket
