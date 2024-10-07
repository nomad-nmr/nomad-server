import { it, expect, describe, beforeEach, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'

import app from '../app.js'
import User from '../models/user.js'
import Group from '../models/group.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserAdmin, testUserOne, testUserTwo } from './fixtures/data/users.js'
import { testGroupOne, testGroupTwo } from './fixtures/data/groups.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('GET /api/admin/users/', () => {
  it('should return array of 4 test users with lastLogin descending order', async () => {
    const { body } = await request(app)
      .get('/api/admin/users/?current=1&pageSize=10&lastLoginOrder=descend')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body).toHaveProperty('total', 4)
    expect(body.users.length).toBe(4)
    expect(body.users[0]).toHaveProperty('username', 'admin')
    expect(body.users[1].inactiveDays).toBe(2)
  })

  it('should fail with status code 403 if user is not authorised', async () => {
    await request(app).get('/api/admin/users/?current=1&pageSize=10').expect(403)
  })

  it('should return array of 3 active user', async () => {
    const { body } = await request(app)
      .get('/api/admin/users/?current=1&pageSize=10&showInactive=false')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body).toHaveProperty('total', 3)
    expect(body.users.length).toBe(3)
  })

  it('should return array with admin test user if "adm" string is provided as username', async () => {
    const { body } = await request(app)
      .get('/api/admin/users/?current=1&pageSize=10&username=adm')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body.users[0]).toHaveProperty('fullName', 'Admin User')
  })

  it('should return array of 1 test user if group is defined in search params', async () => {
    const { body } = await request(app)
      .get(`/api/admin/users/?current=1&pageSize=10&group=${testGroupTwo._id.toString()}`)
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body).toHaveProperty('total', 2)
    expect(body.users.length).toBe(2)
    expect(body.users[0]).toHaveProperty('username', 'admin')
  })

  it('should return simple list of active users in a given group for drop down select', async () => {
    const { body } = await request(app)
      .get(`/api/admin/users/?list=true&group=${testGroupOne._id.toString()}`)
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body[0]).toMatchObject({
      _id: testUserTwo._id.toString(),
      username: testUserTwo.username,
      fullName: testUserTwo.fullName
    })
  })

  it('should return simple list of inactive users for drop down select in search', async () => {
    const { body } = await request(app)
      .get(
        `/api/admin/users/?list=true&showInactive=true&group=${testGroupOne._id.toString()}&search=true`
      )
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body[0]).toMatchObject({
      _id: testUserOne._id.toString(),
      username: testUserOne.username,
      fullName: testUserOne.fullName
    })
  })

  it('should return simple list including ex-users for drop down select in search', async () => {
    const { body } = await request(app)
      .get(
        `/api/admin/users/?list=true&showInactive=true&group=${testGroupTwo._id.toString()}&search=true`
      )
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)
    expect(body[0]).toMatchObject({
      _id: testUserOne._id.toString(),
      username: testUserOne.username,
      fullName: testUserOne.fullName
    })
  })
})

