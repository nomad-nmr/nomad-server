const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const User = require('../../models/user')
const Group = require('../../models/group')
const { testUserOne, testUserTwo, testUserAdmin } = require('./data/users')
const { testGroupOne, testGroupTwo } = require('./data/groups')

let mongo = null

const connectDB = async () => {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  mongoose.set('returnOriginal', false)
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
}

const dropDB = async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongo.stop()
  }
}

const setupDB = async () => {
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

module.exports = { connectDB, dropDB, setupDB }
