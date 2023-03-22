import { getIO } from '../socket.js'
import { getSubmitter } from '../server.js'
import Group from '../models/group.js'

export const getFolders = async (req, res) => {
  const { instrumentId } = req.params
  const groupId = req.query.groupId === 'undefined' ? req.user.group : req.query.groupId

  const group = await Group.findById(groupId)

  const submitter = getSubmitter()
  const { socketId } = submitter.state.get(instrumentId)

  if (!socketId) {
    console.log('Error: Client disconnected')
    return res.status(503).send('Client disconnected')
  }

  getIO()
    .to(socketId)
    .timeout(10000)
    .emit('get-folders', { group: group.groupName }, (err, response) => {
      try {
        if (response[0] === 'error') {
          throw new Error('Client failed to get folders')
        }
        res.json(response[0])
      } catch (error) {
        console.log(error)
        res.status(400).send({ message: 'Claient failed to fetch manual folders' })
      }
    })
}
