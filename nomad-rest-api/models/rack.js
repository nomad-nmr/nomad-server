import { Schema, model } from 'mongoose'

const rackSchema = new Schema({
  rackType: String,
  title: {
    type: String,
    required: true,
    trim: true
  },
  group: {
    type: Schema.Types.ObjectId,
    // required: true, not required to enable open racks
    ref: 'Group'
  },
  instrument: {
    type: Schema.Types.ObjectId,
    ref: 'Instrument'
  },
  isOpen: {
    type: Boolean,
    required: true,
    default: true
  },
  editParams: {
    type: Boolean,
    default: false
  },
  slotsNumber: {
    type: Number,
    required: true,
    default: 72
  },
  sampleJet: Boolean,
  sampleIdOn: Boolean,
  accessList: {
    type: Array,
    required: true,
    default: []
  },
  samples: [
    {
      slot: Number,
      user: {
        id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        username: String,
        fullName: String,
        groupName: String,
        groupId: { type: Schema.Types.ObjectId, ref: 'Group' }
      },
      solvent: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },

      tubeId: {
        type: String,
        required: true,
        default: '---'
      },

      exps: [
        {
          paramSet: { type: String, required: true },
          params: String,
          expt: String
        }
      ],

      addedAt: Date,

      instrument: {
        id: { type: Schema.Types.ObjectId, ref: 'Instrument' },
        name: String
      },
      holder: Number,
      status: String,
      dataSetName: String,
      expTime: String
    }
  ]
})

export default model('Rack', rackSchema)
