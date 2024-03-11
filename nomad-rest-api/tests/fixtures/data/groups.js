import mongoose from 'mongoose'

export const testGroupOne = {
  _id: new mongoose.Types.ObjectId(),
  groupName: 'test-group-1',
  isActive: false,
  description: 'Test Group One',
  isBatch: false,
  dataAccess: 'user'
}

export const testGroupTwo = {
  _id: new mongoose.Types.ObjectId(),
  groupName: 'test-admins',
  isActive: true,
  description: 'Admins test group',
  isBatch: true,
  exUsers: []
}
