import { Schema, model } from 'mongoose'

const collectionSchema = new Schema(
  {
    title: {
      type: String,
      required: true
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
    datasets: [{ type: Schema.Types.ObjectId, ref: 'Dataset' }]
  },
  { timestamps: true }
)

export default model('Collection', collectionSchema)
