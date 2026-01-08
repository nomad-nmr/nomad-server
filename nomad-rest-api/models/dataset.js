import { Schema, model } from 'mongoose'

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false } // no need of ids for now
);

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
    comments: [commentSchema],
    smiles: Array,
    nmriumData: Object,
    tags: Array,
    inCollections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    sampleManagerData: [Object]
  },
  { timestamps: true }
)

export default model('Dataset', datasetSchema)
