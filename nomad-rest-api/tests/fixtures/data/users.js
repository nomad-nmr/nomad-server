const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const { testGroupOne, testGroupTwo } = require('./groups')

const testUserOneId = new mongoose.Types.ObjectId()
const testUserOne = {
  _id: testUserOneId,
  username: 'test1',
  fullName: 'Test User One',
  email: 'test1@example.com',
  password: 'SuperSecret1',
  isActive: false,
  group: testGroupOne._id,
  accessLevel: 'user',
  lastLogin: moment().subtract(2, 'days'),
  tokens: [
    {
      token: jwt.sign({ _id: testUserOneId }, process.env.JWT_SECRET)
    }
  ]
}

const testUserTwoId = new mongoose.Types.ObjectId()
const testUserTwo = {
  _id: testUserTwoId,
  username: 'test2',
  fullName: 'Test User Two',
  email: 'test2@example.com',
  password: 'SuperSecret12',
  accessLevel: 'user-a',
  isActive: true,
  group: testGroupOne._id,
  tokens: [
    {
      token: jwt.sign({ _id: testUserTwoId }, process.env.JWT_SECRET)
    }
  ]
}

const testUserAdminId = new mongoose.Types.ObjectId()
const testUserAdmin = {
  _id: testUserAdminId,
  username: 'admin',
  fullName: 'Admin User',
  accessLevel: 'admin',
  email: 'admin@example.com',
  password: 'SuperSecret123',
  isActive: true,
  group: testGroupTwo._id,
  lastLogin: moment(),
  tokens: [
    {
      token: jwt.sign({ _id: testUserAdminId }, process.env.JWT_SECRET)
    }
  ]
}

module.exports = {
  testUserOne,
  testUserTwo,
  testUserAdmin
}
