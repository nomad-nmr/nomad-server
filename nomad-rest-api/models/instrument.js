import { Schema, model } from 'mongoose'

const instrumentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  model: String,
  probe: String,
  capacity: {
    type: Number,
    required: true
  },
  available: {
    type: Boolean,
    required: true,
    default: false
  },
  rackOpen: Boolean,
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },

  isManual: {
    type: Boolean,
    default: false
  },

  cost: {
    type: Number,
    default: 0
  },

  dayAllowance: Number,
  nightAllowance: Number,
  maxNight: Number,
  nightStart: String,
  nightEnd: String,
  overheadTime: Number,

  paramsEditing: {
    type: Boolean,
    default: true
  },

  skipHolder: {
    type: Boolean,
    default: false
  },

  autoReset: {
    type: Boolean,
    default: false
  },

  status: {
    summary: {
      busyUntil: {
        type: String,
        default: 'unknown'
      },
      dayExpt: {
        type: String,
        default: 'unknown'
      },
      nightExpt: {
        type: String,
        default: 'unknown'
      },
      running: Boolean,
      availableHolders: Number,
      errorCount: Number,
      pendingCount: Number
    },
    statusTable: {
      type: Array,
      default: []
    },
    historyTable: {
      type: Array,
      default: []
    }
  }
})

export default model('Instrument', instrumentSchema)
