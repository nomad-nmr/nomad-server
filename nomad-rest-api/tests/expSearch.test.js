import { it, expect, describe, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserAdmin, testUserOne, testUserThree, testUserTwo } from './fixtures/data/users.js'
import { testInstrTwo } from './fixtures/data/instruments.js'
import { testParamSet2 } from './fixtures/data/parameterSets.js'
import { testGroupOne } from './fixtures/data/groups.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('GET /api/search/experiments', () => {
  it('should fail with error 403 if request is not authorised', async () => {
    await request(app).get('/api/search/experiments').expect(403)
  })

  it('should return array with all experiments in DB', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20
    }
    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(5)
    expect(body.total).toBe(6)
  })

  it('should return array with one dataset with 2 experiments in total if title substring "exp 1" is provided', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      title: 'exp 1'
    }
    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(1)
    expect(body.total).toBe(2)
    expect(body.data[0].exps.length).toBe(2)
    expect(body.data[0].exps[0].title).toBe('Test Exp 1')
  })

  it('should return array with one dataset with 2 experiments in total if dataset name 2106231050-2-1-test1 is provided', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      datasetName: '2106231050-2-1-test1'
    }
    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(1)
    expect(body.total).toBe(2)
    expect(body.data[0].datasetName).toBe('2106231050-2-1-test1')
  })

  it('should return array with 2 datasets with 2 experiments in total if solvent C6D6 is provided', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      solvent: 'C6D6'
    }
    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(2)
    expect(body.total).toBe(2)
    expect(body.data[0].solvent).toBe('C6D6')
  })

  it('should return array with 1 dataset with 1 experiment in total if id of test instrument two and param set 2 are provided', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      instrumentId: testInstrTwo._id,
      paramSet: testParamSet2.name
    }

    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(1)
    expect(body.total).toBe(1)
    expect(body.data[0].instrument).toMatchObject({
      name: testInstrTwo.name,
      id: testInstrTwo._id.toString()
    })
    expect(body.data[0].exps[0].parameterSet).toBe(testParamSet2.name)
  })

  it('should return array with 1 dataset with 1 experiment in total if id of test instrument two and param set 2 are provided', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      instrumentId: testInstrTwo._id,
      paramSet: testParamSet2.name
    }

    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(1)
    expect(body.total).toBe(1)
    expect(body.data[0].instrument).toMatchObject({
      name: testInstrTwo.name,
      id: testInstrTwo._id.toString()
    })
    expect(body.data[0].exps[0].parameterSet).toBe(testParamSet2.name)
  })

  it('should return array with all experiments for testUserOne if request authorised by testUserOne', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      userId: undefined
    }
    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(1)
    expect(body.total).toBe(2)
    expect(body.data[0].user).toMatchObject({
      username: testUserOne.username,
      id: testUserOne._id.toString()
    })
  })

  it('should return array with all experiments for testGroupOne if request authorised by testUserTwo', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      userId: undefined
    }
    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(3)
    expect(body.total).toBe(4)
    expect(body.data[0].group).toMatchObject({
      name: testGroupOne.groupName,
      id: testGroupOne._id.toString()
    })
  })

  it('should return array with all experiments for testUserTwo if testUserTwo is provided', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      userId: testUserTwo._id
    }
    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(1)
    expect(body.total).toBe(1)
    expect(body.data[0].user).toMatchObject({
      username: testUserTwo.username,
      id: testUserTwo._id.toString()
    })
  })

  it('should return array with all experiments for testUserTwo if testUserTwo is provided', async () => {
    const searchParams = {
      dataType: 'auto',
      currentPage: 1,
      pageSize: 20,
      legacyData: true
    }
    const { body } = await request(app)
      .get('/api/search/experiments/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .expect(200)

    expect(body.data.length).toBe(1)
    expect(body.total).toBe(1)
    expect(body.data[0].user).toMatchObject({
      username: testUserThree.username,
      id: testUserThree._id.toString()
    })
    expect(body.data[0].group).toMatchObject({
      name: testGroupOne.groupName,
      id: testGroupOne._id.toString()
    })
  })
})

describe('GET /api/search/data-access', () => {
  it('should fail with error 403 if request is not authorised', async () => {
    await request(app).get('/api/search/data-access').expect(403)
  })

  it('should fail with error 403 if request is not authorised', async () => {
    const { body } = await request(app).get('/api/search/data-access').expect(403)
  })

  it('should return {dataAccess: group}', async () => {
    const { body } = await request(app)
      .get('/api/search/data-access')
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(200)
    expect(body).toMatchObject({ dataAccess: 'group' })
  })

  it('should return {dataAccess: user}', async () => {
    const { body } = await request(app)
      .get('/api/search/data-access')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body).toMatchObject({ dataAccess: 'user' })
  })
})
