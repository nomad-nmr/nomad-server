import { Schema, model } from 'mongoose'

const grantSchema = new Schema({
  grantCode: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  include: [
    {
      isGroup: Boolean,
      name: String,
      id: {
        type: Schema.Types.ObjectId,
        required: true
      }
    }
  ],
  multiplier: {
    type: Number,
    required: true,
    default: 1
  }
})

export default model('Grant', grantSchema)
