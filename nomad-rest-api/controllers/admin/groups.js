import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import BcryptSalt from 'bcrypt-salt'

import Group from '../../models/group.js'
import User from '../../models/user.js'

export async function getGroups(req, res) {
  //setting search parameters according to showInactive settings
  const searchParams = { isActive: true }
  if (req.query.showInactive === 'true') {
    delete searchParams.isActive
  }

  try {
    const groups = await Group.find(searchParams).sort({ groupName: 'asc' })
    if (!groups) {
      return res.status(404).send()
    }

    if (req.query.list === 'true') {
      const groupList = groups.map(grp => {
        return { name: grp.groupName, id: grp._id, isBatch: grp.isBatch, isActive: grp.isActive }
      })
      return res.send(groupList)
    }

    //Calculation of numbers of users in each group
    const resGroups = await Promise.all(
      groups.map(async grp => {
        const usersCounts = await grp.getUserCounts()
        return { ...grp._doc, ...usersCounts }
      })
    )

    res.send(resGroups)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export async function addGroup(req, res) {
  const { groupName, description, isBatch } = req.body
  const errors = validationResult(req)
  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }
    const group = new Group({ groupName: groupName.toLowerCase(), description, isBatch })
    const newGroup = await group.save()
    res.status(201).json(newGroup)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export async function updateGroup(req, res) {
  try {
    const group = await Group.findByIdAndUpdate(req.body._id, req.body)
    if (!group) {
      return res.status(404).send()
    }

    if (!group.isActive) {
      group.setUsersInactive()
    }

    //UpdateBatchUsers is a method that updates accessLevel according to group batch-submit status
    group.updateBatchUsers()

    const usersCounts = await group.getUserCounts()
    res.send({ ...group._doc, ...usersCounts })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
}

export async function toggleActive(req, res) {
  try {
    const group = await Group.findById(req.params.groupId)
    if (!group) {
      return res.status(404).send()
    }

    group.isActive = !group.isActive

    if (!group.isActive) {
      group.setUsersInactive()
    }

    const updatedGroup = await group.save()
    res
      .status(200)
      .send({ message: 'Group active status updated successfully', _id: updatedGroup._id })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
}

export async function addUsers(req, res) {
  const { groupId } = req.params
  try {
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).send()
    }

    let total = 0
    let newUsers = 0
    let rejected = 0

    await Promise.all(
      req.body.map(async username => {
        if (username.length > 0) {
          const user = await User.findOne({ username })

          //Rejecting users that are already in the group
          if (user && user.group.toString() === groupId) {
            rejected++
            return
          }
          total++
          if (user) {
            const oldGroupId = user.group
            const oldGroup = await Group.findById(oldGroupId)

            user.group = group._id
            user.accessLevel = group.isBatch ? 'user-b' : 'user'
            user.isActive = group.isActive ? true : false
            await user.save()

            //adding userId in the exUsers array after moving to a new group
            const exUsersSet = new Set(oldGroup.exUsers)
            exUsersSet.add(user._id)
            oldGroup.exUsers = Array.from(exUsersSet)
            await oldGroup.save()
          } else {
            const bs = new BcryptSalt()
            const hashedPasswd = await bcrypt.hash(Math.random().toString(), bs.saltRounds)
            const newUserObj = {
              username: username.toLowerCase(),
              password: hashedPasswd,
              email: username + '@' + process.env.EMAIL_SUFFIX,
              accessLevel: group.isBatch ? 'user-b' : 'user',
              group: group._id,
              isActive: group.isActive ? true : false
            }
            newUsers++
            const user = new User(newUserObj)
            await user.save()
          }
        }
      })
    )

    res.send({ rejected, newUsers, total })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
  res.send()
}
