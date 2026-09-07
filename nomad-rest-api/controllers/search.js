import moment from 'moment'
import mongoose from 'mongoose'

import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'

const defaultPageSize = 10
const maxPageSize = 50

const isDefined = value => value && value !== 'undefined'

const toObjectId = (id, paramName) => {
  try {
    return new mongoose.Types.ObjectId(id)
  } catch (error) {
    throw new Error(`Invalid ${paramName}`)
  }
}

//Builds mongoDB filter that is used both in aggregation $match stage and in find query.
//Values must be cast explicitly as aggregation pipeline, unlike find, does not cast query values
//against the schema.
const buildSearchParams = (query, user, dataAccess) => {
  const {
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
  } = query

  const searchParams = { $and: [] }

  //ManualExperiment has no status property
  if (dataType === 'auto') {
    searchParams.$and.push({ status: 'Archived' })
  }

  if (isDefined(instrumentId)) {
    searchParams.$and.push({ 'instrument.id': toObjectId(instrumentId, 'instrumentId') })
  }

  if (isDefined(paramSet)) {
    searchParams.$and.push({ parameterSet: paramSet })
  }

  if (isDefined(solvent)) {
    searchParams.$and.push({ solvent })
  }

  if (isDefined(title)) {
    // file deepcode ignore reDOS: <fix using lodash does not seem to work>
    const regex = new RegExp(title, 'i')
    searchParams.$and.push({ title: { $regex: regex } })
  }

  if (isDefined(pulseProgram)) {
    // file deepcode ignore reDOS: <fix using lodash does not seem to work>
    const regex = new RegExp(pulseProgram, 'i')
    searchParams.$and.push({ pulseProgram: { $regex: regex } })
  }

  if (isDefined(datasetName)) {
    // file deepcode ignore reDOS: <fix using lodash does not seem to work>
    const regex = new RegExp(datasetName, 'i')
    searchParams.$and.push({ datasetName: { $regex: regex } })
  }

  if (isDefined(dateRange)) {
    const datesArr = dateRange.split(',')
    const range = {
      $gte: new Date(datesArr[0]),
      $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
    }
    searchParams.$and.push(dataType === 'auto' ? { submittedAt: range } : { updatedAt: range })
  }

  const adminSearchLogic = () => {
    if (isDefined(groupId)) {
      searchParams.$and.push({ 'group.id': toObjectId(groupId, 'groupId') })
    }

    if (isDefined(userId)) {
      searchParams.$and.push({ 'user.id': toObjectId(userId, 'userId') })
    }
  }

  //getDataAccess() populates user.group and aggregation $match, unlike find,
  //does not cast a document down to its _id
  const userGroupId = user.group?._id || user.group

  //this switch should assure that search is performed in accordance with data access privileges
  switch (dataAccess) {
    case 'user':
      searchParams.$and.push({ 'user.id': user._id })
      break

    case 'group':
      if (legacyData === 'true') {
        searchParams.$and.push({ 'user.id': user._id })
        searchParams.$nor = [{ 'group.id': userGroupId }]
      } else {
        if (isDefined(userId)) {
          searchParams.$and.push({
            'user.id': toObjectId(userId, 'userId'),
            'group.id': userGroupId
          })
        } else {
          searchParams.$and.push({ 'group.id': userGroupId })
        }
      }

      break

    case 'admin-b':
      if (legacyData === 'true') {
        searchParams.$and.push({ 'user.id': user._id })
        searchParams.$nor = [{ 'group.id': userGroupId }]
      } else {
        adminSearchLogic()
        if (!isDefined(groupId) && !isDefined(userId)) {
          searchParams.$and.push({ 'group.id': userGroupId })
        }
      }

      break

    case 'admin':
      adminSearchLogic()
      break
    default:
      throw new Error('Data access rights unknown')
  }

  //$and must not be an empty array
  if (searchParams.$and.length === 0) {
    searchParams.$and.push({})
  }

  return searchParams
}

export async function fetchExperiments(req, res) {
  const { dataType } = req.query

  try {
    const excludeProps =
      '-remarks -load -atma -spin -lock -shim -proc -acq -createdAt -expTime -dataPath'

    const dataAccess = await req.user.getDataAccess()
    const searchParams = buildSearchParams(req.query, req.user, dataAccess)
    const Model = dataType === 'auto' ? Experiment : ManualExperiment

    const pageSize = Math.min(
      Math.max(Math.floor(+req.query.pageSize) || defaultPageSize, 1),
      maxPageSize
    )
    const currentPage = Math.max(Math.floor(+req.query.currentPage) || 1, 1)

    //Pagination has to be performed on dataset level as one row of the table in the front-end
    //corresponds to one dataset with experiments rendered in row expansion.
    //Therefore, experiments are grouped by datasetName first and then a page of datasets is fetched.
    const [{ page, summary }] = await Model.aggregate([
      { $match: searchParams },
      {
        $group: {
          _id: '$datasetName',
          lastArchivedAt: { $max: '$updatedAt' },
          expCount: { $sum: 1 }
        }
      },
      //_id is used as tiebreaker to keep the order of datasets stable across pages
      { $sort: { lastArchivedAt: -1, _id: -1 } },
      {
        $facet: {
          page: [{ $skip: (currentPage - 1) * pageSize }, { $limit: pageSize }],
          summary: [
            { $group: { _id: null, datasets: { $sum: 1 }, experiments: { $sum: '$expCount' } } }
          ]
        }
      }
    ]).allowDiskUse(true)

    const experiments = await Model.find(
      {
        ...searchParams,
        $and: [...searchParams.$and, { datasetName: { $in: page.map(i => i._id) } }]
      },
      excludeProps
    )

    const datasetsMap = new Map()

    for (let exp of experiments) {
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

      const dataset = datasetsMap.get(exp.datasetName)

      if (!dataset) {
        //submittedAt could be missing for experiments created by processing au-program
        //in that case we try to find submittedAt date from other experiments in the same dataset
        let submittedExp
        if (!exp.submittedAt) {
          submittedExp = experiments.find(i => i.datasetName === exp.datasetName && i.submittedAt)
        }

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
                submittedAt: exp.submittedAt
                  ? exp.submittedAt
                  : submittedExp
                    ? submittedExp.submittedAt
                    : undefined,
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
        datasetsMap.set(exp.datasetName, newDataSet)
      } else {
        dataset.exps.push(expObj)
      }
    }

    //datasets are returned in the order defined by the aggregation sort stage
    //exps get sorted to ascend for expNo
    const data = page
      .filter(i => datasetsMap.has(i._id))
      .map(i => {
        const dataset = datasetsMap.get(i._id)
        dataset.exps.sort((a, b) => a.expNo - b.expNo)
        return { ...dataset, lastArchivedAt: i.lastArchivedAt }
      })

    res.send({
      data,
      total: summary[0] ? summary[0].datasets : 0,
      totalExps: summary[0] ? summary[0].experiments : 0
    })
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
