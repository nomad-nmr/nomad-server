import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import User from '../../models/user.js'
import Group from '../../models/group.js'
import Instrument from '../../models/instrument'
import ParameterSet from '../../models/parameterSet.js'
import Claim from '../../models/claim.js'
import Experiment from '../../models/experiment.js'
import Dataset from '../../models/dataset.js'
import Rack from '../../models/rack.js'

import { testUserOne, testUserTwo, testUserAdmin, testUserThree } from './data/users'
import { testGroupOne, testGroupTwo } from './data/groups'
import { testInstrOne, testInstrTwo, testInstrThree } from './data/instruments'
import { testParamSet1, testParamSet2, testParamsHidden } from './data/parameterSets'
import { testClaimOne, testClaimTwo } from './data/claims.js'
import {
  testExpOne,
  testExpTwo,
  testExpThree,
  testExpFour,
  testExpFive
} from './data/experiments.js'
import { testDatasetOne, testDatasetTwo, testDatasetThree } from './data/datasets.js'
import { testRackOne, testRackTwo } from './data/racks.js'

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
  await Experiment.deleteMany()
  await Dataset.deleteMany()
  await Rack.deleteMany()

  await new User(testUserOne).save()
  await new User(testUserTwo).save()
  await new User(testUserAdmin).save()
  await new User(testUserThree).save()

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

  await new Experiment(testExpOne).save()
  await new Experiment(testExpTwo).save()
  await new Experiment(testExpThree).save()
  await new Experiment(testExpFour).save()
  await new Experiment(testExpFive).save()

  await new Dataset(testDatasetOne).save()
  await new Dataset(testDatasetTwo).save()
  await new Dataset(testDatasetThree).save()

  await new Rack(testRackOne).save()
  await new Rack(testRackTwo).save()
}
