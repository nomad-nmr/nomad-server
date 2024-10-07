import Experiment from '../models/experiment.js'

export async function getAutoExperiments(req, res) {
  const {
    solvent,
    instrumentId,
    paramSet,
    title,
    dateRange,
    groupId,
    userId,
    datasetName,
  } = req.query

  try {
    const dataAccess = await req.user.getDataAccess()


    const searchParams = {}

    if (instrumentId !== undefined) {
      searchParams['instrument.id'] = {
        $in: instrumentId.split(',')
      }
    }

    let experiments = await Experiment.find(searchParams)
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
