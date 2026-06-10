import User from '../models/user.js'
import Experiment from '../models/experiment.js'
import Dataset from '../models/dataset.js'

export async function getUserSettings(req, res) {
  const { user } = req
  res.status(200).json({
    username: user.username,
    fullName: user.fullName,
    sendStatusError: user.sendStatusEmail.error,
    sendStatusArchived: user.sendStatusEmail.archived
  })
}

export async function patchUserSettings(req, res) {
  try {
    const { fullName, sendStatusError, sendStatusArchived } = req.body

    await User.findByIdAndUpdate(req.user._id, {
      fullName,
      sendStatusEmail: { error: sendStatusError, archived: sendStatusArchived }
    })
    res.status(200).json({ fullName, sendStatusArchived, sendStatusError })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function getRecentDatasets(req, res) {
  try {
    const experiments = await Experiment.find(
      { 'user.id': req.user._id, status: 'Archived' },
      'title , datasetName'
    )
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean()

    const experimentsAgr = []
    for (const exp of experiments) {
      const datasetIndex = experimentsAgr.findIndex(i => i.datasetName === exp.datasetName)
      if (datasetIndex === -1) {
        experimentsAgr.push({ datasetName: exp.datasetName, title: exp.title, expsIds: [exp._id] })
      } else {
        experimentsAgr[datasetIndex].expsIds.push(exp._id)
      }
    }
    const datasets = await Dataset.find({ user: req.user._id }, 'title')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean()

    res.status(200).json({ experiments: experimentsAgr, datasets })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
