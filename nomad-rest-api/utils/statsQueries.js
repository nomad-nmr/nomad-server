import moment from 'moment'
import User from '../models/user.js'
import Group from '../models/group.js'
import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'
import Dataset from '../models/dataset.js'
import Collection from '../models/collection.js'

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

const getLeaderboardsData = async type => {
  try {
    const searchParamsExps = { $and: [{ status: 'Archived' }] }
    const searchParamsDatasets = { $and: [{}] }

    switch (type) {
      case 'last_30_days':
        const daysSearchParams = {
          $gte: new Date(moment().subtract(30, 'days').format('YYYY-MM-DD')),
          $lt: new Date(moment().add(1, 'd').format('YYYY-MM-DD'))
        }

        searchParamsExps.$and.push({ submittedAt: daysSearchParams })
        searchParamsDatasets.$and.push({ createdAt: daysSearchParams })
        break

      case 'today':
        const todaySearchParams = {
          $gte: new Date(moment().format('YYYY-MM-DD')),
          $lt: new Date(moment().add(1, 'd').format('YYYY-MM-DD'))
        }

        searchParamsExps.$and.push({ submittedAt: todaySearchParams })
        searchParamsDatasets.$and.push({ createdAt: todaySearchParams })

        break

      default:
        break
    }

    const leaderboardsData1 = await Experiment.aggregate([
      { $match: { ...searchParamsExps } },
      {
        $group: {
          _id: '$user.id',
          username: { $first: '$user.username' },
          groupName: { $first: '$group.name' },
          experimentsCount: { $sum: 1 }
        }
      },
      { $sort: { experimentsCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $project: {
          username: 1,
          groupName: 1,
          archivedCount: '$experimentsCount',
          fullName: { $arrayElemAt: ['$userDetails.fullName', 0] },
          _id: 0
        }
      }
    ])

    const leaderboardsData2 = await Experiment.aggregate([
      { $match: { ...searchParamsExps } },
      {
        $group: {
          _id: {
            userId: '$user.id',
            datasetName: '$datasetName'
          }
        }
      },
      {
        $group: {
          _id: '$_id.userId',
          uniqueDatasetCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'experiments',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user.id', '$$userId'] }, ...searchParamsExps } },
            { $limit: 1 },
            { $project: { 'user.username': 1, 'group.name': 1 } }
          ],
          as: 'expDetails'
        }
      },
      { $sort: { uniqueDatasetCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $project: {
          username: { $arrayElemAt: ['$expDetails.user.username', 0] },
          groupName: { $arrayElemAt: ['$expDetails.group.name', 0] },
          archivedCount: '$uniqueDatasetCount',
          fullName: { $arrayElemAt: ['$userDetails.fullName', 0] },
          _id: 0
        }
      }
    ])

    const leaderboardsData3 = await Dataset.aggregate([
      { $match: { ...searchParamsDatasets } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $group: {
          _id: '$user',
          username: { $first: { $arrayElemAt: ['$userDetails.username', 0] } },
          fullName: { $first: { $arrayElemAt: ['$userDetails.fullName', 0] } },
          datasetsCount: { $sum: 1 }
        }
      },
      { $sort: { datasetsCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          username: 1,
          archivedCount: '$datasetsCount',
          fullName: 1,
          _id: 0
        }
      }
    ])

    const leaderboardsData = [
      { title: 'Automation Experiments Archived', dataArray: leaderboardsData1 },
      { title: 'Automation Samples Processed', dataArray: leaderboardsData2 },
      {
        title: 'Datasets Created',
        dataArray: await Promise.all(
          leaderboardsData3.map(async i => {
            const user = await User.findOne({ username: i.username })
            const group = await Group.findById(user.group)
            return { ...i, groupName: group.groupName }
          })
        )
      }
    ]

    return Promise.resolve(leaderboardsData)
  } catch (error) {
    return Promise.reject(error)
  }
}

export { getDatastoreStats, getLeaderboardsData }
