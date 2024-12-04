import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import { connectDB, dropDB, setupDB } from './fixtures/db'

import { testUserAdmin, testUserOne, testUserThree } from './fixtures/data/users.js'
import { testGroupTwo } from './fixtures/data/groups.js'
import { testInstrOne, testInstrThree } from './fixtures/data/instruments.js'
import { testGrantOne, testGrantTwo } from './fixtures/data/grants.js'

import Instrument from '../models/instrument.js'
import Grant from '../models/grant.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('GET /accounts/data', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).get('/api/admin/accounts/data').expect(403)
  })

  it('should fail with status code 403 if user is authorised by user without admin privileges', async () => {
    await request(app)
      .get('/api/admin/accounts/data')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should return data array of length 2 with the first object corresponding to testGroupTwo', async () => {
    const { body } = await request(app)
      .get('/api/admin/accounts/data/?groupId=undefined')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(2)
    expect(body[0].name).toBe(testGroupTwo.groupName)
    expect(body[0].totalCost).toBe(18.17)
  })

  it('should return data array of length 2 the first object corresponding to testUserThree', async () => {
    const { body } = await request(app)
      .get('/api/admin/accounts/data/?groupId=' + testGroupTwo._id)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(2)
    expect(body[0].name).toMatch(testUserThree.username + ' - ' + testUserThree.fullName)

    expect(body[0].totalCost).toBe(18.17)
  })
})

describe('GET /accounts/instruments-costing', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).get('/api/admin/accounts/instruments-costing').expect(403)
  })

  it('should fail with status code 403 if user is authorised by user without admin privileges', async () => {
    await request(app)
      .get('/api/admin/accounts/instruments-costing')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should data array of length 2 the first object corresponding to testInstrumentOne', async () => {
    const { body } = await request(app)
      .get('/api/admin/accounts/instruments-costing')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(2)
    expect(body[0].name).toBe(testInstrOne.name)
    expect(body[0].cost).toBe(testInstrOne.cost)
  })
})

describe('PUT /accounts/instruments-costing', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).put('/api/admin/accounts/instruments-costing').expect(403)
  })

  it('should fail with status code 403 if user is authorised by user without admin privileges', async () => {
    await request(app)
      .put('/api/admin/accounts/instruments-costing')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should update the cost of testInstrumentOne to 5', async () => {
    const reqData = {}
    reqData[testInstrOne.name] = 5
    reqData[testInstrThree.name] = testInstrThree.cost

    await request(app)
      .put('/api/admin/accounts/instruments-costing')
      .send(reqData)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    //asserting change in DB
    const instruments = await Instrument.find({ isActive: true }, 'name cost')
    expect(instruments[0].name).toBe(testInstrOne.name)
    expect(instruments[0].cost).toBe(5)
  })
})

describe('POST /accounts/grants', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).post('/api/admin/accounts/grants').expect(403)
  })

  it('should fail with status code 403 if user is authorised by user without admin privileges', async () => {
    await request(app)
      .post('/api/admin/accounts/grants')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status code 422 if grantCode of testGrantOne is provided', async () => {
    const { body } = await request(app)
      .post('/api/admin/accounts/grants')
      .send({ grantCode: testGrantOne.grantCode })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)

    expect(body.errors[0].msg).toBe('Error: Grant code XX-TEST-1-YY already exists')
  })

  it('should add a new grant into DB', async () => {
    const { body } = await request(app)
      .post('/api/admin/accounts/grants')
      .send({ grantCode: 'XX-test-3-YY', include: [] })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.grantCode).toBe('XX-TEST-3-YY')
    expect(body.multiplier).toBe(1)
  })

  it('should fail with status code 409 includes property contains testUserOne', async () => {
    const { body } = await request(app)
      .post('/api/admin/accounts/grants')
      .send({
        grantCode: 'XX-test-3-YY',
        include: [
          {
            isGroup: false,
            name: testUserOne.username,
            id: testUserOne._id
          }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(409)

    expect(body.message).toBe(
      'Submitted grant includes user or group that has been added on a different grant'
    )
  })
})

describe('GET /accounts/grants', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).get('/api/admin/accounts/grants').expect(403)
  })

  it('should fail with status code 403 if user is authorised by user without admin privileges', async () => {
    await request(app)
      .get('/api/admin/accounts/grants')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should get array of 2 objects', async () => {
    const { body } = await request(app)
      .get('/api/admin/accounts/grants')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(2)
    expect(body[0]).toHaveProperty('grantCode', 'XX-TEST-1-YY')
  })
})

