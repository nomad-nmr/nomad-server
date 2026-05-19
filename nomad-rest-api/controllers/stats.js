import moment from 'moment'

import User from '../models/user.js'
import Group from '../models/group.js'
import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'
import Dataset from '../models/dataset.js'
import Collection from '../models/collection.js'

import { getDatastoreStats, getLeaderboardsData } from '../utils/statsQueries.js'

export async function nmriumStats(req, res) {
  const { user, group } = req.query
  let searchParams = {}
  let respObj = {}

  if (user && !group) {
    searchParams = { username: user }
    respObj = { user }
  } else if (group && !user) {
    const { _id } = await Group.findOne({ groupName: group })
    searchParams = { group: _id }
    respObj = { group }
  } else {
    searchParams = { isActive: true }
  }

  const users = await User.find(searchParams)

  const { nmriumCount, downloadCount } = users.reduce(
    (accuObj, user) => {
      accuObj.nmriumCount += user.stats.nmriumCount
      accuObj.downloadCount += user.stats.downloadCount
      return accuObj
    },
    { nmriumCount: 0, downloadCount: 0 }
  )

  respObj.nmriumUsage = `${Math.round((nmriumCount / (nmriumCount + downloadCount)) * 100)}%`

  res.status(200).json(respObj)
}

export async function getPublicStats(req, res) {
  try {
    const totalUsersCount = await User.countDocuments()
    const activeUsersCount = await User.countDocuments({ isActive: true })
    const activeGroupsCount = await Group.countDocuments({ isActive: true })

    const activeUsers = await User.find({ isActive: true })

    const activeUsersCounts = activeUsers.reduce(
      (countObj, user) => {
        if (user.stats.nmriumCount > user.stats.downloadCount) {
          countObj.nmriumUsersCount += 1
        }

        if (moment().diff(moment(user._doc.lastLogin), 'days') <= 30) {
          countObj.usersActiveIn30Days += 1
        }
        return countObj
      },
      { nmriumUsersCount: 0, usersActiveIn30Days: 0 }
    )

    const respObject = {
      hostName: process.env.HOST_NAME,
      userStats: [
        { title: 'Total Number of Users', value: totalUsersCount },
        { title: 'Users Active Last 30 Days', value: activeUsersCounts.usersActiveIn30Days },
        { title: 'Number of Active Groups', value: activeGroupsCount },
        {
          title: 'NMRium Utilisation',
          value: Math.round((activeUsersCounts.nmriumUsersCount / activeUsersCount) * 100)
        }
      ],
      datastoreStats: await getDatastoreStats(),
      leaderboardsData: await getLeaderboardsData('last_30_days')
    }

    res.status(200).json(respObject)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export async function getPublicStatsUpdate(req, res) {
  try {
    const datastoreStats = await getDatastoreStats(req.query.dateRange)
    res.status(200).json(datastoreStats)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function getLeaderboardsUpdate(req, res) {
  try {
    const leaderboardsData = await getLeaderboardsData(req.query.type)
    res.status(200).json(leaderboardsData)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
