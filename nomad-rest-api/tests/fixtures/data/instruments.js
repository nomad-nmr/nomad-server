import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'

const getStatus = filename => {
  const absPath = path.join(__dirname, filename)
  const inputJson = fs.readFileSync(absPath)
  return JSON.parse(inputJson)
}

export const testInstrOne = {
  _id: new mongoose.Types.ObjectId(),
  status: {
    statusTable: []
  },
  name: 'instrument-1',
  isActive: true,
  available: true,
  capacity: 60,
  dayAllowance: 20,
  nightAllowance: 195,
  overheadTime: 255,
  cost: 3
}

export const testInstrTwo = {
  _id: new mongoose.Types.ObjectId(),
  status: {
    statusTable: []
  },
  name: 'instrument-2',
  isActive: false,
  available: false,
  capacity: 60,
  cost: 2
}

export const testInstrThree = {
  _id: new mongoose.Types.ObjectId(),
  name: 'instrument-3',
  isActive: true,
  available: true,
  capacity: 24,
  status: {
    summary: { dayExpt: '00:00', nightExpt: '00:00' },
    statusTable: await getStatus('status-db.json')
  },
  cost: 2,
  dayAllowance: 20,
  nightAllowance: 195,
  overheadTime: 255,
  nightEnd: '09:00',
  nightStart: '19:00'
}
