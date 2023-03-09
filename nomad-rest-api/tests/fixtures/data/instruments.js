import mongoose from 'mongoose'

export const testInstrOne = {
  _id: new mongoose.Types.ObjectId(),
  name: 'instrument-1',
  isActive: true,
  available: true,
  capacity: 60
}

export const testInstrTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'instrument-2',
  isActive: false,
  available: false,
  capacity: 24
}
