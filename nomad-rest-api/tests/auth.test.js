import { it, expect, describe, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import transporter from '../utils/emailTransporter'

import app from '../app'
import User from '../models/user.js'

import { connectDB, dropDB, setupDB } from './fixtures/db'
import { testUserOne, testUserTwo } from './fixtures/data/users'
import { testGroupOne } from './fixtures/data/groups'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

vi.mock('bcryptjs', () => {
  return {
    default: {
      compare: vi.fn((reqPass, pass) => (reqPass === pass ? true : false)),
      hash: vi.fn(pass => pass)
    }
  }
})

vi.mock('../utils/emailTransporter')

const jwtExpiration = process.env.JWT_EXPIRATION || 3600

describe('POST /api/auth/login', () => {
  it('should return object with user info if username and correct password of active user is provided', async () => {
    const { body } = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUserTwo.username,
        password: testUserTwo.password
      })
      .expect(200)
    expect(bcrypt.compare).toHaveBeenCalled()
    expect(body).toHaveProperty('username', testUserTwo.username)
    expect(body).toHaveProperty('accessLevel', testUserTwo.accessLevel)
    expect(body).toHaveProperty('groupName', testGroupOne.groupName)
    expect(body.token).toBeDefined()
    expect(body.expiresIn).toBeDefined()
  })

  it('should fail with status 400 if username does not exist', async () => {
    const { body } = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'user-x',
        password: testUserTwo.password
      })
      .expect(400)
    expect(body.message).toBe('Wrong username or password')
  })

  it('should fail with status 400 if wrong password is provided', async () => {
    const { body } = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUserTwo.username,
        password: 'wrong-pass'
      })
      .expect(400)
    expect(body.message).toBe('Wrong username or password')
  })

  it('should fail with status 400 if user with given username is inactive', async () => {
    const { body } = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUserOne.username
      })
      .expect(400)
    expect(body.message).toBe('User is inactive')
  })
})

describe('POST /api/auth/logout', () => {
  it('should removed JWT stored in user database', async () => {
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(200)

    //asserting change in DB
    const user = await User.findById(testUserTwo._id)
    expect(user.tokens[0]).not.toBeDefined()
  })

  it('should fail with status 403 if user is not authorised', async () => {
    await request(app).post('/api/auth/logout').expect(403)
  })
})

describe('POST /api/auth/password-reset', () => {
  it('should return object with username and e-mail and sent password reset e-mail', async () => {
    const { body } = await request(app)
      .post('/api/auth/password-reset')
      .send({ username: testUserOne.username })
      .expect(200)
    expect(transporter.sendMail).toBeCalled()
    expect(body).toMatchObject({ username: testUserOne.username, email: testUserOne.email })
  })

  it('should fail with status 400 if user with provided username does not exist', async () => {
    await request(app).post('/api/auth/password-reset').send({ username: 'user-x' }).expect(400)
  })
})

describe('GET /api/auth/password-reset', () => {
  it('should return object with username and full name if existing reset token is provided', async () => {
    const userOne = await User.findById(testUserOne._id)
    const token = await userOne.generateResetToken()

    const { body } = await request(app)
      .get('/api/auth/password-reset/' + token)
      .expect(200)

    expect(body).toMatchObject({ username: 'test1', fullName: 'Test User One' })
  })

  it('should fail with status 404 if token is not found', async () => {
    const { body } = await request(app)
      .get('/api/auth/password-reset/' + 'wrong-token')
      .expect(404)
    expect(body.message).toBe('Token is invalid or user does not exist')
  })

  it('should fail with status 403 if token has expired', async () => {
    const userOne = await User.findById(testUserOne._id)
    const token = await userOne.generateResetToken()

    const date = new Date()
    const fakeDate = new Date(date.getTime() + jwtExpiration * 1000 + 10000000)
    vi.useFakeTimers()
    vi.setSystemTime(fakeDate)

    const { body } = await request(app)
      .get('/api/auth/password-reset/' + token)
      .expect(403)
    expect(body.message).toBe('Token is invalid')

    vi.useRealTimers()
  })
})

