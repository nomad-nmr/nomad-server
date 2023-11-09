import fs from 'fs'
import path from 'path'

import moment from 'moment'
import mongoose from 'mongoose'

import { testGroupOne } from './groups'
import { testUserOne, testUserTwo, testUserThree } from './users'
import { testExpOne } from './experiments'

const molfile = fs.readFileSync(path.join(__dirname, 'molecule2.mol')).toString()

export const testDatasetOne = {
  _id: new mongoose.Types.ObjectId(),
  title: 'Test dataset 1',
  user: testUserOne._id,
  group: testGroupOne._id,
  tags: ['test'],
  smiles: ['C1(CCC(O1)C=CC)'],
  createdAt: moment().subtract(4, 'days'),
  nmriumData: {
    data: {
      spectra: [
        {
          id: testExpOne._id,
          info: { type: 'NMR Spectrum', isFid: false },
          dataType: 'auto'
        },
        {
          id: testExpOne._id.toString() + '/fid/12345',
          info: { type: 'NMR FID', isFid: true },
          dataType: 'auto'
        }
      ],
      molecules: [{ molfile }]
    }
  }
}
export const testDatasetTwo = {
  _id: new mongoose.Types.ObjectId(),
  title: 'Test dataset 2',
  user: testUserTwo._id,
  group: testGroupOne._id,
  tags: [],
  createdAt: moment().subtract(2, 'days'),
  smiles: ['C1(=CC(=CC=C1OC)C)'],
  nmriumData: {
    data: {
      spectra: [
        {
          id: testExpOne._id,
          info: { type: 'NMR Spectrum', isFid: false },
          dataType: 'auto'
        },
        {
          id: testExpOne._id.toString() + '/fid/12345',
          info: { type: 'NMR FID', isFid: true },
          dataType: 'auto'
        }
      ],
      molecules: []
    }
  }
}

export const testDatasetThree = {
  _id: new mongoose.Types.ObjectId(),
  title: 'Test dataset 3',
  user: testUserThree._id,
  group: testGroupOne._id,
  createdAt: moment().subtract(20, 'days'),

  tags: [],
  smiles: [],
  nmriumData: {
    data: {
      spectra: [
        {
          id: testExpOne._id,
          info: { type: 'NMR Spectrum', isFid: false },
          dataType: 'auto'
        }
      ],
      molecules: []
    }
  }
}
