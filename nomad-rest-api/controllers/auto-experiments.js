import Experiment from '../models/experiment.js'

export async function getAutoExperiments(req, res) {
  const {
    solvent,
    instrumentId,
    parameterSet,
    title,
    dateRange,
    groupId,
    userId,
    datasetName,
    offset,
    limit,
  } = req.query

  try {
    const searchParams = {}

    const dataAccess = await req.user.getDataAccess()
    switch (dataAccess) {
      case 'user':
        searchParams['user.id'] = req.user._id
        break
      case 'group':
        searchParams.$or = [{ 'user.id': req.user._id }, { 'group.id': req.user.group }]
        break
      case 'admin-b':
      case 'admin':
        if (groupId !== undefined) {
          searchParams['group.id'] = {
            $in: groupId.split(',')
          }
        }
        if (userId !== undefined) {
          searchParams['user.id'] = {
            $in: userId.split(',')
          }
        }
        break

      default:
        throw new Error('Data access rights unknown')
    }

    if (solvent !== undefined) {
      searchParams['solvent'] = {
        $in: solvent.split(',')
      }
    }

    if (instrumentId !== undefined) {
      searchParams['instrument.id'] = {
        $in: instrumentId.split(',')
      }
    }

    if (parameterSet !== undefined) {
      searchParams['parameterSet'] = {
        $in: parameterSet.split(',')
      }
    }

    if (title !== undefined) {
      searchParams['title'] = {
        $in: title.split(',')
      }
    }

    if (dateRange !== undefined) {
      const datesArr = dateRange.split(',')
      searchParams['submittedAt'] = {
        $gte: new Date(datesArr[0]),
        $lt: new Date(datesArr[1])
      }
    }


    if (datasetName !== undefined) {
      searchParams['datasetName'] = {
        $in: datasetName.split(',')
      }
    }

    let experiments = await Experiment.find(searchParams).skip(offset).limit(limit)

    res.send(experiments.map(exp => (
      {
        key: exp.expId,
        datasetName: exp.datasetName,
        expNo: exp.expNo,
        parameterSet: exp.parameterSet,
        parameters: exp.parameters,
        title: exp.title,
        instrument: exp.instrument.id,
        user: exp.user.id,
        group: exp.group.id,
        solvent: exp.solvent,
        submittedAt: exp.submittedAt,
      }
    )))
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}
