import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'

import app from '../app'
import { getSubmitter } from '../server.js'
import { getIO } from '../socket.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserOne, testUserTwo, testUserAdmin } from './fixtures/data/users.js'
import { testGroupTwo } from './fixtures/data/groups.js'
import { testRackOne, testRackTwo, testRackThree } from './fixtures/data/racks.js'
import { testInstrOne } from './fixtures/data/instruments.js'
import { testParamSet1, testParamSet2 } from './fixtures/data/parameterSets.js'

import Rack from '../models/rack.js'
import Instrument from '../models/instrument.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

vi.mock('../server.js', () => ({
  getSubmitter: vi.fn(() => {
    const state = new Map()
    state.set(testInstrOne._id.toString(), {
      socketId: 123,
      usedHolders: new Set([1, 2, 3]),
      bookedHolders: [4]
    })

    return {
      state,
      cancelBookedHolder: vi.fn(),
      updateBookedHolders: vi.fn(),
      resetBookedHolders: vi.fn(),
      postBookHolders: vi.fn(),
      findAvailableHolders: vi.fn(instrumentId => {
        switch (instrumentId) {
          case testInstrOne._id.toString():
            return [5, 6]
          case testInstrThree._id.toString():
            return []
        }
      })
    }
  })
}))

//mocking socket
vi.mock('../socket.js', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn()
    }))
  }))
}))

describe('GET /racks', () => {
  it('should return array of racks', async () => {
    const { body } = await request(app)
      .get('/api/batch-submit/racks')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(3)
    expect(body[1].samples[0].status).toBe('Booked')
    expect(body[1].samples[1].status).not.toBeDefined()
    expect(body[1].samples[2].status).toBe('Booked')
  })
})

describe('POST /racks', () => {
  it('should return error 422 if title is an empty string', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/racks')
      .send({ title: '', slotsNumber: 72 })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Rack title minimum length is 3')
  })

  it('should return error 422 if slots number is an empty string', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/racks')
      .send({ title: 'Test Rack', slotsNumber: '' })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Number of slots must be integer')
  })

  it('should return error 422 if reck title already exists', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/racks')
      .send({ title: testRackOne.title, slotsNumber: 72 })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe(`Error: Rack title ${testRackOne.title} already exists`)
  })

  it('should return error 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .post('/api/batch-submit/racks')
      .send({ title: 'Test Rack', slotsNumber: 72 })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should return error 403 if request is not authorised', async () => {
    await request(app)
      .post('/api/batch-submit/racks')
      .send({ title: 'Test Rack', slotsNumber: 72 })
      .expect(403)
  })

  it('should crate a new rack in DB assigned to test group two', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/racks')
      .send({ title: 'New test rack', slotsNumber: 72, group: testGroupTwo._id })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.title).toBe('NEW TEST RACK')
    expect(body.isOpen).toBe(true)
    expect(body.group).toBe(testGroupTwo._id.toString())

    //assessing change in DB
    const rack = await Rack.findById(body._id)
    expect(rack).toBeDefined()
  })

  it('should crate a new instrument type rack in DB', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/racks')
      .send({
        title: 'New all users rack',
        slotsNumber: 72,
        rackType: 'Instrument',
        instrument: testInstrOne._id
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.group).not.toBeDefined()
    expect(body.instrument).toBe(testInstrOne._id.toString())

    //assessing change in DB
    const rack = await Rack.findById(body._id)
    expect(rack).toBeDefined()
  })
})

