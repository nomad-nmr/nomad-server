import { it, expect, describe, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import { getSubmitter } from '../server.js'

import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserAdmin, testUserOne } from './fixtures/data/users.js'
import { testInstrOne } from './fixtures/data/instruments.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

vi.mock('../server.js', () => ({
  getSubmitter: vi.fn(() => ({
    isConnected: vi.fn(() => true)
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
    console.log(body)
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
    expect(body.errors[0].msg).toBe('Instrument name minimum length is 3')
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
    expect(body.errors[0].msg).toBe(`Max length of model info is 50`)
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
})
