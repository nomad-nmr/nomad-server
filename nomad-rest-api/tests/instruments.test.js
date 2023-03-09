import { it, expect, describe, beforeEach, beforeAll, afterAll, vi, test } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'

import app from '../app.js'
import { getSubmitter } from '../server.js'
import { getIO } from '../socket.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserAdmin, testUserOne } from './fixtures/data/users.js'
import { testInstrOne } from './fixtures/data/instruments.js'
import Instrument from '../models/instrument.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

vi.mock('../server.js', () => ({
  getSubmitter: vi.fn(() => ({
    isConnected: vi.fn(() => true)
  }))
}))

vi.mock('../socket.js', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn()
    }))
  }))
}))

describe('GET /admin/instruments/', () => {
  it('should return simple list for use in dropdown select containing one active instrument', async () => {
    const { body } = await request(app)
      .get('/admin/instruments/?list=true')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body.length).toBe(1)
    expect(body[0]).toMatchObject({
      id: testInstrOne._id,
      name: 'instrument-1',
      available: true
    })
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app).get('/admin/instruments/?showInactive=false&list=true').expect(403)
  })

  it('should return full list of  all instruments in DB', async () => {
    const { body } = await request(app)
      .get('/admin/instruments/?showInactive=true')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(getSubmitter).toBeCalled()
    expect(body.length).toBe(2)
    expect(body[0].name).toBe(testInstrOne.name)
    expect(body[0].isConnected).toBe(true)
    expect(body[0].paramsEditing).toBe(true)
  })
})

describe('POST /admin/instruments/', () => {
  it('should fail with status 422 if empty string is provided as name', async () => {
    const { body } = await request(app)
      .post('/admin/instruments')
      .send({
        name: '',
        model: 'Bruker test',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Instrument name minimum length is 3 and maximum 15')
  })

  it('should fail with status 422 if existing instrument name is provided', async () => {
    const { body } = await request(app)
      .post('/admin/instruments')
      .send({
        name: testInstrOne.name,
        model: 'Bruker test',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe(`Error: Instrument name ${testInstrOne.name} already exists`)
  })

  it('should fail with status 422 if model info with more than 50 characters is provided', async () => {
    const { body } = await request(app)
      .post('/admin/instruments')
      .send({
        name: 'instrument-3',
        model: 'Bruker test xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe(`Max length of model info is 30`)
  })

  it('should fail with status 422 if capacity provided is not inetger number', async () => {
    const { body } = await request(app)
      .post('/admin/instruments')
      .send({
        name: 'instrument-3',
        model: 'Bruker test',
        capacity: 60.2
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe(`Capacity must be an integer`)
  })

  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .post('/admin/instruments')
      .send({
        name: 'instrument-3',
        model: 'Bruker test',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .post('/admin/instruments')
      .send({
        name: 'instrument-3',
        model: 'Bruker test',
        capacity: 60
      })
      .expect(403)
  })

  it('should should add new instrument in the database', async () => {
    const { body } = await request(app)
      .post('/admin/instruments')
      .send({
        name: 'instrument-3',
        model: 'Bruker test',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(201)
    expect(body).toHaveProperty('name', 'instrument-3')
    expect(body).toHaveProperty('available', false)
    expect(body.status.summary).toBeDefined()

    //asserting change in DB
    const instrument = await Instrument.findById(body._id)
    expect(instrument.name).toBe('instrument-3')
  })
})

describe('PUT /admin/instruments/', () => {
  it('should fail with status 422 if empty string is provided as name', async () => {
    const { body } = await request(app)
      .put('/admin/instruments')
      .send({
        _id: testInstrOne._id,
        name: '',
        model: 'Bruker test',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Instrument name minimum length is 3 and maximum 15')
  })

  it('should fail with status 422 if model info with more than 50 characters is provided', async () => {
    const { body } = await request(app)
      .put('/admin/instruments')
      .send({
        _id: testInstrOne._id,
        name: 'instrument-1',
        model: 'Bruker test xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe(`Max length of model info is 30`)
  })

  it('should fail with status 422 if capacity provided is not inetger number', async () => {
    const { body } = await request(app)
      .put('/admin/instruments')
      .send({
        _id: testInstrOne._id,
        name: 'instrument-1',
        model: 'Bruker test',
        capacity: 60.2
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Capacity must be an integer')
  })

  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .put('/admin/instruments')
      .send({
        _id: testInstrOne._id,
        name: 'instrument-1',
        model: 'Bruker test',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .put('/admin/instruments')
      .send({
        _id: testInstrOne._id,
        name: 'instrument-1',
        model: 'Bruker test',
        capacity: 60
      })
      .expect(403)
  })

  it('should fail with status 404 if wrong instrument id is provided', async () => {
    await request(app)
      .put('/admin/instruments')
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: 'instrument-1',
        model: 'Bruker test',
        capacity: 60
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should update testInsrOne entry in database', async () => {
    const { body } = await request(app)
      .put('/admin/instruments')
      .send({
        _id: testInstrOne._id,
        name: 'new instr1',
        model: 'Bruker Neo test',
        capacity: 24
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(getSubmitter).toBeCalled()
    expect(body.capacity).toBe(24)
    expect(body.name).toBe('new instr1')
    expect(body.model).toBe('Bruker Neo test')
    expect(body.isConnected).toBe(true)

    //asserting change in DB
    const instrument = await Instrument.findById(testInstrOne._id)
    expect(instrument.name).toBe('new instr1')
  })
})

describe('PATCH /toggle-available/', () => {
  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .patch('/admin/instruments/toggle-available/' + testInstrOne._id.toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .patch('/admin/instruments/toggle-available/' + testInstrOne._id.toString())
      .expect(403)
  })

  it('should fail with status 404 if invalid instrument id is provided ', async () => {
    await request(app)
      .patch('/admin/instruments/toggle-available/' + new mongoose.Types.ObjectId())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should toggle available status of instrument-1', async () => {
    await request(app)
      .patch('/admin/instruments/toggle-available/' + testInstrOne._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(getIO).toBeCalled()

    //asserting change in DB
    const instrument = await Instrument.findById(testInstrOne._id)
    expect(instrument.available).toBe(false)
  })
})

describe('PATCH /toggle-active/', () => {
  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .patch('/admin/instruments/toggle-active/' + testInstrOne._id.toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .patch('/admin/instruments/toggle-active/' + testInstrOne._id.toString())
      .expect(403)
  })

  it('should fail with status 404 if invalid instrument id is provided ', async () => {
    await request(app)
      .patch('/admin/instruments/toggle-active/' + new mongoose.Types.ObjectId())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should toggle active status of instrument-1', async () => {
    const { body } = await request(app)
      .patch('/admin/instruments/toggle-active/' + testInstrOne._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      message: 'Instrument active status updated',
      _id: testInstrOne._id
    })

    //asserting change in DB
    const instrument = await Instrument.findById(testInstrOne._id)
    expect(instrument.isActive).toBe(false)
  })
})
