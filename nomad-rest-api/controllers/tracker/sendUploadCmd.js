const io = require('../../socket')
const server = require('../../server')

const sendUploadMsg = (instrumentId, metadata) => {
  const submitter = server.getSubmitter()
  const { socketId } = submitter.state.get(instrumentId)

  if (!socketId) {
    return console.log('Error: Cannot send upload command. Client disconnected')
  }
  io.getIO().to(socketId).emit('upload', JSON.stringify(metadata))
}

module.exports = sendUploadMsg
