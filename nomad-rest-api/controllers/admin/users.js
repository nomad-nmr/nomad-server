import bcrypt from 'bcryptjs'
import BcryptSalt from 'bcrypt-salt'
import { validationResult } from 'express-validator'
import moment from 'moment'

import User from '../../models/user.js'
import Group from '../../models/group.js'
import Experiment from '../../models/experiment.js'

export async function getUsers(req, res) {
  //setting search parameters according to showInactive settings
  const { showInactive, pageSize, current, accessLevel, group, username, lastLoginOrder } =
    req.query

  const searchParams = { $and: [{}] }

  if (showInactive === 'false') {
    searchParams.$and.push({ isActive: true })
  }

  if (accessLevel && accessLevel !== 'null') {
    const accessLevelArr = accessLevel.split(',')
    searchParams.$and.push({ $or: accessLevelArr.map(i => ({ accessLevel: i })) })
  }

  if (group && group !== 'null') {
    const groupArr = group.split(',')
    searchParams.$and.push({ $or: groupArr.map(i => ({ group: i })) })
  }

  if (username) {
    // file deepcode ignore reDOS: <suggested fix using lodash does not seem to work>
    const regex = new RegExp(username, 'i')

    searchParams.$and.push({
      $or: [{ username: { $regex: regex } }, { fullName: { $regex: regex } }]
    })
  }

  const sorter =
    lastLoginOrder === 'ascend'
      ? { lastLogin: 'ascending' }
      : lastLoginOrder === 'descend'
      ? { lastLogin: 'descending' }
      : { username: 'ascending' }

  try {
    //Generating user list for drop down select
    if (req.query.list === 'true') {
      if (req.query.search !== 'true' || req.query.showInactive !== 'true') {
        const userList = await User.find(
          { ...searchParams, isActive: true },
          'username fullName'
        ).sort({
          username: 'asc'
        })

        return res.send(userList)
      } else {
        //for search user select with inactive switch on we return combined list of inactive an ex users from the group
        const onlyInactiveUsrList = await User.find(
          { ...searchParams, isActive: false },
          'username fullName'
        )
        const group = await Group.findById(req.query.group, 'exUsers').populate(
          'exUsers',
          'username fullName'
        )

        group.exUsers.forEach(usr => {
          const onList = onlyInactiveUsrList.find(i => i.username === usr.username)
          if (!onList) {
            onlyInactiveUsrList.push(usr)
          }
        })

        const sortedUsrList = onlyInactiveUsrList.sort((a, b) => {
          if (a.username < b.username) {
            return -1
          }
          if (a.username > b.username) {
            return 1
          }
          return 0
        })
        return res.send(sortedUsrList)
      }
    }

    const total = await User.find(searchParams).countDocuments()
    const users = await User.find(searchParams, '-tokens -password')
      .skip((current - 1) * pageSize)
      .limit(+pageSize)
      .sort(sorter)
      .populate('group', 'groupName')

    if (!users) {
      return res.status(404).send()
    }

    //formatting time related properties of response array
    const usersArr = users.map(user => {
      const newUser = {
        ...user._doc,
        lastLogin: user._doc.lastLogin
          ? moment(user._doc.lastLogin).format('DD MMM YYYY, HH:mm')
          : '-',
        inactiveDays: user._doc.lastLogin ? moment().diff(moment(user._doc.lastLogin), 'days') : '-'
      }

      return newUser
    })

    res.send({ users: usersArr, total })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
}

export async function postUser(req, res) {
  const { username, email, accessLevel, fullName, isActive, groupId, manualAccess, dataAccess } =
    req.body
  const errors = validationResult(req)

  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }

    const bs = new BcryptSalt()
    const hashedPasswd = await bcrypt.hash(Math.random().toString(), bs.saltRounds)

    const newUserObj = {
      username: username.toLowerCase(),
      fullName,
      password: hashedPasswd,
      email,
      accessLevel,
      manualAccess,
      dataAccess,
      group: groupId,
      isActive
    }

    const user = new User(newUserObj)
    const newUser = await user.save()
    await newUser.populate('group', 'groupName')
    delete newUser._doc.password
    res.status(201).json(newUser)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export async function deleteUsers(req, res) {
  //look for errors
  const errors = validationResult(req)
  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }
    //now begins the specific logic
    const allUsers = req.body.users
    const deletedUsers = []
    const inactivatedUsers = []

    await Promise.all(
      allUsers.map(async userId => {
        const user = await User.findById(userId)

        if (!user) {
          throw new Error('User not found in database')
        }

        //check if user has an experiment
        const experiment = await Experiment.findOne({
          'user.id': userId
        })

        if (experiment) {
          //user has at least one experiment
          user.isActive = false
          await user.save()
          inactivatedUsers.push(userId)
        } else {
          deletedUsers.push(userId)
          await user.deleteOne()
        }
      })
    )
    //now send the response
    res.status(200).send({ deletedUsers, inactivatedUsers })
  } catch (error) {
    console.log('errors encountered while deleting users: ', error)
    res.status(500).send({ error: 'API error' })
  }
}

export async function updateUser(req, res) {
  const errors = validationResult(req)

  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }

    const updatedUser = { ...req.body, group: req.body.groupId }
    delete updatedUser.username
    //username is unique and should not be updated
    //having username in update object was causing problems
    //some browsers were sending invalid value
    const oldUser = await User.findByIdAndUpdate(req.body._id, updatedUser, {
      new: false
    })

    if (!oldUser) {
      return res.status(404).send()
    }

    //updating exUsers array on the current group user moves to different group
    if (req.body.groupId.toString() !== oldUser.group.toString()) {
      const currentGroup = await Group.findById(oldUser.group)
      const exUsersSet = new Set(currentGroup.exUsers)
      exUsersSet.add(oldUser._id)
      currentGroup.exUsers = Array.from(exUsersSet)
      currentGroup.save()
    }

    //fetching updated user to work on response
    const user = await User.findById(req.body._id).populate('group', 'groupName')

    delete user._doc.password
    delete user._doc.tokens
    const lastLogin = user._doc.lastLogin
      ? moment(user._doc.lastLogin).format('DD MMM YYYY, HH:mm')
      : '-'
    const inactiveDays = user._doc.lastLogin
      ? moment().diff(moment(user._doc.lastLogin), 'days')
      : '-'
    res.status(201).send({ ...user._doc, lastLogin, inactiveDays })
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export async function toggleActive(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).send()
    }

    user.isActive = !user.isActive

    const updatedUser = await user.save()
    res.send({ message: 'User active status was updated', _id: updatedUser._id })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
}
