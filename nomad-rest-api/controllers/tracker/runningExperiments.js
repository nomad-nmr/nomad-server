const Instrument = require('../../models/instrument')

const runningExperiments = {
  //runningExperiments.state is array of object holding information about datasetName and ExpNo of an experiment running on each machine
  state: undefined,
  //if state is undefined getState method gets state from DB
  getState: async function () {
    const statusArray = await Instrument.find({ isActive: true }, 'status.statusTable')
    this.state = statusArray.map(i => {
      const runningExpIndex = i.status.statusTable.findIndex(entry => entry.status === 'Running')
      return {
        instrId: i._id,
        datasetName:
          runningExpIndex !== -1 ? i.status.statusTable[runningExpIndex].datasetName : 'none',
        expNo: runningExpIndex !== -1 ? i.status.statusTable[runningExpIndex].expNo : 'none'
      }
    })
  },
  //method updates state of running experiments and returns object with instrId datasetName and ExpNo of finished experiment
  update: function (instrId, newStatusTab) {
    const index = this.state.findIndex(i => i.instrId.toString() === instrId.toString())
    const prevRunningExp = this.state[index]
    const newRunningExp = newStatusTab.find(entry => entry.status === 'Running') || {
      instrId,
      datasetName: 'none',
      expNo: 'none'
    }

    if (
      prevRunningExp.datasetName !== newRunningExp.datasetName ||
      prevRunningExp.expNo !== newRunningExp.expNo
    ) {
      this.state[index] = {
        ...this.state[index],
        datasetName: newRunningExp.datasetName,
        expNo: newRunningExp.expNo,
        runningAt: new Date()
      }
      if (prevRunningExp.datasetName !== 'none') {
        return prevRunningExp
      }
    }
  }
}

module.exports = runningExperiments
