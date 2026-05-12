import moment from 'moment'

import User from '../models/user.js'
import Group from '../models/group.js'
import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'
import Dataset from '../models/dataset.js'
import Collection from '../models/collection.js'

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
      datastoreStats: await getDatastoreStats()
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

// Helper function to get datastore stats the function is used in both getPublicStats and getPublicStatsUpdate to avoid code duplication
const getDatastoreStats = async dateRange => {
  try {
    const autoSearchParams = { $and: [{ status: 'Archived' }] }
    const manualSearchParams = { $and: [{ status: 'Archived' }] }
    const datasetsSearchParams = { $and: [] }

    if (dateRange && dateRange !== 'undefined') {
      const datesArr = dateRange.split(',')
      autoSearchParams.$and.push({
        submittedAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })

      manualSearchParams.$and.push({
        updatedAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })

      datasetsSearchParams.$and.push({
        createdAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })
    }

    const autoExpsArchivedCount = await Experiment.countDocuments({ ...autoSearchParams })
    const manualExpsArchivedCount = await ManualExperiment.countDocuments({ ...manualSearchParams })

    const uniqueDatasetCount = await Experiment.aggregate([
      { $match: { ...autoSearchParams } },
      { $group: { _id: '$datasetName' } },
      { $count: 'uniqueDatasets' }
    ])

    const datastoreStats = [
      { title: 'Experiments Archived', value: autoExpsArchivedCount + manualExpsArchivedCount },
      {
        title: 'Automation Experiments Archived',
        value: autoExpsArchivedCount
      },
      {
        title: 'Manual Experiments Archived',
        value: manualExpsArchivedCount
      },
      {
        title: 'Automation Processed Samples',
        value: uniqueDatasetCount[0] ? uniqueDatasetCount[0].uniqueDatasets : 0
      },
      {
        title: 'Created Datasets',
        value: await Dataset.countDocuments({ ...datasetsSearchParams })
      },
      {
        title: 'Created Collections',
        value: await Collection.countDocuments({ ...datasetsSearchParams })
      }
    ]
    return Promise.resolve(datastoreStats)
  } catch (error) {
    return Promise.reject(error)
  }
}
