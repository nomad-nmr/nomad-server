import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import User from '../../models/user.js'
import Group from '../../models/group.js'
import Instrument from '../../models/instrument'
import ParameterSet from '../../models/parameterSet.js'
import Claim from '../../models/claim.js'

import { testUserOne, testUserTwo, testUserAdmin } from './data/users'
import { testGroupOne, testGroupTwo } from './data/groups'
import { testInstrOne, testInstrTwo, testInstrThree } from './data/instruments'
import { testParamSet1, testParamSet2, testParamsHidden } from './data/parameterSets'
import { testClaimOne, testClaimTwo } from './data/claims.js'

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
  await Instrument.deleteMany()
  await ParameterSet.deleteMany()
  await Claim.deleteMany()

  await new User(testUserOne).save()
  await new User(testUserTwo).save()
  await new User(testUserAdmin).save()

  testGroupTwo.exUsers = []
  testGroupTwo.exUsers.push(testUserOne._id)
  await new Group(testGroupOne).save()
  await new Group(testGroupTwo).save()

  await new Instrument(testInstrOne).save()
  await new Instrument(testInstrTwo).save()
  await new Instrument(testInstrThree).save()

  await new ParameterSet(testParamSet1).save()
  await new ParameterSet(testParamSet2).save()
  await new ParameterSet(testParamsHidden).save()

  await new Claim(testClaimOne).save()
  await new Claim(testClaimTwo).save()
}
