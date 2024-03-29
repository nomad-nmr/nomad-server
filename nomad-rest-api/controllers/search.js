import moment from 'moment'

import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'

export async function fetchExperiments(req, res) {
  //For manual data we can expect large datasets which makes using pagination as used for auto experiments difficult
  //Therefore maximum number of datasets and or experiments displayed on page is limited
  //if max numbers are exceeded then truncated=true is returned with response to allow for displaying a warning.
  const maxDatasets = 20
  const maxExps = 2000

  const {
    currentPage,
    pageSize,
    solvent,
    instrumentId,
    paramSet,
    title,
    dateRange,
    groupId,
    userId,
    dataType,
    pulseProgram,
    datasetName,
    legacyData
  } = req.query

  try {
    const excludeProps =
      '-remarks -load -atma -spin -lock -shim -proc -acq -createdAt -expTime -dataPath'

    const dataAccess = await req.user.getDataAccess()

    const searchParams = { $and: [{ status: 'Archived' }] }

    if (instrumentId && instrumentId !== 'undefined') {
      searchParams.$and.push({ 'instrument.id': instrumentId })
    }

    if (paramSet && paramSet !== 'undefined') {
      searchParams.$and.push({ parameterSet: paramSet })
    }

    if (solvent && solvent !== 'undefined') {
      searchParams.$and.push({ solvent })
    }

    if (title && title !== 'undefined') {
      // file deepcode ignore reDOS: <fix using lodash does not seem to work>
      const regex = new RegExp(title, 'i')
      searchParams.$and.push({ title: { $regex: regex } })
    }

    if (pulseProgram && pulseProgram !== 'undefined') {
      // file deepcode ignore reDOS: <fix using lodash does not seem to work>
      const regex = new RegExp(pulseProgram, 'i')
      searchParams.$and.push({ pulseProgram: { $regex: regex } })
    }

    if (datasetName && datasetName !== 'undefined') {
      // file deepcode ignore reDOS: <fix using lodash does not seem to work>
      const regex = new RegExp(datasetName, 'i')
      searchParams.$and.push({ datasetName: { $regex: regex } })
    }

    if (dateRange && dateRange !== 'undefined') {
      const datesArr = dateRange.split(',')
      searchParams.$and.push(
        dataType === 'auto'
          ? {
              submittedAt: {
                $gte: new Date(datesArr[0]),
                $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
              }
            }
          : {
              updatedAt: {
                $gte: new Date(datesArr[0]),
                $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
              }
            }
      )
    }

    const adminSearchLogic = () => {
      if (groupId && groupId !== 'undefined') {
        searchParams.$and.push({ 'group.id': groupId })
      }

      if (userId && userId !== 'undefined') {
        searchParams.$and.push({ 'user.id': userId })
      }
    }

    //this switch should assure that search is performed in accordance with data access privileges
    switch (dataAccess) {
      case 'user':
        searchParams.$and.push({ 'user.id': req.user._id })
        break

      case 'group':
        if (legacyData === 'true') {
          searchParams.$and.push({ 'user.id': req.user._id })
          searchParams.$nor = [{ 'group.id': req.user.group }]
        } else {
          if (userId && userId !== 'undefined') {
            searchParams.$and.push({ 'user.id': userId, 'group.id': req.user.group })
          } else {
            searchParams.$and.push({ 'group.id': req.user.group })
          }
        }

        break

      case 'admin-b':
        if (legacyData === 'true') {
          searchParams.$and.push({ 'user.id': req.user._id })
          searchParams.$nor = [{ 'group.id': req.user.group }]
        } else {
          adminSearchLogic()
          if ((!groupId || groupId === 'undefined') && (!userId || userId === 'undefined')) {
            searchParams.$and.push({ 'group.id': req.user.group })
          }
        }

        break

      case 'admin':
        adminSearchLogic()
        break
      default:
        throw new Error('Data access rights unknown')
    }

    let total
    let experiments

    if (dataType === 'auto') {
      total = await Experiment.find(searchParams).countDocuments()
      experiments = await Experiment.find(searchParams, excludeProps)
        .sort({ updatedAt: 'desc' })
        .skip((currentPage - 1) * pageSize)
        .limit(+pageSize)

      //Since pagination is done on experiment level, last dataset can be divided between 2 pages.
      // Following code amends that by adding missing experiments into the last dataset
      if (experiments.length !== 0) {
        const lastDatasetName = experiments[experiments.length - 1].datasetName
        const lastDataSet = await Experiment.find(
          { datasetName: lastDatasetName, status: 'Archived' },
          excludeProps
        )
        lastDataSet.forEach(i => {
          if (!experiments.find(exp => exp.expId === i.expId)) {
            experiments.push(i)
          }
        })
      }

      if (currentPage !== '1') {
        const firstDataset = await Experiment.find(
          { datasetName: experiments[0].datasetName, status: 'Archived' },
          excludeProps
        )
        firstDataset.forEach(i => {
          if (!experiments.find(exp => exp.expId === i.expId)) {
            experiments.unshift(i)
          }
        })
      }
    } else {
      total = await ManualExperiment.find(searchParams).countDocuments()
      experiments = await ManualExperiment.find(searchParams)
        .sort({ updatedAt: 'desc' })
        .limit(maxExps)
    }

    const datasets = []
    let truncated = false

    for (let exp of experiments) {
      const datasetIndex = datasets.findIndex(dataSet => dataSet.datasetName === exp.datasetName)
      const expObj =
        dataType === 'auto'
          ? {
              key: exp._id,
              datasetName: exp.datasetName,
              expNo: exp.expNo,
              parameterSet: exp.parameterSet,
              parameters: exp.parameters,
              title: exp.title,
              archivedAt: exp.updatedAt
            }
          : {
              key: exp._id,
              datasetName: exp.datasetName,
              expNo: exp.expNo,
              pulseProgram: exp.pulseProgram,
              solvent: exp.solvent,
              title: exp.title,
              createdAt: exp.dateCreated
            }
      if (datasetIndex < 0) {
        const newDataSet =
          dataType === 'auto'
            ? {
                instrument: exp.instrument,
                user: exp.user,
                group: exp.group,
                datasetName: exp.datasetName,
                key: exp.datasetName,
                solvent: exp.solvent,
                title: exp.title,
                submittedAt: exp.submittedAt,
                exps: [expObj]
              }
            : {
                instrument: exp.instrument,
                user: exp.user,
                group: exp.group,
                datasetName: exp.datasetName,
                key: exp.datasetName,
                claimedAt: exp.updatedAt,
                exps: [expObj]
              }
        datasets.push(newDataSet)
      } else {
        datasets[datasetIndex].exps.push(expObj)
      }
      if (datasets.length === maxDatasets) {
        truncated = true
        break
      }
      if (datasets.length <= maxDatasets && experiments.length === maxExps) {
        truncated = true
      }
    }

    //sorting exps to get ascend for expNo
    const sortedDatasets = datasets.map(i => {
      i.exps.sort((a, b) => a.expNo - b.expNo)
      const lastIndex = i.exps.length - 1
      const lastArchivedAt = i.exps[lastIndex].archivedAt
      return { ...i, lastArchivedAt }
    })

    res.send({ data: sortedDatasets, total, truncated })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function getDataAccess(req, res) {
  try {
    const dataAccess = await req.user.getDataAccess()
    res.send({ dataAccess })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
