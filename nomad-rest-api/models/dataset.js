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
    smiles: Array,
    nmriumData: Object,
    tags: Array,
    inCollections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }]
  },
  { timestamps: true }
)

export default model('Dataset', datasetSchema)
