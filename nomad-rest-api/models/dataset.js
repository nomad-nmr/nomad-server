import { Schema, model } from 'mongoose'

const datasetSchema = new Schema(
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
    nmriumData: Object
  },
  { timestamps: true }
)

export default model('Dataset', datasetSchema)
