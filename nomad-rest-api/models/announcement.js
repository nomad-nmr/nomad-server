import { Schema, model } from 'mongoose'

const announcementSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      maxLength: 200
    },
    body: {
      type: String,
      required: true
    },
    kind: {
      type: String,
      enum: ['info', 'warning', 'news'],
      default: 'info'
    }
  },
  { timestamps: true }
)

export default model('Announcement', announcementSchema)

