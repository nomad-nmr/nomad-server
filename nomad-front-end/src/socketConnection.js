import { io } from 'socket.io-client'

const socket = io(
  process.env.NODE_ENV === 'production' ? window.location.hostname : process.env.REACT_APP_API_URL
)

export default socket
