const mongoose = require('mongoose')

const testGroupOne = {
  _id: new mongoose.Types.ObjectId(),
  groupName: 'test-group-1',
  isActive: false,
  description: 'Test Group One',
  isBatch: false
}

const testGroupTwo = {
  _id: new mongoose.Types.ObjectId(),
  groupName: 'test-admins',
  isActive: true,
  description: 'Admins test group',
  exUsers: []
}

module.exports = {
  testGroupOne,
  testGroupTwo
}
