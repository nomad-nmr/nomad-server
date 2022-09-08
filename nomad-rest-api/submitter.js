const Instrument = require('./models/instrument')

//Class is used to generate submitter object that registers and holds socketId for instrument clients and state of holders on each machine
class Submitter {
  constructor() {
    //State has following map data structure [instrumentId, {socketId, usedHolders, bookedHolders}]
    // usedHolders is set with numbers of holder being used on given instrument. It gets generated and updated from status table.
    //bookedHolders is array of numbers of holders currently being booked on the instrument

    this.state = new Map()
  }

  init() {
    Instrument.find({ isActive: true }, '_id capacity status.statusTable').then(instrArr => {
      instrArr.forEach(instr => {
        const usedHolders = new Set()
        instr.status.statusTable.forEach(entry => {
          usedHolders.add(+entry.holder)
        })

        this.state.set(instr._id.toString(), {
          socketId: undefined,
          usedHolders,
          bookedHolders: []
        })
      })
    })
  }

  updateSocket(instrId, socketId) {
    const instr = this.state.get(instrId)
    this.state.set(instrId, { ...instr, socketId })
  }

  isConnected(instrId) {
    const instr = this.state.get(instrId)
    if (instr) {
      if (instr.socketId) {
        return true
      } else {
        return false
      }
    }
  }

  updateBookedHolders(instrId, holders) {
    const instr = this.state.get(instrId)
    this.state.set(instrId, { ...instr, bookedHolders: instr.bookedHolders.concat(holders) })
  }

  updateUsedHolders(instrId, statusTable) {
    const instr = this.state.get(instrId)
    const newUsedHolders = new Set()
    statusTable.forEach(entry => {
      newUsedHolders.add(+entry.holder)
    })
    this.state.set(instrId, { ...instr, usedHolders: newUsedHolders })
  }

  cancelBookedHolder(instrId, holder) {
    const instr = this.state.get(instrId)
    const newBookedHolders = instr.bookedHolders.filter(bh => bh.toString() !== holder.toString())
    this.state.set(instrId, { ...instr, bookedHolders: newBookedHolders })
  }

  resetBookedHolders(instrId) {
    const instr = this.state.get(instrId)
    this.state.set(instrId, { ...instr, bookedHolders: [] })
  }

  findAvailableHolders = (instrId, capacity, count) => {
    const holders = []
    //adding bookedHolders to usedHolders
    const { usedHolders, bookedHolders } = this.state.get(instrId)

    const currentUsedHolders = new Set([...usedHolders, ...bookedHolders])

    for (let i = 1; i <= capacity; i++) {
      if (!currentUsedHolders.has(i)) {
        holders.push(i)
      }
      if (holders.length === +count) {
        return holders
      }
    }
    return holders
  }
}

module.exports = Submitter
