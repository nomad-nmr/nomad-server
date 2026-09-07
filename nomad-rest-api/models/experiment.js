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
    datasetName: { type: String, required: true, index: true },
    holder: { type: String, required: true },
    expNo: { type: String, required: true },
    parameterSet: { type: String, required: true },
    parameters: String,
    solvent: String,
    title: { type: String, required: true },
    night: { type: Boolean, default: false },
    priority: Boolean,
    submittedAt: { type: Date, default: null },
    startTime: { type: Date, default: null },
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

//supports grouping/sorting of archived experiments by dataset in search
experimentSchema.index({ status: 1, updatedAt: -1 })

//"Archived" is the terminal status of the experiment life cycle.
//The middleware below guards all write paths against changing the status of an archived experiment,
//which would hide the experiment from experiment search and from all accounting aggregations.
//Every other property of an archived experiment remains editable.
//The hooks can be bypassed through the native driver, for example
//Experiment.collection.updateOne({ expId }, { $set: { status: 'Error' } }), if un-archiving is ever needed.

const isArchived = status => status === 'Archived'

experimentSchema.post('init', function (doc) {
  doc.$locals.originalStatus = doc.status
})

experimentSchema.pre('save', function () {
  if (!this.isNew && isArchived(this.$locals.originalStatus) && !isArchived(this.status)) {
    console.log(
      `Attempt to change status of archived experiment ${this.expId} to "${this.status}" was ignored`
    )
    this.status = 'Archived'
  }
})

experimentSchema.pre(['findOneAndUpdate', 'updateOne'], async function () {
  const update = this.getUpdate()
  if (!update) return

  const newStatus = update.status === undefined ? update.$set && update.$set.status : update.status
  if (newStatus === undefined || isArchived(newStatus)) return

  //an extra DB query is executed only if an update attempts to change the status away from "Archived"
  const experiment = await this.model.findOne(this.getFilter(), 'status expId')
  if (!experiment || !isArchived(experiment.status)) return

  console.log(
    `Attempt to change status of archived experiment ${experiment.expId} to "${newStatus}" was ignored`
  )

  delete update.status
  if (update.$set) {
    delete update.$set.status
  }
  this.setUpdate(update)
})

export default model('Experiment', experimentSchema)
