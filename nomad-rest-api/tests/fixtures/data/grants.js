import mongoose from 'mongoose'
import { testUserOne } from './users'
import { testGroupOne } from './groups'

export const testGrantOne = {
  _id: new mongoose.Types.ObjectId(),
  grantCode: 'XX-TEST-1-YY',
  description: 'Test Grant One',
  include: [
    {
      isGroup: false,
      name: testUserOne.username,
      id: testUserOne._id
    }
  ],
  multiplier: 1
}

const testGrantTwoId = new mongoose.Types.ObjectId()
export const testGrantTwo = {
  _id: testGrantTwoId,
  grantCode: 'XX-TEST-2-YY',
  description: 'Test Grant Two',
  include: [
    {
      isGroup: true,
      name: testGroupOne.groupName,
      id: testGroupOne._id
    }
  ],
  multiplier: 2
}
