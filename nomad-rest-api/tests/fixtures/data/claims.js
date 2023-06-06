import mongoose from 'mongoose'
import { testUserOne } from './users'
import { testInstrOne } from './instruments'
import { testGroupOne } from './groups'
import moment from 'moment'

export const testClaimOne = {
  _id: new mongoose.Types.ObjectId(),
  instrument: testInstrOne._id,
  user: testUserOne._id,
  group: testGroupOne._id,
  folders: ['test-exp-folder'],
  expTime: '2',
  status: 'Approved',
  createdAt: moment().subtract(4, 'days')
}
export const testClaimTwo = {
  _id: new mongoose.Types.ObjectId(),
  instrument: testInstrOne._id,
  user: testUserOne._id,
  group: testGroupOne._id,
  folders: ['test-exp-folder'],
  expTime: '12',
  status: 'Pending',
  createdAt: moment().subtract(2, 'days')
}