describe('POST /api/admin/users/', () => {
  it('should create a new user entry', async () => {
    const { body } = await request(app)
      .post('/api/admin/users/')
      .send({
        username: 'newUser',
        fullName: 'New User',
        email: 'new@example.com',
        groupId: testGroupOne._id,
        password: 'newSecret1'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(201)
    expect(body._id).toBeDefined()
    expect(body.group.groupName).toBe('test-group-1')
    expect(body.password).not.toBeDefined()

    // Asserting that the database was changed correctly
    const newUser = await User.findById(body._id)
    expect(newUser).toBeTypeOf('object')
    expect(newUser.password).toBeTypeOf('string').not.toBe('newSecret1')
  })

  it('should fail with status code 403 if request does not have authorisation header', async () => {
    await request(app)
      .post('/api/admin/users/')
      .send({
        username: 'newUser',
        fullName: 'New User',
        email: 'new@example.com',
        groupId: testGroupOne._id,
        password: 'newSecret1'
      })
      .expect(403)
  })

  it('should fail with status code 403 if request if authorised user does not have admin access level', async () => {
    await request(app)
      .post('/api/admin/users/')
      .send({
        username: 'newUser',
        fullName: 'New User',
        email: 'new@example.com',
        groupId: testGroupOne._id,
        password: 'newSecret1'
      })
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status code 422 if username is an empty string', async () => {
    const { body } = await request(app)
      .post('/api/admin/users/')
      .send({
        username: '',
        fullName: 'New User',
        email: 'new@example.com',
        groupId: testGroupOne._id,
        password: 'newSecret1'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Username minimum length is 3')
  })

  it('should fail with status code 422 if username is not unique', async () => {
    const { body } = await request(app)
      .post('/api/admin/users/')
      .send({
        username: 'admin',
        fullName: 'Test Unique',
        email: 'new@example.com',
        groupId: testGroupOne._id,
        password: 'newSecret1'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe(`Error: Username admin already exists`)
  })

  it('should fail with status code 422 if invalid e-mail address is provided', async () => {
    const { body } = await request(app)
      .post('/api/admin/users/')
      .send({
        username: 'newUser',
        fullName: 'New User',
        email: 'blaBla',
        groupId: testGroupOne._id,
        password: 'newSecret1'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Email is invalid')
  })
  it('should fail with status code 422 if invalid fullName provided', async () => {
    const { body } = await request(app)
      .post('/api/admin/users/')
      .send({
        username: 'newUser',
        fullName: 'New&User',
        email: 'new@example.com',
        groupId: testGroupOne._id,
        password: 'newSecret1'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Full name is invalid')
  })
})

describe('PUT /api/admin/users/', () => {
  it('should update email and full name of Test User Two', async () => {
    const { body } = await request(app)
      .put('/api/admin/users/')
      .send({
        _id: testUserTwo._id,
        username: testUserTwo.username,
        fullName: 'Updated User',
        email: 'new@example.com',
        groupId: testGroupOne._id
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(201)

    expect(body.fullName).toBe('Updated User')
    expect(body.email).toBe('new@example.com')
    expect(body.password).not.toBeDefined()
    expect(body.tokens).not.toBeDefined()

    // Asserting that the database was changed correctly
    const updatedUser = await User.findById(body._id)
    expect(updatedUser.fullName).toBe('Updated User')
    expect(updatedUser.email).toBe('new@example.com')
  })

  it('should fail with status code 403 if the request is not authorised', async () => {
    await request(app)
      .put('/api/admin/users/')
      .send({
        _id: testUserTwo._id,
        username: testUserTwo.username,
        fullName: 'Updated User',
        email: 'new@example.com',
        groupId: testGroupOne._id
      })
      .expect(403)
  })

  it('should fail with status code 403 if the request is authorised by user without admin access', async () => {
    await request(app)
      .put('/api/admin/users/')
      .send({
        _id: testUserTwo._id,
        username: testUserTwo.username,
        fullName: 'Updated User',
        email: 'new@example.com',
        groupId: testGroupOne._id
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })

  it('should fail with status code 422 if the request if empty string is provided as full name', async () => {
    const { body } = await request(app)
      .put('/api/admin/users/')
      .send({
        _id: testUserTwo._id,
        username: testUserTwo.username,
        fullName: '',
        email: 'new@example.com',
        groupId: testGroupOne._id
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Full name is invalid')
  })

  it('should fail with status code 422 if the request if invalid email is provided', async () => {
    const { body } = await request(app)
      .put('/api/admin/users/')
      .send({
        _id: testUserTwo._id,
        username: testUserTwo.username,
        fullName: 'Full Name',
        email: 'huuuuuuuuu',
        groupId: testGroupOne._id
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('Email is invalid')
  })

  it('should fail with status code 404 if user id is not found in DB', async () => {
    await request(app)
      .put('/api/admin/users/')
      .send({
        _id: new mongoose.Types.ObjectId(),
        username: testUserTwo.username,
        fullName: 'Updated User',
        email: 'new@example.com',
        groupId: testGroupOne._id
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should move user to a different group and update active status', async () => {
    const { body } = await request(app)
      .put('/api/admin/users/')
      .send({
        _id: testUserOne._id,
        username: testUserOne.username,
        fullName: testUserOne.fullName,
        email: testUserOne.email,
        groupId: testGroupTwo._id,
        isActive: true
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(201)

    expect(body.isActive).toBe(true)

    //asserting change of oldGroup in DB
    const oldGroup = await Group.findById(testGroupOne._id)
    expect(oldGroup.exUsers[0]).toMatchObject(testUserOne._id)
  })
})

describe('PATCH /api/admin/users/toggle-active/:id', () => {
  it('should toggle active status of user test-1', async () => {
    const { body } = await request(app)
      .patch('/api/admin/users/toggle-active/' + testUserOne._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)
    expect(body._id).toBe(testUserOne._id.toString())

    const user = await User.findById(body._id)
    expect(user.isActive).toBe(true)
  })

  it('should fail with status code 404 if user id is not found in DB', async () => {
    await request(app)
      .patch('/api/admin/users/toggle-active/' + new mongoose.Types.ObjectId().toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should fail with status code 403 if request is not authorized', async () => {
    await request(app)
      .patch('/api/admin/users/toggle-active/' + testUserOne._id.toString())
      .expect(403)
  })

  it('should fail with status code 403 if request is authorised by user without admin access level', async () => {
    await request(app)
      .patch('/api/admin/users/toggle-active/' + testUserOne._id.toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(403)
  })
})
