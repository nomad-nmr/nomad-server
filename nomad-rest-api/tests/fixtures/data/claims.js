import mongoose from 'mongoose'
import { testUserOne, testUserThree } from './users'
import { testInstrOne } from './instruments'
import { testGroupOne, testGroupTwo } from './groups'
import { testGrantOne } from './grants'

import moment from 'moment'

export const testClaimOne = {
  _id: new mongoose.Types.ObjectId(),
  instrument: testInstrOne._id,
  user: testUserOne._id,
  group: testGroupOne._id,
  folders: ['test-exp-folder'],
  expTime: '2',
  status: 'Approved',
  createdAt: moment().subtract(4, 'days'),
  grantCosting: {
    grantId: testGrantOne._id,
    cost: 10
  }
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
export const testClaimThree = {
  _id: new mongoose.Types.ObjectId(),
  instrument: testInstrOne._id,
  user: testUserThree._id,
  group: testGroupTwo._id,
  folders: ['test-exp-folder'],
  expTime: '6',
  status: 'Approved',
  createdAt: moment().subtract(5, 'days')
}
