import moment from 'moment'
import User from '../models/user.js'
import Group from '../models/group.js'
import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'
import Dataset from '../models/dataset.js'
import Collection from '../models/collection.js'
import Claim from '../models/claim.js'

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
      {
        title: 'Automation Experiments Archived',
        dataArray: leaderboardsData1.map((i, index) => ({ ...i, key: index }))
      },
      {
        title: 'Automation Samples Processed',
        dataArray: leaderboardsData2.map((i, index) => ({ ...i, key: index }))
      },
      {
        title: 'Datasets Created',
        dataArray: await Promise.all(
          leaderboardsData3.map(async (i, index) => {
            const user = await User.findOne({ username: i.username })
            const group = await Group.findById(user.group)
            return { ...i, groupName: group.groupName, key: index }
          })
        )
      }
    ]

    return Promise.resolve(leaderboardsData)
  } catch (error) {
    return Promise.reject(error)
  }
}

const fetchHeatmapData = async (type = 'days') => {
  try {
    const today = moment()

    if (type === 'days') {
      const startDate = moment(today).subtract(365, 'days').toDate()
      const endDate = moment(today).add(1, 'day').toDate()

      // Get archived automated experiments grouped by date
      const autoExpsData = await Experiment.aggregate([
        { $match: { status: 'Archived', updatedAt: { $gte: startDate, $lt: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y/%m/%d', date: '$updatedAt' } },
            count: { $sum: 1 }
          }
        }
      ])

      // Get archived manual experiments grouped by date
      const manualExpsData = await ManualExperiment.aggregate([
        { $match: { updatedAt: { $gte: startDate, $lt: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y/%m/%d', date: '$updatedAt' } },
            count: { $sum: 1 }
          }
        }
      ])

      // Combine the data from both automated and manual experiments
      const dateCountMap = new Map()

      autoExpsData.forEach(item => {
        const date = item._id
        dateCountMap.set(date, (dateCountMap.get(date) || 0) + item.count)
      })

      manualExpsData.forEach(item => {
        const date = item._id
        dateCountMap.set(date, (dateCountMap.get(date) || 0) + item.count)
      })

      // Generate all 365 dates and create array with counts (0 for dates with no data)
      const heatmapData = []
      for (let i = 0; i < 365; i++) {
        const date = moment(today).subtract(i, 'days')
        const dateStr = date.format('YYYY/MM/DD')
        heatmapData.push({
          date: dateStr,
          count: dateCountMap.get(dateStr) || 0
        })
      }

      // Sort by date in ascending order
      heatmapData.sort(
        (a, b) => new Date(a.date.replace(/\//g, '-')) - new Date(b.date.replace(/\//g, '-'))
      )

      return Promise.resolve(heatmapData)
    } else if (type === 'months') {
      const startDate = moment(today).subtract(12, 'months').toDate()
      const endDate = moment(today).add(1, 'day').toDate()

      // Get archived automated experiments grouped by month
      const autoExpsData = await Experiment.aggregate([
        { $match: { status: 'Archived', updatedAt: { $gte: startDate, $lt: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y/%m', date: '$updatedAt' } },
            count: { $sum: 1 }
          }
        }
      ])

      // Get archived manual experiments grouped by month
      const manualExpsData = await ManualExperiment.aggregate([
        { $match: { updatedAt: { $gte: startDate, $lt: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y/%m', date: '$updatedAt' } },
            count: { $sum: 1 }
          }
        }
      ])

      // Combine the data from both automated and manual experiments
      const monthCountMap = new Map()

      autoExpsData.forEach(item => {
        const month = item._id
        monthCountMap.set(month, (monthCountMap.get(month) || 0) + item.count)
      })

      manualExpsData.forEach(item => {
        const month = item._id
        monthCountMap.set(month, (monthCountMap.get(month) || 0) + item.count)
      })

      // Generate all 12 months and create array with counts (0 for months with no data)
      const heatmapData = []
      for (let i = 0; i < 12; i++) {
        const month = moment(today).subtract(i, 'months')
        const monthStr = month.format('YYYY/MM')
        heatmapData.push({
          month: monthStr,
          count: monthCountMap.get(monthStr) || 0
        })
      }

      // Sort by month in ascending order
      heatmapData.sort((a, b) => new Date(a.month + '/01') - new Date(b.month + '/01'))

      return Promise.resolve(heatmapData)
    } else if (type === 'years') {
      // Get archived automated experiments grouped by year (no date range)
      const autoExpsData = await Experiment.aggregate([
        { $match: { status: 'Archived' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y', date: '$updatedAt' } },
            count: { $sum: 1 }
          }
        }
      ])

      // Get archived manual experiments grouped by year
      const manualExpsData = await ManualExperiment.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y', date: '$updatedAt' } },
            count: { $sum: 1 }
          }
        }
      ])

      // Combine the data from both automated and manual experiments
      const yearCountMap = new Map()

      autoExpsData.forEach(item => {
        const year = item._id
        yearCountMap.set(year, (yearCountMap.get(year) || 0) + item.count)
      })

      manualExpsData.forEach(item => {
        const year = item._id
        yearCountMap.set(year, (yearCountMap.get(year) || 0) + item.count)
      })

      // Create array from map and sort by year
      const heatmapData = Array.from(yearCountMap, ([year, count]) => ({
        year,
        count
      })).sort((a, b) => a.year.localeCompare(b.year))

      return Promise.resolve(heatmapData)
    } else {
      throw new Error(`Invalid type: ${type}. Must be 'days', 'months', or 'years'.`)
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

const getInstrumentUtilisationData = async type => {
  try {
    const autoSearchParams = { $and: [{ status: 'Archived' }] }
    const manualSearchParams = { $and: [{}] }
    let totalTime = 0

    switch (type) {
      case 'last_30_days':
        const daysSearchParams = {
          $gte: new Date(moment().subtract(30, 'days').format('YYYY-MM-DD')),
          $lt: new Date(moment().add(1, 'd').format('YYYY-MM-DD'))
        }

        autoSearchParams.$and.push({ updatedAt: daysSearchParams })
        manualSearchParams.$and.push({ updatedAt: daysSearchParams })
        totalTime = 30 * 24 * 60 * 60
        break

      case 'today':
        const todaySearchParams = {
          $gte: new Date(moment().format('YYYY-MM-DD')),
          $lt: new Date(moment().add(1, 'd').format('YYYY-MM-DD'))
        }

        autoSearchParams.$and.push({ updatedAt: todaySearchParams })
        manualSearchParams.$and.push({ updatedAt: todaySearchParams })
        totalTime = 24 * 60 * 60
        break

      case '12_months':
      default:
        const trailingSearchParams = {
          $gte: new Date(moment().subtract(12, 'months').format('YYYY-MM-DD')),
          $lt: new Date(moment().add(1, 'd').format('YYYY-MM-DD'))
        }

        autoSearchParams.$and.push({ updatedAt: trailingSearchParams })
        manualSearchParams.$and.push({ updatedAt: trailingSearchParams })
        totalTime = 365 * 24 * 60 * 60
        break
    }

    // Get automation experiments grouped by instrument
    const autoExpsData = await Experiment.aggregate([
      { $match: { ...autoSearchParams } },
      {
        $group: {
          _id: '$instrument.name',
          totalExpTime: {
            $sum: {
              $let: {
                vars: {
                  parts: { $split: [{ $ifNull: ['$totalExpTime', '$expTime'] }, ':'] }
                },
                in: {
                  $add: [
                    { $multiply: [{ $toInt: { $arrayElemAt: ['$$parts', 0] } }, 3600] },
                    { $multiply: [{ $toInt: { $arrayElemAt: ['$$parts', 1] } }, 60] },
                    { $toInt: { $arrayElemAt: ['$$parts', 2] } }
                  ]
                }
              }
            }
          }
        }
      }
    ])

    // Extract date range from manualSearchParams for claims
    let claimsDateMatch = { status: 'Approved' }
    const dateRangeFromParams = manualSearchParams.$and.find(param => param.updatedAt)
    if (dateRangeFromParams) {
      claimsDateMatch.createdAt = dateRangeFromParams.updatedAt
    }

    // Get claims grouped by instrument and sum expTime
    const claimsData = await Claim.aggregate([
      { $match: claimsDateMatch },
      {
        $lookup: {
          from: 'instruments',
          localField: 'instrument',
          foreignField: '_id',
          as: 'instrumentDetails'
        }
      },
      { $unwind: '$instrumentDetails' },
      {
        $group: {
          _id: '$instrumentDetails.name',
          totalManualExpTime: { $sum: { $toDouble: '$expTime' } }
        }
      }
    ])

    // Create a map of claims data for easy lookup
    const claimsMap = new Map()
    claimsData.forEach(item => {
      if (item._id) {
        claimsMap.set(item._id, item.totalManualExpTime)
      }
    })

    console.log('Auto Experiments Data:', autoExpsData)

    // Convert to array of objects
    const instrumentData = autoExpsData.map(item => ({
      instrumentName: item._id,
      totalExpTime: item.totalExpTime,
      manualExpTime: claimsMap.get(item._id) || 0
    }))

    const barChartData = instrumentData
      .map(item => ({
        instrumentName: item.instrumentName,
        utilisation:
          Math.round(((item.totalExpTime + item.manualExpTime * 3600) / totalTime) * 100 * 100) /
          100,
        totalExpTime: moment
          .duration(item.totalExpTime + item.manualExpTime * 3600, 'seconds')
          .format('HH:mm:ss')
      }))
      .sort((a, b) => a.instrumentName.localeCompare(b.instrumentName))

    const totalUsedTime = instrumentData.reduce(
      (acc, item) => acc + item.totalExpTime + item.manualExpTime * 3600,
      0
    )

    const pieChartData = instrumentData
      .map(item => ({
        instrumentName: item.instrumentName,
        value:
          Math.round(
            ((item.totalExpTime + item.manualExpTime * 3600) / totalUsedTime) * 100 * 100
          ) / 100
      }))
      .sort((a, b) => a.instrumentName.localeCompare(b.instrumentName))

    return Promise.resolve({
      barChartData,
      pieChartData
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

export { getDatastoreStats, getLeaderboardsData, fetchHeatmapData, getInstrumentUtilisationData }
