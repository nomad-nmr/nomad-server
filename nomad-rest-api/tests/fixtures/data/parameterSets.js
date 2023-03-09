import mongoose from 'mongoose'
import { testInstrOne, testInstrTwo } from './instruments'

export const testParamSet1 = {
  _id: new mongoose.Types.ObjectId(),
  name: 'params-1',
  availableOn: [testInstrOne._id]
}

export const testParamSet2 = {
  _id: new mongoose.Types.ObjectId(),
  name: 'params-2',
  availableOn: [testInstrTwo._id]
}

export const testParamsHidden = {
  _id: new mongoose.Types.ObjectId(),
  name: 'hidden-params',
  hidden: true,
  availableOn: [testInstrOne._id, testInstrTwo._id]
}
