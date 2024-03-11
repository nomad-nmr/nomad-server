import mongoose from 'mongoose'
import { testExpOne, testExpFive } from './experiments.js'
import { testParamSet1 } from './parameterSets.js'
import { testUserAdmin } from './users.js'
import { testGroupTwo } from './groups.js'
import { testInstrOne } from './instruments.js'

export const testRackOne = {
  _id: new mongoose.Types.ObjectId(),
  title: 'TEST RACK 1',
  isOpen: false,
  slotsNumber: 3,
  samples: [
    {
      slot: 1,
      dataSetName: testExpOne.datasetName,
      user: { id: testUserAdmin._id },
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
  samples: []
}