describe('POST /api/auth/new-password', () => {
  //testing route validation
  it('should fail with status 422 if empty string is provided as full name', async () => {
    const { body } = await request(app)
      .post('/api/auth/new-password')
      .send({
        username: 'test1',
        fullName: '',
        password: 'newPassword123',
        confirmPass: 'newPassword123'
      })
      .expect(422)
    expect(body.errors[0].msg).toBe('Full name minimum length is 3 and maximum length is 50')
  })

  it('should fail with status 422 if password is too short', async () => {
    const { body } = await request(app)
      .post('/api/auth/new-password')
      .send({
        username: 'test1',
        fullName: 'New Full Name',
        password: 'newPass',
        confirmPass: 'newPass'
      })
      .expect(422)
    expect(body.errors[0].msg).toBe(
      'Password must have minimum eight characters, at least one uppercase letter, one lowercase letter and one number.'
    )
  })

  it('should fail with status 422 if passwords do not match', async () => {
    const { body } = await request(app)
      .post('/api/auth/new-password')
      .send({
        username: 'test1',
        fullName: 'New Full Name',
        password: 'newPassword123',
        confirmPass: 'newPass'
      })
      .expect(422)
    expect(body.errors[0].msg).toBe('Passwords do not match!')
  })

  //testing controller
  it('should update user in DB and return object with username and resetting=false', async () => {
    const userOne = await User.findById(testUserOne._id)
    const token = await userOne.generateResetToken()

    const { body } = await request(app)
      .post('/api/auth/new-password')
      .send({
        username: 'test1',
        fullName: 'New Full Name',
        password: 'newPassword123',
        confirmPass: 'newPassword123',
        token
      })
      .expect(200)
    expect(bcrypt.hash).toBeCalled()
    expect(body).toMatchObject({ username: 'test1', resetting: false })

    //asserting change in DB
    const updatedUser = await User.findById(testUserOne._id)
    expect(updatedUser.fullName).toBe('New Full Name')
    expect(updatedUser.isActive).toBe(true)
    expect(updatedUser.password).toBe('newPassword123')
  })

  it('should reset pasword and return object with username and resetting=true', async () => {
    const userOne = await User.findById(testUserOne._id)
    const token = await userOne.generateResetToken()

    const { body } = await request(app)
      .post('/api/auth/new-password')
      .send({
        username: testUserOne.username,
        fullName: testUserOne.fullName,
        password: 'newPassword123',
        confirmPass: 'newPassword123',
        token
      })
      .expect(200)
    expect(bcrypt.hash).toBeCalled()
    expect(body).toMatchObject({ username: 'test1', resetting: true })

    //asserting change in DB
    const updatedUser = await User.findById(testUserOne._id)
    expect(updatedUser.password).toBe('newPassword123')
  })

  it('should fail with status 404 if invalid token is provided', async () => {
    const { body } = await request(app)
      .post('/api/auth/new-password')
      .send({
        username: 'test1',
        fullName: 'New Full Name',
        password: 'newPassword123',
        confirmPass: 'newPassword123',
        token: 'wrong-token'
      })
      .expect(404)
    expect(body.message).toBe('Token is invalid or user does not exist')
  })

  it('should fail with status 404 if invalid token is provided', async () => {
    const userOne = await User.findById(testUserOne._id)
    const token = await userOne.generateResetToken()

    const date = new Date()
    const fakeDate = new Date(date.getTime() + jwtExpiration * 1000 + 10000000)
    vi.useFakeTimers()
    vi.setSystemTime(fakeDate)

    const { body } = await request(app)
      .post('/api/auth/new-password')
      .send({
        username: 'test1',
        fullName: 'New Full Name',
        password: 'newPassword123',
        confirmPass: 'newPassword123',
        token
      })
      .expect(403)
    expect(body.message).toBe('Token is invalid')

    vi.useRealTimers()
  })
})
