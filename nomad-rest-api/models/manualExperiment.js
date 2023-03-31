import { Schema, model } from 'mongoose'

const manualExpSchema = new Schema(
  {
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
    expNo: { type: String, required: true },
    solvent: String,
    pulseProgram: String,
    title: String,
    dateCreated: Date,
    dataPath: { type: String, required: true }
  },

  { timestamps: true }
)

export default model('ManualExperiment', manualExpSchema)
