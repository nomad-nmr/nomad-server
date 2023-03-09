import { it, expect, describe, beforeEach, beforeAll, afterAll, vi, test } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'

import app from '../app.js'
import ParameterSet from '../models/parameterSet'

import { connectDB, dropDB, setupDB } from './fixtures/db'
import { testParamSet1, testParamSet2 } from './fixtures/data/parameterSets'
import { testUserOne, testUserAdmin } from './fixtures/data/users'
import { testInstrOne, testInstrTwo } from './fixtures/data/instruments'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('GET /admin/param-sets', () => {
  it('should return array with 2 non-hidden parameter set objects', async () => {
    const { body } = await request(app)
      .get('/admin/param-sets/?instrumentId=null')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(2)
    expect(body[0].name).toBe(testParamSet1.name)
    expect(body[0]).toHaveProperty('defaultParams')
  })

  it('should return array with 3 parameter set objects if request is authorised by user with admin level access', async () => {
    const { body } = await request(app)
      .get('/admin/param-sets/?instrumentId=null')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(3)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app).get('/admin/param-sets/?instrumentId=null').expect(403)
  })

  it('should return only array with one parameter set available on instrument-1', async () => {
    const { body } = await request(app)
      .get('/admin/param-sets/?instrumentId=' + testInstrOne._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body.length).toBe(1)
    expect(body[0].name).toBe(testParamSet1.name)
  })

  it('should return simple list of parameter sets for drop down select available on test instrument 2', async () => {
    const { body } = await request(app)
      .get('/admin/param-sets/?instrumentId=' + testInstrTwo._id + '&list=true')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body.length).toBe(1)
    expect(body[0]).toMatchObject({ name: testParamSet2.name, id: testParamSet2._id })
  })

  it('should return array with only one parameter set if "2" is provided as search value', async () => {
    const { body } = await request(app)
      .get('/admin/param-sets/?instrumentId=null&searchValue=2')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body.length).toBe(1)
    expect(body[0]._id).toBe(testParamSet2._id.toString())
  })
})

describe('POST /admin/param-sets', () => {
  it('should fail with status 422 empty string is provided as parameter name ', async () => {
    const { body } = await request(app)
      .post('/admin/param-sets/')
      .send({
        name: ''
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Parameter set name minimum length is 3')
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .post('/admin/param-sets/')
      .send({
        name: 'parameter-set-3'
      })
      .expect(403)
  })

  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .post('/admin/param-sets/')
      .send({
        name: 'parameter-set-3'
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 422 empty parameter set name alredy exists in database', async () => {
    const { body } = await request(app)
      .post('/admin/param-sets/')
      .send({
        name: testParamSet1.name
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)

    expect(body.errors[0].msg).toBe(`Error: Parameter Set ${testParamSet1.name} already exists`)
  })

  it('should fail with status 422 if default parameter name is provided among custom parameters', async () => {
    const { body } = await request(app)
      .post('/admin/param-sets/')
      .send({
        name: 'parameter-set-3',
        customParams: [{ name: 'ns', comment: 'NS', value: '8' }]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)

    expect(body.errors[0].msg).toBe('Error: Duplicate parameter name')
  })

  it('should fail with status 422 if duplicate custom parameter is provided', async () => {
    const { body } = await request(app)
      .post('/admin/param-sets/')
      .send({
        name: 'parameter-set-3',
        customParams: [
          { name: 'param', comment: 'test', value: '8' },
          { name: 'param', comment: 'test-2', value: '16' }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)

    expect(body.errors[0].msg).toBe('Error: Duplicate parameter name')
  })

  it('should create a new  parameter set entry in the database', async () => {
    const { body } = await request(app)
      .post('/admin/param-sets/')
      .send({
        name: 'parameter-Set-3',
        defaultParams: [
          { name: 'ns', value: 8 },
          { name: 'd1', value: 1 },
          { name: 'ds', value: 2 },
          { name: 'td1', value: 1 },
          { name: 'expt', value: '00:00:55' }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body).toHaveProperty('name', 'parameter-set-3')
    expect(body._id).toBeDefined()
    expect(body.defaultParams[0]).toMatchObject({ name: '0', value: { name: 'ns', value: 8 } })

    //asserting change in DB
    const paramSet = await ParameterSet.findById(body._id)
    expect(paramSet).toBeDefined()
  })
})

describe('PUT /admin/param-sets', () => {
  it('should fail with status 422 empty string is provided as parameter name ', async () => {
    const { body } = await request(app)
      .put('/admin/param-sets/')
      .send({
        name: ''
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Parameter set name minimum length is 3')
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .put('/admin/param-sets/')
      .send({
        name: 'parameter-set-3'
      })
      .expect(403)
  })

  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .put('/admin/param-sets/')
      .send({
        name: 'parameter-set-3'
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 422 if default parameter name is provided among custom parameters', async () => {
    const { body } = await request(app)
      .put('/admin/param-sets/')
      .send({
        name: 'parameter-set-3',
        customParams: [{ name: 'ns', comment: 'NS', value: '8' }]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)

    expect(body.errors[0].msg).toBe('Error: Duplicate parameter name')
  })

  it('should update params-1 parameter set in database', async () => {
    const { body } = await request(app)
      .put('/admin/param-sets/')
      .send({
        _id: testParamSet1._id,
        name: testParamSet1.name,
        description: 'new description',
        defaultParams: [
          { name: 'ns', value: 16 },
          { name: 'd1', value: 1 },
          { name: 'ds', value: 2 },
          { name: 'td1', value: 1 },
          { name: 'expt', value: '00:00:55' }
        ]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body.name).toBe(testParamSet1.name)
    expect(body).toHaveProperty('description', 'new description')
    expect(body.defaultParams[0].value).toMatchObject({ name: 'ns', value: 16 })

    //asserting change in DB
    const paramSet = await ParameterSet.findById(body._id)
    expect(paramSet.description).toBe('new description')
  })
})

describe('DELETE /admin/param-sets', () => {
  it('should delete params-1 parameter set', async () => {
    const { body } = await request(app)
      .delete('/admin/param-sets/' + testParamSet1._id)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      message: 'Delete successful',
      id: testParamSet1._id.toString()
    })

    //asserting change in DB
    const paramSet = await ParameterSet.findById(testParamSet1._id.toString())
    expect(paramSet).toBeNull()
  })

  it('it should fail with status 403 if request is not authorised by user with admin access', async () => {
    await request(app)
      .delete('/admin/param-sets/' + testParamSet1._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })
  it('it should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .delete('/admin/param-sets/' + testParamSet1._id)
      .expect(403)
  })
})
