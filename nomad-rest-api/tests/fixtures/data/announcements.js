import mongoose from 'mongoose'

export const testAnnouncementOne = {
  _id: new mongoose.Types.ObjectId(),
  key: 'homepage-announcement',
  title: 'Test announcement',
  body: 'Instrument-1 is down for service',
  kind: 'warning'
}
