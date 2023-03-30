import { getIO } from '../socket.js'
import { getSubmitter } from '../server.js'
import Group from '../models/group.js'
import User from '../models/user.js'
import ManualExperiment from '../models/manualExperiment.js'
import sendUploadCmd from './tracker/sendUploadCmd.js'

export const getFolders = async (req, res) => {
  const { instrumentId } = req.params
  const { showArchived } = req.query

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
    .emit('get-folders', { group: group.groupName }, async (err, response) => {
      try {
        if (response[0] === 'error') {
          throw new Error('Client failed to get folders')
        }
        const folders = await tagArchived(response[0], showArchived)
        res.json({ folders, instrumentId })
      } catch (error) {
        console.log(error)
        res.status(400).send({ message: 'Client failed to fetch manual folders' })
      }
    })
}

export const postClaim = async (req, res) => {
  const { instrumentId, expsArr } = req.body
  const { accessLevel } = req.user

  try {
    let { userId } = req.body
    let groupId

    if (userId) {
      if (accessLevel !== 'admin') {
        return res.status(403).send()
      }
      const user = await User.findById(userId, 'group')
      groupId = user.group
    } else {
      userId = req.user._id
      groupId = req.user.group
    }

    const group = await Group.findById(groupId, 'groupName')

    sendUploadCmd(instrumentId, { userId, group: group.groupName, expsArr }, 'upload-manual')

    res.status(200).json(expsArr)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

//helper function that tags or filters already archived data folders
const tagArchived = async (input, showArchived) => {
  const dataArr = await Promise.all(
    input.map(async entry => {
      const newExps = await Promise.all(
        entry.exps.map(async exp => {
          const dbEntry = await ManualExperiment.findOne({ expId: exp.key })
          if (dbEntry) {
            return { ...exp, archived: true }
          } else {
            return { ...exp, archived: false }
          }
        })
      )
      if (showArchived === 'true') {
        return { ...entry, exps: newExps }
      }
      return { ...entry, exps: newExps.filter(exp => !exp.archived) }
    })
  )

  let output
  if (showArchived === 'true') {
    output = dataArr.map(i => ({ ...i, archived: i.exps.every(exp => exp.archived) }))
  } else {
    output = dataArr.filter(i => i.exps.length > 0)
  }
  return Promise.resolve(output)
}
