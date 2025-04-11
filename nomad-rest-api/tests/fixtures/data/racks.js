import mongoose from 'mongoose'
import { testExpOne, testExpFive } from './experiments.js'
import { testParamSet1 } from './parameterSets.js'
import { testUserAdmin, testUserOne } from './users.js'
import { testGroupTwo } from './groups.js'
import { testInstrOne } from './instruments.js'

export const testRackOne = {
  _id: new mongoose.Types.ObjectId(),
  title: 'TEST RACK 1',
  isOpen: false,
  slotsNumber: 3,
  rackType: 'Group',
  samples: [
    {
      slot: 1,
      dataSetName: testExpOne.datasetName,
      user: { id: testUserOne._id },
      instrument: { id: testInstrOne._id, name: testInstrOne.name },
      status: 'Booked',
      solvent: 'CDCl3',
      title: 'Test sample',
      tubeId: '12345',
      exps: [{ paramSet: testParamSet1.name }]
    },
    {
      slot: 2,
      dataSetName: 'newDataset',
      user: {
        id: testUserAdmin._id,
        username: testUserAdmin.username,
        groupId: testGroupTwo._id,
        groupName: testGroupTwo.groupName
      },
      solvent: 'CDCl3',
      title: 'Test sample 2',
      tubeId: '12345A',
      exps: [{ paramSet: testParamSet1.name }]
    },
    {
      slot: 3,
      dataSetName: testExpFive.datasetName,
      user: { id: testUserAdmin._id },
      solvent: 'CDCl3',
      title: 'Test sample 3',
      tubeId: '12345B',
      status: 'Submitted',
      exps: [{ paramSet: testParamSet1.name }]
    }
  ]
}

export const testRackTwo = {
  _id: new mongoose.Types.ObjectId(),
  title: 'TEST RACK 2',
  isOpen: true,
  slotsNumber: 60,
  rackType: 'Instrument',
  instrument: testInstrOne._id,
  samples: []
}

export const testRackThree = {
  _id: new mongoose.Types.ObjectId(),
  title: 'TEST RACK 3',
  isOpen: false,
  slotsNumber: 96,
  rackType: 'Instrument',
  instrument: testInstrOne._id,
  sampleJet: true,
  samples: [
    {
      slot: 1,
      user: {
        id: testUserAdmin._id,
        username: testUserAdmin.username,
        groupId: testGroupTwo._id,
        groupName: testGroupTwo.groupName
      },
      solvent: 'CDCl3',
      title: 'Test sample',
      exps: [{ paramSet: testParamSet1.name }]
    }
  ]
}
