import { getIO } from '../../socket.js'
import { getSubmitter } from '../../server.js'

const sendUploadMsg = (instrumentId, metadata, cmd) => {
  const submitter = getSubmitter()
  const { socketId } = submitter.state.get(instrumentId)

  if (!socketId) {
    return console.log('Error: Cannot send upload command. Client disconnected')
  }
  getIO().to(socketId).emit(cmd, JSON.stringify(metadata))
}

export default sendUploadMsg
