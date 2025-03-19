import { Schema, model } from 'mongoose'

const experimentSchema = new Schema(
  {
    //expId is concat of datasetName and expNo. That assures unique id for each experiment in  history
    // and thus can be used as index
    expId: { type: String, required: true, unique: true, index: true },
    instrument: {
      name: {
        type: String,
        required: true
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Instrument'
      }
    },
    user: {
      username: {
        type: String,
        required: true
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      }
    },
    group: {
      name: {
        type: String,
        required: true
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Group'
      }
    },
    datasetName: { type: String, required: true },
    holder: { type: String, required: true },
    expNo: { type: String, required: true },
    parameterSet: { type: String, required: true },
    parameters: String,
    solvent: String,
    title: { type: String, required: true },
    night: Boolean,
    priority: Boolean,
    submittedAt: Date,
    runningAt: Date,
    expTime: String,
    //total experimental time
    //duration from awarding status running to status archived
    totalExpTime: String,
    status: { type: String, required: true },
    batchSubmit: { type: Boolean, default: false },
    remarks: String,
    load: String,
    atma: String,
    spin: String,
    lock: String,
    shim: String,
    proc: String,
    acq: String,
    dataPath: String,
    grantCosting: {
      grantId: {
        type: Schema.Types.ObjectId,
        ref: 'Grant'
      },
      cost: Number
    }
  },

  { timestamps: true }
)

export default model('Experiment', experimentSchema)
