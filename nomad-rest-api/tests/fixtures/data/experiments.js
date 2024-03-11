import mongoose from 'mongoose'
import moment from 'moment'

import { testUserOne, testUserTwo, testUserThree } from './users'
import { testGroupOne } from './groups'
import { testParamSet1, testParamSet2 } from './parameterSets'
import { testInstrOne, testInstrTwo } from './instruments'

export const testExpOne = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2106231050-2-1-test1-10',
  instrument: {
    name: testInstrOne.name,
    id: testInstrOne._id
  },
  user: {
    username: testUserOne.username,
    id: testUserOne._id
  },
  group: {
    name: testGroupOne.groupName,
    id: testGroupOne._id
  },
  datasetName: '2106231050-2-1-test1',
  status: 'Archived',
  title: 'Test Exp 1',
  parameterSet: testParamSet1.name,
  expNo: '10',
  holder: '2',
  dataPath: './test/path',
  solvent: 'CDCl3'
}

export const testExpTwo = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2106231050-2-1-test1-11',
  instrument: {
    name: testInstrOne.name,
    id: testInstrOne._id
  },
  user: {
    username: testUserOne.username,
    id: testUserOne._id
  },
  group: {
    name: testGroupOne.groupName,
    id: testGroupOne._id
  },
  datasetName: '2106231050-2-1-test1',
  status: 'Archived',
  title: 'Test Exp 1',
  parameterSet: testParamSet2.name,
  expNo: '11',
  holder: '2',
  dataPath: './test/path',
  solvent: 'CDCl3'
}

export const testExpThree = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2106231055-3-2-test2-10',
  instrument: {
    name: testInstrTwo.name,
    id: testInstrTwo._id
  },
  user: {
    username: testUserTwo.username,
    id: testUserTwo._id
  },
  group: {
    name: testGroupOne.groupName,
    id: testGroupOne._id
  },
  datasetName: '2106231055-3-2-test2',
  status: 'Archived',
  title: 'Test Exp 3',
  parameterSet: testParamSet2.name,
  expNo: '10',
  holder: '3',
  dataPath: './test/path',
  solvent: 'C6D6'
}

export const testExpFour = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2106231100-10-2-test2-10',
  instrument: {
    name: testInstrTwo.name,
    id: testInstrTwo._id
  },
  user: {
    username: testUserThree.username,
    id: testUserThree._id
  },
  group: {
    name: testGroupOne.groupName,
    id: testGroupOne._id
  },
  datasetName: '2106231100-10-2-test3',
  status: 'Archived',
  title: 'Test Exp 4',
  parameterSet: testParamSet1.name,
  expNo: '10',
  holder: '10',
  dataPath: './test/path',
  solvent: 'C6D6'
}

export const testExpFive = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2106240012-10-2-test2-10',
  instrument: {
    name: testInstrTwo.name,
    id: testInstrTwo._id
  },
  user: {
    username: testUserThree.username,
    id: testUserThree._id
  },
  group: {
    name: testGroupOne.groupName,
    id: testGroupOne._id
  },
  datasetName: '2106240012-10-2-test2',
  status: 'Available',
  title: 'Test Exp 5',
  parameterSet: testParamSet1.name,
  expNo: '10',
  holder: '10',
  dataPath: './test/path',
  solvent: 'C6D6'
}