describe('PATCH /racks/:rackId', () => {
  it('should return error 403 if request is not authorised', async () => {
    await request(app)
      .patch('/api/batch-submit/racks/' + testRackOne._id)
      .expect(403)
  })

  it('should return error 403 if request is authorised by user with admin access level', async () => {
    await request(app)
      .patch('/api/batch-submit/racks/' + testRackOne._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should return error 404 if request if non existing rack id is provided', async () => {
    const newId = new mongoose.Types.ObjectId()
    await request(app)
      .patch('/api/batch-submit/racks/' + newId)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should close the test rack two', async () => {
    const { body } = await request(app)
      .patch('/api/batch-submit/racks/' + testRackTwo._id)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toBe(testRackTwo._id.toString())

    //asserting change in the DB
    const rack = await Rack.findById(testRackTwo._id)
    expect(rack.isOpen).toBe(false)
  })
})

describe('DELETE /racks/:rackId', () => {
  it('should return error 403 if request is not authorised', async () => {
    await request(app)
      .delete('/api/batch-submit/racks/' + testRackOne._id)
      .expect(403)
  })

  it('should return error 403 if request is authorised by user with admin access level', async () => {
    await request(app)
      .delete('/api/batch-submit/racks/' + testRackOne._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should return error 404 if request if non existing rack id is provided', async () => {
    const newId = new mongoose.Types.ObjectId()
    await request(app)
      .delete('/api/batch-submit/racks/' + newId)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should delete the test rack two', async () => {
    const { body } = await request(app)
      .delete('/api/batch-submit/racks/' + testRackTwo._id)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toBe(testRackTwo._id.toString())

    //asserting change in the DB
    const rack = await Rack.findById(testRackTwo._id)
    expect(rack).toBe(null)
  })
})

describe('POST /sample/:rackId', () => {
  it('should return error 403 if request is not authorised', async () => {
    await request(app)
      .post('/api/batch-submit/sample/' + testRackOne._id)
      .expect(403)
  })

  it('should return error 406 if rack is full', async () => {
    await request(app).post('/api/batch-submit/sample/' + testRackTwo._id)
    const { body } = await request(app)
      .post('/api/batch-submit/sample/' + testRackOne._id)
      .send([
        {
          slot: 1,
          user: { id: testUserOne._id.toString() },
          solvent: 'CDCl3',
          title: 'Test sample 1',
          exps: [{ paramSet: testParamSet1.name }]
        }
      ])
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(406)
  })

  it('should add one sample in test rack two', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/sample/' + testRackTwo._id)
      .send([
        {
          slot: 1,
          user: { id: testUserOne._id.toString() },
          solvent: 'CDCl3',
          title: 'Test sample 1',
          exps: [{ paramSet: testParamSet1.name }]
        }
      ])
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body.rackId).toBe(testRackTwo._id.toString())
    expect(body.data.length).toBe(1)
    expect(body.data[0].user.id).toBe(testUserOne._id.toString())

    //asserting change in the DB
    const rack = await Rack.findById(testRackTwo._id)
    expect(rack.samples.length).toBe(1)
    expect(rack.samples[0].title).toBe('Test sample 1')
    expect(rack.samples[0].addedAt).toBeDefined()
  })
})

describe('DELETE /sample/:rackId/:slot', () => {
  it('should return error 403 if request is not authorised', async () => {
    await request(app)
      .delete('/api/batch-submit/sample/' + testRackOne._id + '/1')
      .expect(403)
  })

  it('should delete the sample in slot 1 from test rack one', async () => {
    const { body } = await request(app)
      .delete('/api/batch-submit/sample/' + testRackOne._id + '/1')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      rackId: testRackOne._id.toString(),
      slot: '1'
    })

    //asserting change in the DB
    const rack = await Rack.findById(testRackOne._id)
    expect(rack.samples.length).toBe(2)
  })
})

describe('POST /book', () => {
  it('should fail with error 403 if request is not authorised', async () => {
    await request(app).post('/api/batch-submit/book').expect(403)
  })

  it('should fail with error 403 if request is authorised by user without admin access', async () => {
    await request(app)
      .post('/api/batch-submit/book')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should book experiments for sample in slot 2 in test rack 1', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/book')
      .send({
        rackId: testRackOne._id,
        instrId: testInstrOne._id,
        slots: [2],
        closeQueue: true
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body.rackId).toBe(testRackOne._id.toString())
    expect(body.samples.length).toBe(1)
    expect(body.samples[0]._id).toBeDefined()
    expect(body.samples[0].dataSetName.split('-')[3]).toBe(testUserAdmin.username)

    expect(getSubmitter).toBeCalled()
    expect(getIO).toBeCalled()

    //asserting change in the DB
    const rack = await Rack.findById(testRackOne._id)
    expect(rack.samples[1].status).toBe('Booked')
    expect(rack.samples[1].holder).toBe(5)

    const instrument = await Instrument.findById(body.samples[0].instrument.id)
    expect(instrument.available).toBe(false)
  })

  it('should book experiments for sample in slot 1 in test rack 3 returning holder 101', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/book')
      .send({
        rackId: testRackThree._id,
        slots: [1],
        rackPosition: 1
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.rackId).toBe(testRackThree._id.toString())
    expect(body.samples.length).toBe(1)
    expect(body.samples[0]._id).toBeDefined()
    expect(body.samples[0].dataSetName.split('-')[3]).toBe(testUserAdmin.username)
    expect(body.samples[0].holder).toBe(101)

    //asserting change in the DB
    const rack = await Rack.findById(testRackThree._id)
    expect(rack.samples[0].status).toBe('Booked')
    expect(rack.samples[0].holder).toBe(101)
  })
})

