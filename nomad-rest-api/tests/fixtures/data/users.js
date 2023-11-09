import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import { testGroupOne, testGroupTwo } from './groups'

const testUserOneId = new mongoose.Types.ObjectId()
export const testUserOne = {
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
export const testUserTwo = {
  _id: testUserTwoId,
  username: 'test2',
  fullName: 'Test User Two',
  email: 'test2@example.com',
  password: 'SuperSecret12',
  accessLevel: 'user-a',
  dataAccess: 'group',
  isActive: true,
  group: testGroupOne._id,
  tokens: [
    {
      token: jwt.sign({ _id: testUserTwoId }, process.env.JWT_SECRET)
    }
  ]
}

const testUserThreeId = new mongoose.Types.ObjectId()
export const testUserThree = {
  _id: testUserThreeId,
  username: 'test3',
  fullName: 'Test User Three',
  email: 'test3@example.com',
  password: 'SuperSecret123',
  accessLevel: 'user',
  isActive: true,
  group: testGroupTwo._id,
  dataAccess: 'group',
  lastLogin: moment().subtract(3, 'days'),
  tokens: [
    {
      token: jwt.sign({ _id: testUserThreeId }, process.env.JWT_SECRET)
    }
  ]
}

const testUserAdminId = new mongoose.Types.ObjectId()
export const testUserAdmin = {
  _id: testUserAdminId,
  username: 'admin',
  fullName: 'Admin User',
  accessLevel: 'admin',
  dataAccess: 'admin',
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
