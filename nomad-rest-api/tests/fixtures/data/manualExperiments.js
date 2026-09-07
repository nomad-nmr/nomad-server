import mongoose from 'mongoose'

import { testUserOne, testUserThree } from './users'
import { testGroupOne, testGroupTwo } from './groups'
import { testInstrOne, testInstrThree } from './instruments'

export const testManualExpOne = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2408011200-1-1-test1-10',
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
  datasetName: '2408011200-1-1-test1',
  expNo: '10',
  solvent: 'CDCl3',
  pulseProgram: 'zg30',
  title: 'Manual Exp 1',
  dateCreated: new Date('2024-08-01T12:00:00.000Z'),
  dataPath: './test/path'
}

export const testManualExpTwo = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2408011200-1-1-test1-2',
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
  datasetName: '2408011200-1-1-test1',
  expNo: '2',
  solvent: 'CDCl3',
  pulseProgram: 'zgpg30',
  title: 'Manual Exp 2',
  dateCreated: new Date('2024-08-01T12:10:00.000Z'),
  dataPath: './test/path'
}

export const testManualExpThree = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2408011200-1-1-test1-11',
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
  datasetName: '2408011200-1-1-test1',
  expNo: '11',
  solvent: 'C6D6',
  pulseProgram: 'zg30',
  title: 'Manual Exp 3',
  dateCreated: new Date('2024-08-01T12:20:00.000Z'),
  dataPath: './test/path'
}

export const testManualExpFour = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2408021200-1-1-test3-10',
  instrument: {
    name: testInstrThree.name,
    id: testInstrThree._id
  },
  user: {
    username: testUserThree.username,
    id: testUserThree._id
  },
  group: {
    name: testGroupTwo.groupName,
    id: testGroupTwo._id
  },
  datasetName: '2408021200-1-1-test3',
  expNo: '10',
  solvent: 'CDCl3',
  pulseProgram: 'zg30',
  title: 'Manual Exp 4',
  dateCreated: new Date('2024-08-02T12:00:00.000Z'),
  dataPath: './test/path'
}