describe('DELETE /accounts/grants/:grantId', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app)
      .delete('/api/admin/accounts/grants/' + testGrantOne._id.toString())
      .expect(403)
  })

  it('should fail with status code 403 if user is authorised by user without admin privileges', async () => {
    await request(app)
      .delete('/api/admin/accounts/grants/' + testGrantOne._id.toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should testGrantOne if corresponding id is provided', async () => {
    const { body } = await request(app)
      .delete('/api/admin/accounts/grants/' + testGrantOne._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({ grantId: testGrantOne._id.toString() })

    //asserting change in DB

    const grants = await Grant.find({})
    expect(grants.length).toBe(1)
    expect(grants[0].grantCode).toBe(testGrantTwo.grantCode)
  })
})

describe('PUT/ /accounts/grants/', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).put('/api/admin/accounts/grants').expect(403)
  })

  it('should fail with status code 403 if user is authorised by user without admin privileges', async () => {
    await request(app)
      .put('/api/admin/accounts/grants')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status code 409 if user is authorised by user without admin privileges', async () => {
    const { body } = await request(app)
      .put('/api/admin/accounts/grants')
      .send({
        _id: testGrantTwo._id,
        include: [
          {
            isGroup: false,
            name: testUserOne.username,
            id: testUserOne._id
          }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(409)

    expect(body.message).toBe(
      'Submitted grant includes user or group that has been added on a different grant'
    )
  })

  it('should should update testGrantTwo', async () => {
    const { body } = await request(app)
      .put('/api/admin/accounts/grants')
      .send({
        _id: testGrantTwo._id,
        include: [
          {
            isGroup: false,
            name: testUserThree.username,
            id: testUserThree._id
          }
        ],
        multiplier: 4,
        description: 'New grant'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.key).toBe(testGrantTwo._id.toString())
    expect(body.multiplier).toBe(4)
    expect(body.description).toBe('New grant')
    expect(body.include[0].name).toBe(testUserThree.username)

    //asserting change in DB
    const grant = await Grant.findById(testGrantTwo._id)
    expect(grant.include[0].name).toBe(testUserThree.username)
    expect(grant.description).toBe('New grant')
    expect(grant.multiplier).toBe(4)
  })
})

describe('GET /accounts/grants-costs', () => {
  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).get('/api/admin/accounts/grants-costs').expect(403)
  })

  it('should fail with status code 403 if user is authorised by user without admin privileges', async () => {
    await request(app)
      .get('/api/admin/accounts/grants-costs')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should return grants costs calculation data object', async () => {
    const { body } = await request(app)
      .get('/api/admin/accounts/grants-costs')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.grantsCosts.length).toBe(2)
    expect(body.grantsCosts[0]).toMatchObject({
      _id: testGrantOne._id.toString(),
      grantCode: 'XX-TEST-1-YY',
      description: 'Test Grant One',
      costExps: 3,
      costClaims: 10,
      usersArray: [
        {
          _id: testUserOne._id.toString(),
          username: testUserOne.username,
          fullName: testUserOne.fullName
        }
      ],
      totalCost: 13,
      key: testGrantOne._id.toString()
    })
    expect(body.noGrantsData).toMatchObject({
      expsCount: 2,
      claimsCount: 1,
      users: [
        {
          _id: testUserThree._id.toString(),
          username: testUserThree.username,
          fullName: testUserThree.fullName
        }
      ]
    })
  })
})
