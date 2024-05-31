import { Schema, model } from 'mongoose'

const grantSchema = new Schema({
  grantCode: {
    type: String,
    required: true
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
  exclude: [
    {
      username: String,
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      }
    }
  ]
})

export default model('Grant', grantSchema)
