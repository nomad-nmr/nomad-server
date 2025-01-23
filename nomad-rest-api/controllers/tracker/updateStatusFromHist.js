import Experiment from '../../models/experiment.js'
import expHistAutoFeed from './expHistAutoFeed.js'
import sendUploadCmd from './sendUploadCmd.js'
import sendStatusEmail from './sendStatusEmail.js'

//updateStatus takes existing status  table from instrument object and compares it with new status table
// if entry does not exist or there is an existing entry with status change both status table and expHist table are getting updated
// if expId is not found in expHist table expHistAutoFeed is called to create a new entry in expHist table

const updateStatusFromHist = async (instrument, statusTable, historyTable) => {
  try {
    const updatedStatusTable = Promise.all(
      statusTable.map(async entry => {
        const expId = entry.datasetName + '-' + entry.expNo
        const oldEntry = instrument.status.statusTable.find(
          i => i.datasetName === entry.datasetName && i.expNo === entry.expNo
        )

        //
        if (!oldEntry || oldEntry.status !== entry.status) {
          //looking for expHistEntry only if status has changed to reduce number of DB queries

          const historyTableItem = historyTable.find(
            i => i.datasetName === entry.datasetName && i.expNo === entry.expNo
          )

          const updateObj = {
            status: entry.status,
            expTime: entry.time,
            remarks: historyTableItem && historyTableItem.remarks,
            load: historyTableItem && historyTableItem.load,
            atma: historyTableItem && historyTableItem.atma,
            spin: historyTableItem && historyTableItem.spin,
            lock: historyTableItem && historyTableItem.lock,
            shim: historyTableItem && historyTableItem.shim,
            proc: historyTableItem && historyTableItem.proc,
            acq: historyTableItem && historyTableItem.acq
          }

          // if (!oldEntry && entry.status === 'Available' && entry.expNo === '10') {
          //   // sending pending status email for first experiment of dataset/holder
          //   console.log('HAAAAAAAAAAAAAAAAAAA')
          //   sendStatusEmail.pending(datasetName)
          // }

          //if entry.status === 'Submitted' is used submittedAt is occasionally missing
          //It might be that entry goes directly to 'Running' status.

          const { datasetName, expNo, group } = entry

          if (oldEntry) {
            if (oldEntry.status === 'Available') {
              updateObj.submittedAt = new Date()
            }

            if (oldEntry.status === 'Running' && entry.status === 'Completed') {
              //sending message to client through socket to upload data
              if (process.env.DATASTORE_ON) {
                sendUploadCmd(
                  instrument._id.toString(),
                  { datasetName, expNo, group },
                  'upload-auto'
                )
              }
            }

            if (oldEntry.status === 'Running' && entry.status === 'Error') {
              sendStatusEmail.error(datasetName)
            }

            if (oldEntry.status !== 'Running' && entry.status === 'Running')
              updateObj.runningAt = new Date()
          } else if (entry.status === 'Available' && expNo === '10') {
            // sending pending status email for first experiment of dataset/holder
            sendStatusEmail.pending(datasetName)
          }
          const expHistEntry = await Experiment.findOneAndUpdate({ expId }, updateObj)

          if (expHistEntry) {
            const { solvent, parameters, night, priority, submittedAt, updatedAt } = expHistEntry
            return { ...entry, solvent, parameters, night, priority, submittedAt, updatedAt }
          } else {
            console.log(`Entry with expId ${expId} not found! AUTO-FEED`)
            await expHistAutoFeed(
              { name: instrument.name, id: instrument._id },
              statusTable,
              historyTable
            )
            return entry
          }
        } else {
          return oldEntry
        }
      })
    )

    return Promise.resolve(updatedStatusTable)
  } catch (error) {
    return Promise.reject(error)
  }
}

export default updateStatusFromHist
