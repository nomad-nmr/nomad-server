import mongoose from 'mongoose'

import { testUserOne, testUserTwo, testUserThree } from './users'
import { testGroupOne, testGroupTwo } from './groups'
import { testParamSet1, testParamSet2 } from './parameterSets'
import { testInstrOne, testInstrTwo, testInstrThree } from './instruments'
import { testGrantOne, testGrantTwo } from './grants'

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
  solvent: 'CDCl3',
  grantCosting: {
    grantId: testGrantOne._id,
    cost: 1
  }
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
  solvent: 'CDCl3',
  grantCosting: {
    grantId: testGrantOne._id,
    cost: 2
  }
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
  solvent: 'C6D6',
  grantCosting: {
    grantId: testGrantTwo._id,
    cost: 3
  }
}

export const testExpFour = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2106231100-10-2-test3-10',
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
  solvent: 'C6D6',
  grantCosting: {
    grantId: testGrantTwo._id,
    cost: 4
  }
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

export const testExpSix = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2106241100-10-2-test3-10',
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
  datasetName: '2106241100-10-2-test3',
  status: 'Archived',
  title: 'Test Exp 6',
  parameterSet: testParamSet1.name,
  expNo: '10',
  holder: '10',
  dataPath: './test/path',
  solvent: 'CDCl3',
  totalExpTime: '00:05:00',
  submittedAt: new Date('2025-01-01T00:00:00.000Z')
}

export const testExpSeven = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2106241100-10-2-test4-1',
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
  datasetName: '2106241100-10-2-test4',
  status: 'Archived',
  title: 'Test Exp 7',
  parameterSet: testParamSet1.name,
  expNo: '10',
  holder: '11',
  dataPath: './test/path',
  solvent: 'CDCl3',
  totalExpTime: '00:00:00',
  submittedAt: new Date('2024-01-01T00:00:00.000Z')
}
export const testExpEight = {
  _id: new mongoose.Types.ObjectId(),
  expId: '2501291553-5-2-tl12-10',
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
  datasetName: '2501291553-5-2-tl12',
  status: 'Available',
  title: 'Test run || 1H Observe',
  parameterSet: testParamSet1.name,
  expNo: '10',
  holder: '1',
  dataPath: './test/path',
  solvent: 'CDCl3',
  totalExpTime: '00:00:00',
  submittedAt: new Date('2025-01-29T15:41:00.000Z')
}
