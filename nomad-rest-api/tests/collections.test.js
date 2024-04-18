import { it, expect, describe, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'

import { testUserAdmin, testUserOne, testUserTwo, testUserThree } from './fixtures/data/users.js'
import { testDatasetOne, testDatasetTwo, testDatasetThree } from './fixtures/data/datasets.js'
import { testGroupOne, testGroupTwo } from './fixtures/data/groups.js'
import { testCollectionOne } from './fixtures/data/collections.js'
import Collection from '../models/collection.js'
import Dataset from '../models/dataset.js'

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('POST / ', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app).post('/collections/').expect(403)
  })

  it('should fail with error 422 if new collection is posted without new title ', async () => {
    const { body } = await request(app)
      .post('/collections/')
      .send({ collection: '##-new-##' })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
    expect(body.errors[0].msg).toBe('New Title has to be defined')
  })

  it('should create a new collection containing test dataset one', async () => {
    const { body } = await request(app)
      .post('/collections/')
      .send({
        collection: '##-new-##',
        newTitle: 'New Collection',
        datasets: [testDatasetOne._id.toString()]
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body.newTitle).toBe('New Collection')
    expect(body.duplicatesCount).toBe(0)
    expect(body.newId).toBeDefined()

    //asserting change in database
    const collection = await Collection.findById(body.newId)
    expect(collection.title).toBe(body.newTitle)
    expect(collection.user.toString()).toBe(testUserOne._id.toString())
    expect(collection.group.toString()).toBe(testGroupOne._id.toString())
    expect(collection.datasets[0].toString()).toBe(testDatasetOne._id.toString())

    const dataset = await Dataset.findById(testDatasetOne._id)
    expect(dataset.inCollections.length).toBe(1)
    expect(dataset.inCollections[0].toString()).toBe(body.newId)
  })

  it('should fail with status 403 if request is not authorised by user with admin access or is not collection owner', async () => {
    await request(app)
      .post('/collections/')
      .send({
        collection: testCollectionOne._id,
        datasets: [testDatasetThree._id.toString()]
      })
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(403)
  })

  it('should add test dataset three in test collection one ', async () => {
    const { body } = await request(app)
      .post('/collections/')
      .send({
        collection: testCollectionOne._id,
        datasets: [testDatasetThree._id]
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body.duplicatesCount).toBe(0)

    //asserting change in database
    const collection = await Collection.findById(testCollectionOne._id)
    expect(collection.datasets.length).toBe(2)

    const dataset = await Dataset.findById(testDatasetThree._id)
    expect(dataset.inCollections[0].toString()).toBe(testCollectionOne._id.toString())
  })

  it('should not add test dataset Two in test collection one', async () => {
    const { body } = await request(app)
      .post('/collections/')
      .send({
        collection: testCollectionOne._id,
        datasets: [testDatasetTwo._id]
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.duplicatesCount).toBe(1)
    //asserting change in database
    const collection = await Collection.findById(testCollectionOne._id)
    expect(collection.datasets.length).toBe(1)
  })
})

describe('GET /', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app).get('/collections/').expect(403)
  })

  it('should work', async () => {
    const { body } = await request(app)
      .get('/collections/')
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body.length).toBe(1)
    expect(body[0].key).toBe(testCollectionOne._id.toString())
    expect(body[0].username).toBe(testUserOne.username)
    expect(body[0].createdAt).toBeDefined()
  })
})

describe('GET /datasets/:collectionId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .get('/collections/datasets/' + testCollectionOne._id.toString())
      .expect(403)
  })

  it('should return data for test collection one if request is authorised by user with shared access', async () => {
    await request(app)
      .get('/collections/datasets/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .expect(200)
  })

  it('should return data object for test collection one', async () => {
    const { body } = await request(app)
      .get('/collections/datasets/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(200)

    expect(body.id).toBe(testCollectionOne._id.toString())
    expect(body.group.groupName).toBe(testGroupOne.groupName)
    expect(body.user.username).toBe(testUserOne.username)
    expect(body.datasetsData.length).toBe(1)
  })
})

describe('DELETE /:collectionId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .delete('/collections/' + testCollectionOne._id.toString())
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without write access', async () => {
    await request(app)
      .delete('/collections/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(401)
  })

  it('should delete test collection one', async () => {
    const { body } = await request(app)
      .delete('/collections/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({ collectionId: testCollectionOne._id.toString() })

    //asserting change in database
    const collection = await Collection.findById(testCollectionOne._id)
    expect(collection).toBe(null)
  })
})

describe('PATCH /datasets/:collectionId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .patch('/collections/datasets/' + testCollectionOne._id.toString())
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without write access', async () => {
    await request(app)
      .patch('/collections/datasets/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(401)
  })

  it('should remove dataset from test dataset one', async () => {
    const { body } = await request(app)
      .patch('/collections/datasets/' + testCollectionOne._id.toString())
      .send({ datasetIds: testDatasetTwo._id })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body).toMatchObject({
      newDatasetIds: [],
      collectionId: testCollectionOne._id.toString()
    })

    //asserting change in database
    const collection = await Collection.findById(testCollectionOne._id)
    expect(collection.datasets.length).toBe(0)
  })
})

describe('PATCH /metadata/:collectionId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .patch('/collections/metadata/' + testCollectionOne._id.toString())
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without write access', async () => {
    await request(app)
      .patch('/collections/metadata/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(401)
  })

  it('should fail with error 422 if title is an empty string', async () => {
    await request(app)
      .patch('/collections/metadata/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .send({ title: '' })
      .expect(422)
  })

  it('should change title of testCollectionOne', async () => {
    const { body } = await request(app)
      .patch('/collections/metadata/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .send({ title: 'New Title', userId: testUserThree._id, groupId: testGroupTwo._id })
      .expect(200)

    expect(body.title).toBe('New Title')
    expect(body.id).toBe(testCollectionOne._id.toString())
    expect(body.group.groupName).toBe(testGroupTwo.groupName)
    expect(body.user.username).toBe(testUserThree.username)

    //asserting change in database
    const collection = await Collection.findById(testCollectionOne._id)
    expect(collection.title).toBe('New Title')
    expect(collection.user.toString()).toBe(testUserThree._id.toString())
    expect(collection.group.toString()).toBe(testGroupTwo._id.toString())
  })
})

describe('PATCH /share/:collectionId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .patch('/collections/share/' + testCollectionOne._id.toString())
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without write access', async () => {
    await request(app)
      .patch('/collections/share/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(401)
  })

  it('should should update sharedWith array for test collection one', async () => {
    const { body } = await request(app)
      .patch('/collections/share/' + testCollectionOne._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .send([{ name: testUserThree.username, type: 'user', id: testUserThree._id }])
      .expect(200)

    expect(body[0]).toMatchObject({
      name: testUserThree.username,
      type: 'user',
      id: testUserThree._id.toString()
    })

    //asserting change in database
    const collection = await Collection.findById(testCollectionOne._id)
    expect(collection.sharedWith[0]).toMatchObject({
      name: testUserThree.username,
      type: 'user',
      id: testUserThree._id.toString()
    })
  })
})
