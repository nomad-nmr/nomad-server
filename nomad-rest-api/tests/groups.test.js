import mongoose from 'mongoose'
import { it, expect, describe, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'

import app from '../app'
import Group from '../models/group.js'
import User from '../models/user.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserAdmin, testUserOne } from './fixtures/data/users.js'
import { testGroupOne, testGroupTwo } from './fixtures/data/groups.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('GET /admin/groups/', () => {
  it('should return an array containing 1 test group object', async () => {
    const { body } = await request(app)
      .get('/admin/groups/')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body.length).toBe(1)
    expect(body[0]).toHaveProperty('groupName', 'test-admins')
  })

  it('should return an array containing 2 test group objects', async () => {
    const { body } = await request(app)
      .get('/admin/groups/?showInactive=true')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body.length).toBe(2)
    expect(body[0]).toHaveProperty('groupName', 'test-admins')
    expect(body[0]).toHaveProperty('totalUserCount', 2)
  })

  it('should fail with status code 403 if request is not authorised', async () => {
    await request(app).get('/admin/groups/').expect(403)
  })

  it('should return a simple list of groups for drop down select', async () => {
    const { body } = await request(app)
      .get('/admin/groups/?list=true')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body[0]).toMatchObject({
      name: testGroupTwo.groupName,
      id: testGroupTwo._id,
      isActive: testGroupTwo.isActive,
      isBatch: false
    })
  })
})

describe('POST /admin/groups/', () => {
  it('should add a new group entry into database', async () => {
    const { body } = await request(app)
      .post('/admin/groups/')
      .send({
        groupName: 'New-grp',
        description: 'New Group',
        isBatch: false
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(201)
    expect(body._id).toBeTypeOf('string')

    // Asserting that the database was changed correctly
    const newGrp = await Group.findById(body._id)
    expect(newGrp.groupName).toBe('new-grp')
  })

  it('should fail with status code 403 if authorised user does not have admin access level', async () => {
    await request(app)
      .post('/admin/groups/')
      .send({
        groupName: 'new-grp',
        description: 'New Group',
        isBatch: false
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status code 403 if request is not authorised', async () => {
    await request(app)
      .post('/admin/groups/')
      .send({
        groupName: 'new-grp',
        description: 'New Group',
        isBatch: false
      })
      .expect(403)
  })

  it('should fail with status code 422 if empty string is provided for group name', async () => {
    const { body } = await request(app)
      .post('/admin/groups/')
      .send({
        groupName: '',
        description: 'New Group',
        isBatch: false
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBeTypeOf('string')
  })

  it('should fail with status code 422 if group name already exists', async () => {
    const { body } = await request(app)
      .post('/admin/groups/')
      .send({
        groupName: 'Test-group-1',
        description: 'New Group',
        isBatch: false
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBeTypeOf('string')
  })
})

describe('PUT /admin/groups/', () => {
  it('should change description and turn test-group-1 active', async () => {
    const { body } = await request(app)
      .put('/admin/groups/')
      .send({
        _id: testGroupOne._id,
        isActive: true,
        description: 'new description'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body.description).toBe('new description')
    expect(body.isActive).toBe(true)

    //asserting change in database
    const group = await Group.findById(testGroupOne._id)
    expect(group.description).toBe('new description')
    expect(group.isActive).toBe(true)
  })

  it('should fail with status 404 if wrong group id is provided', async () => {
    const newId = await new mongoose.Types.ObjectId().toString()
    await request(app)
      .put('/admin/groups/')
      .send({
        _id: newId,
        isActive: true,
        description: 'new description'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should fail with status 422 if request is not authorised by user with admin access level', async () => {
    await request(app)
      .put('/admin/groups/')
      .send({
        _id: testGroupOne._id,
        isActive: true,
        description: 'new description'
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 422 if request is not authorised', async () => {
    await request(app)
      .put('/admin/groups/')
      .send({
        _id: testGroupOne._id,
        isActive: true,
        description: 'new description'
      })
      .expect(403)
  })

  it('should change test-group-1 to be batch submission group and set access level of users in the group to user-b', async () => {
    const { body } = await request(app)
      .put('/admin/groups/')
      .send({
        _id: testGroupOne._id,
        isBatch: true
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body.isBatch).toBe(true)

    //asserting change in DB
    const groupOneUsers = await User.find({ group: testGroupOne._id })
    expect(groupOneUsers[0].accessLevel).toBe('user-b')
  })
})

describe('PATCH /admin/groups/toggle-active', () => {
  it('should turn test-admins group inactive and change active status of users in the group', async () => {
    const { body } = await request(app)
      .patch('/admin/groups/toggle-active/' + testGroupTwo._id)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body._id).toBe(testGroupTwo._id.toString())

    //asserting change in DB
    const groupTwoUsers = await User.find({ group: testGroupTwo._id })
    expect(groupTwoUsers[0].isActive).toBe(false)
  })

  it('should fail with status 404 if wrong group id is provided', async () => {
    const newId = await new mongoose.Types.ObjectId().toString()
    await request(app)
      .patch('/admin/groups/toggle-active/' + newId)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .patch('/admin/groups/toggle-active/' + testGroupTwo._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })
  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .patch('/admin/groups/toggle-active/' + testGroupTwo._id)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })
  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .patch('/admin/groups/toggle-active/' + testGroupTwo._id)
      .expect(403)
  })
})

describe('POST /admin/groups/add-users', () => {
  it('should create users in test-group-1 if array of usernames is provided', async () => {
    const { body } = await request(app)
      .post('/admin/groups/add-users/' + testGroupTwo._id)
      .send(['add-user-1', 'admin', 'test1'])
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      rejected: 1,
      newUsers: 1,
      total: 2
    })

    //asserting change in DB
    const addedUser = await User.find({ username: 'add-user-1' })
    expect(addedUser).toBeDefined()

    const oldGroup = await Group.findById(testGroupOne._id)
    expect(oldGroup.exUsers[0].toString()).toBe(testUserOne._id.toString())
  })

  it('should fail with status 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .post('/admin/groups/add-users/' + testGroupTwo._id)
      .send(['add-user-1', 'admin', 'test1'])
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status 403 if request is not authorised', async () => {
    await request(app)
      .post('/admin/groups/add-users/' + testGroupTwo._id)
      .send(['add-user-1', 'admin', 'test1'])
      .expect(403)
  })
})
