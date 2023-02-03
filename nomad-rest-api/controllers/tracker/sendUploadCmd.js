import { getIO } from '../../socket.js'
import { getSubmitter } from '../../server.js'

const sendUploadMsg = (instrumentId, metadata) => {
  const submitter = getSubmitter()
  const { socketId } = submitter.state.get(instrumentId)

  if (!socketId) {
    return console.log('Error: Cannot send upload command. Client disconnected')
  }
  getIO().to(socketId).emit('upload', JSON.stringify(metadata))
}

export default sendUploadMsg
