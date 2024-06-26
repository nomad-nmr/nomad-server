import { Schema, model } from 'mongoose'

const claimSchema = new Schema(
  {
    instrument: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Instrument'
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    group: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Group'
    },
    folders: Array,
    note: String,
    expTime: String,
    status: {
      type: String,
      required: true,
      default: 'Pending'
    },
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

export default model('Claim', claimSchema)