describe('POST /submit', () => {
  it('should fail with error 403 if request is not authorised', async () => {
    await request(app).post('/api/batch-submit/submit').expect(403)
  })

  it('should fail with error 403 if request is authorised by user without admin access', async () => {
    await request(app)
      .post('/api/batch-submit/submit')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should submit sample in slot 1 of test rack one', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/submit')
      .send({
        rackId: testRackOne._id,
        slots: [1]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.rackId).toBe(testRackOne._id.toString())
    expect(body.samples.length).toBe(1)
    expect(body.samples[0]._id).toBeDefined()
    expect(body.samples[0].dataSetName.split('-')[3]).toBe(testUserOne.username)

    expect(getSubmitter).toBeCalled()
    expect(getIO).toBeCalled()

    //asserting change in the DB
    const rack = await Rack.findById(body.rackId)
    expect(rack.samples[0].status).toBe('Submitted')
  })
})

describe('POST /cancel', () => {
  it('should fail with error 403 if request is not authorised', async () => {
    await request(app).post('/api/batch-submit/submit').expect(403)
  })

  it('should fail with error 403 if request is authorised by user without admin access', async () => {
    await request(app)
      .post('/api/batch-submit/cancel')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should cancel booked experiment for slot 1 in test rack one', async () => {
    const { body } = await request(app)
      .post('/api/batch-submit/cancel')
      .send({
        rackId: testRackOne._id,
        slots: [1]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.rackId).toBe(testRackOne._id.toString())
    expect(body.samples.length).toBe(1)
    expect(body.samples[0].status).not.toBeDefined()
    expect(body.samples[0]._id).toBeDefined()
    expect(body.samples[0].dataSetName.split('-')[3]).toBe(testUserOne.username)

    expect(getSubmitter).toBeCalled()
    expect(getIO).toBeCalled()

    //asserting change in the DB
    const rack = await Rack.findById(body.rackId)
    expect(rack.samples[0].status).not.toBeDefined()
    expect(rack.samples[0].instrument).toMatchObject({})
    expect(rack.samples[0].holder).not.toBeDefined()
  })
})

describe('PATCH /edit/:rackId', () => {
  it('should fail with error 403 if request is not authorised', async () => {
    await request(app)
      .patch('/api/batch-submit/edit/' + testRackOne._id)
      .expect(403)
  })

  it('should edit sample in slot 1 of test rack one', async () => {
    const { body } = await request(app)
      .patch('/api/batch-submit/edit/' + testRackOne._id)
      .send({
        slot: 1,
        title: 'Edited sample',
        tubeId: '123ABC',
        solvent: 'C6D6',
        exps: [{ paramSet: testParamSet2.name }]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body._id).toBe(testRackOne._id.toString())
    expect(body.samples.length).toBe(3)
    expect(body.samples[0].title).toBe('Edited sample')
    expect(body.samples[0].tubeId).toBe('123ABC')
    expect(body.samples[0].solvent).toBe('C6D6')
    expect(body.samples[0].exps[0]).toMatchObject({ paramSet: testParamSet2.name })

    //asserting change in the DB
    const rack = await Rack.findById(body._id)
    expect(rack.samples[0].title).toBe('Edited sample')
    expect(rack.samples[0].tubeId).toBe('123ABC')
    expect(rack.samples[0].solvent).toBe('C6D6')
    expect(rack.samples[0].exps[0]).toMatchObject({ paramSet: testParamSet2.name })
  })
})
