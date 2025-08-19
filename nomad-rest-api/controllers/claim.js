import moment from 'moment'

import { getIO } from '../socket.js'
import { getSubmitter } from '../server.js'
import Group from '../models/group.js'
import User from '../models/user.js'
import Instrument from '../models/instrument.js'
import ManualExperiment from '../models/manualExperiment.js'
import Claim from '../models/claim.js'
import sendUploadCmd from './tracker/sendUploadCmd.js'
import { getGrantInfo } from '../utils/accountsUtils.js'

export const getFolders = async (req, res) => {
  const { instrumentId } = req.params
  const { showArchived } = req.query

  const groupId = req.query.groupId === 'undefined' ? req.user.group : req.query.groupId
  const group = await Group.findById(groupId)
  const submitter = getSubmitter()
  const { socketId } = submitter.state.get(instrumentId)
  if (!socketId) {
    console.log('Error: Client disconnected')
    return res.status(503).send({ message: 'Client disconnected' })
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
  const { instrumentId, expsArr, claimId, note, expTime } = req.body
  const { accessLevel } = req.user

  try {
    let { userId } = req.body
    let groupId

    if (userId && userId !== 'undefined') {
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

    const folders = new Set()
    expsArr.forEach(exp => {
      folders.add(exp.split('#-#')[0])
    })

    const claim = new Claim({
      instrument: instrumentId,
      user: userId,
      group: groupId,
      folders: Array.from(folders),
      note,
      expTime
    })

    await claim.save()

    sendUploadCmd(
      instrumentId,
      { userId, group: group.groupName, expsArr, claimId },
      'upload-manual'
    )

    res.status(200).json(expsArr)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getClaims = async (req, res) => {
  const { showApproved, dateRange, currentPage, pageSize } = req.query

  try {
    const searchParams = { $and: [{}] }

    if (showApproved === 'false') {
      searchParams.$and.push({ status: 'Pending' })
    }

    if (dateRange && dateRange !== 'undefined') {
      const datesArr = dateRange.split(',')
      searchParams.$and.push({
        createdAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })
    }

    const total = await Claim.find(searchParams).countDocuments()
    const claims = await Claim.find(searchParams)
      .skip((currentPage - 1) * pageSize)
      .limit(+pageSize)
      .populate('instrument', 'name')
      .populate('user', ['fullName', 'username'])
      .populate('group', 'groupName')
    res
      .status(200)
      .json({ claims: claims.map(claim => ({ ...claim._doc, key: claim._id })), total })
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const patchClaims = async (req, res) => {
  const { claimId, expTime } = req.body
  try {
    const claim = await Claim.findByIdAndUpdate(claimId, { expTime })
    res.status(200).json({ key: claim._id, expTime: claim.expTime })
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const approveClaims = async (req, res) => {
  try {
    const respArray = []
    await Promise.all(
      req.body.map(async id => {
        const claim = await Claim.findById(id)
        const instrument = await Instrument.findById(claim.instrument, 'cost')

        claim.status = 'Approved'

        const grant = await getGrantInfo(claim.user, claim.group)
        if (grant) {
          const { grantId, multiplier } = grant

          claim.grantCosting = {
            grantId,
            cost: +claim.expTime * instrument.cost * multiplier
          }
        }

        await claim.save()
        respArray.push(claim._id)
      })
    )
    res.status(200).json(respArray)
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
