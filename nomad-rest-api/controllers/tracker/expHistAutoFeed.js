const bcrypt = require('bcryptjs')

const Group = require('../../models/group')
const User = require('../../models/user')
const Experiment = require('../../models/experiment')
const ParameterSet = require('../../models/parameterSet')
const runningExperiments = require('./runningExperiments')
const sendUploadCmd = require('./sendUploadCmd')

// helper function that updated automatically DB if group, user or parameter set has not been stored yet (auto-feed)
// & updates exp history every time when experiment stops running (ie. status is changed from "running" to "completed" or "error" )
//It takes as argument reformatted statusTable and historyTable and instrument in form og object {name, id}

const expHistAutoFeed = async (instrument, statusTable, historyTable) => {
  try {
    //getting runningExpState from DB if undefined
    if (!runningExperiments.state) {
      await runningExperiments.getState()
    }

    const histItem = runningExperiments.update(instrument.id, statusTable)

    if (histItem) {
      console.log(histItem)
    }

    if (histItem) {
      const rawHistItemObj = historyTable.find(
        entry => entry.datasetName === histItem.datasetName && entry.expNo === histItem.expNo
      )

      const statusEntry = statusTable.find(
        entry => entry.datasetName === histItem.datasetName && entry.expNo === histItem.expNo
      )

      const status = statusEntry ? statusEntry.status : 'Unknown'
      const expTime = statusEntry ? statusEntry.time : 'Unknown'

      if (rawHistItemObj) {
        //AUTO-FEED for group
        let group = await Group.findOne({ groupName: rawHistItemObj.group })
        if (!group) {
          const newGroup = new Group({ groupName: rawHistItemObj.group.toLowerCase() })
          group = await newGroup.save()
          console.log(`AUTO-FEED: New group ${group.groupName} was created`)
        }

        //AUTO-FEED for user
        let user = await User.findOne({ username: rawHistItemObj.username.toLowerCase() })
        if (!user) {
          const password = await bcrypt.hash(Math.random().toString(), 12)
          const newUser = new User({
            username: rawHistItemObj.username.toLowerCase(),
            group: group._id,
            email: rawHistItemObj.username + '@' + process.env.EMAIL_SUFFIX,
            password
          })
          user = await newUser.save()
          console.log(`New user ${user.username} at group ${group.groupName} was created`)
        }

        //AUTO-FEED for parameter set
        const parameterSet = await ParameterSet.findOne({ name: rawHistItemObj.parameterSet })
        if (!parameterSet) {
          const newParameterSet = new ParameterSet({
            name: rawHistItemObj.parameterSet,
            count: 1,
            availableOn: [instrument.id]
          })
          await newParameterSet.save()
          console.log(`AUTO-FEED: New parameter set ${newParameterSet.name} was created`)
        } else {
          const instr = parameterSet.availableOn.find(
            id => id.toString() === instrument.id.toString()
          )
          if (!instr) {
            parameterSet.availableOn.push(instrument.id)
          }
          parameterSet.count++
          await parameterSet.save()
        }

        const newHistItem = {
          ...rawHistItemObj,
          expId: rawHistItemObj.datasetName + '-' + rawHistItemObj.expNo,
          status,
          expTime,
          finishedAt: new Date(),
          runningAt: histItem.runningAt,
          instrument,
          group: { name: group.groupName, id: group._id },
          user: { username: user.username, id: user._id }
        }

        //Console log for debugging saving experiments in DB with duplicate key after server restart
        if (process.env.SUBMIT_ON === 'true') {
          console.log('!!!!!!!AUTO-FEED - saving new experiment!!!!')
        }

        //sending message to client through socket to upload data when experiment is completed
        if (
          newHistItem.status === 'Completed' &&
          process.env.DATASTORE_ON === 'true' &&
          process.env.SUBMIT_ON === 'false'
        ) {
          console.log('AUTO-FEED - sending upload command')
          const { datasetName, expNo, group } = histItem
          //upload could get be sent twice if submission is on and experiment is missing in history
          sendUploadCmd(instrument.id.toString(), { datasetName, expNo, group })
        }

        const experiment = new Experiment(newHistItem)
        await experiment.save()
      }
    }

    //the following block update remarks to the experiment if they appear in history table in later update of the status file
    if (historyTable[0] && historyTable[0].remarks) {
      const { datasetName, expNo, remarks } = historyTable[0]
      await Experiment.findOneAndUpdate({ datasetName, expNo }, { remarks })
    }

    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

module.exports = expHistAutoFeed
