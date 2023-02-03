import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import User from '../../models/user.js'
import Group from '../../models/group.js'
import { testUserOne, testUserTwo, testUserAdmin } from './data/users'
import { testGroupOne, testGroupTwo } from './data/groups'

let mongo = null

export const connectDB = async () => {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  mongoose.set('returnOriginal', false)
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
}

export const dropDB = async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongo.stop()
  }
}

export const setupDB = async () => {
  await User.deleteMany()
  await Group.deleteMany()

  await new User(testUserOne).save()
  await new User(testUserTwo).save()
  await new User(testUserAdmin).save()

  testGroupTwo.exUsers = []
  testGroupTwo.exUsers.push(testUserOne._id)
  await new Group(testGroupOne).save()
  await new Group(testGroupTwo).save()
}
