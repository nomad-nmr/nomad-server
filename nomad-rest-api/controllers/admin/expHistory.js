const moment = require('moment')

const Experiment = require('../../models/experiment')
const Instrument = require('../../models/instrument')
const User = require('../../models/user')
const sendUploadCmd = require('../tracker/sendUploadCmd')
// const io = require('../../socket')
// const app = require('../../app')
// const { response } = require('express')

exports.getHistory = async (req, res) => {
  const date = new Date(req.params.date)
  try {
    const experiments = await Experiment.find({
      'instrument.id': req.params.instrId,
      updatedAt: {
        $gte: date,
        $lt: new Date(moment(date).add(1, 'd').format('YYYY-MM-DD'))
      }
    })
      .sort({ updatedAt: 'desc' })
      .populate('user.id', 'fullName')
      .exec()

    res.send(experiments.filter(exp => exp.status !== 'Available'))
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.fetchRepair = async (req, res) => {
  const { instrId } = req.params
  try {
    const instrument = await Instrument.findById(instrId, 'status.historyTable')
    if (!instrument) {
      return res.sendStatus(404)
    }
    const expHist = instrument.status.historyTable
    const repairList = []
    await Promise.all(
      expHist.map(async entry => {
        const expId = entry.datasetName + '-' + entry.expNo
        const experiment = await Experiment.findOne({ expId })
        if (!experiment || (experiment.status !== 'Archived' && experiment.status !== 'Error')) {
          repairList.push({
            key: expId,
            username: entry.username,
            group: entry.group,
            datasetName: entry.datasetName,
            expNo: entry.expNo,
            title: entry.title,
            status: experiment ? experiment.status : 'undefined'
          })
        }
      })
    )
    repairList.sort((a, b) => a - b)
    res.send(repairList)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

exports.postRepair = async (req, res) => {
  const { instrId, exps } = req.body
  try {
    const instrument = await Instrument.findById(
      instrId,
      'name status.historyTable status.statusTable'
    )
    if (!instrument) {
      return res.sendStatus(404)
    }
    const { statusTable, historyTable } = instrument.status
    await Promise.all(
      exps.map(async expId => {
        const experiment = await Experiment.findOne({ expId }, '_id')
        const splitExpId = expId.split('-')
        const expNo = splitExpId.pop()
        const datasetName = splitExpId.join('-')
        const expHistObj = historyTable.find(
          exp => exp.datasetName === datasetName && exp.expNo === expNo
        )

        const user = await User.findOne({
          username: expHistObj.username.toLowerCase()
        }).populate('group')

        //creating a new entry in experiment history collection if missing
        if (!experiment) {
          const statusObj = statusTable.find(
            exp => exp.datasetName === datasetName && exp.expNo === expNo
          )
          const newExpHistEntry = {
            ...expHistObj,
            expId,
            status: 'undefined',
            solvent: statusObj.solvent,
            expTime: statusObj.time,
            instrument: { id: instrument._id, name: instrument.name },
            group: { name: user.group.groupName, id: user.group._id },
            user: { username: user.username, id: user._id }
          }
          const newExp = new Experiment(newExpHistEntry)
          await newExp.save()
        }
        sendUploadCmd(instrId, { datasetName, expNo, group: user.group.groupName, repair: true })
      })
    )

    setTimeout(async () => {
      const repairList = await getRepairList(exps)
      res.send(repairList)
    }, exps.length * 500)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

//Helper function to generate list of repaired experiments
const getRepairList = async exps => {
  const repairList = []
  await Promise.all(
    exps.map(async expId => {
      const repairedExp = await Experiment.findOne({ expId })
      const { user, group, datasetName, expNo, holder, title, status } = repairedExp
      const repairedListEntry = {
        key: expId,
        username: user.username,
        group: group.name,
        datasetName,
        expNo,
        holder,
        title,
        status
      }
      repairList.push(repairedListEntry)
    })
  )
  return Promise.resolve(repairList)
}

exports.postRefresh = async (req, res) => {
  const { exps } = req.body
  console.log(exps)
  try {
    const repairList = await getRepairList(exps)
    res.send(repairList)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
