import mongoose from 'mongoose'

import { testUserOne } from './users'
import { testGroupOne, testGroupTwo } from './groups'
import { testDatasetTwo } from './datasets'

export const testCollectionOne = {
  _id: new mongoose.Types.ObjectId(),
  title: 'Old Collection',
  user: testUserOne._id,
  group: testGroupOne._id,
  datasets: [testDatasetTwo._id],
  sharedWith: [{ name: testGroupTwo.groupName, type: 'group', id: testGroupTwo._id.toString() }]
}
