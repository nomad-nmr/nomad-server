import fs from 'fs'
import path from 'path'

import { it, expect, describe, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import moment from 'moment'
import mongoose from 'mongoose'

import app from '../app.js'
import { connectDB, dropDB, setupDB } from './fixtures/db.js'
import { testUserAdmin, testUserOne, testUserThree, testUserTwo } from './fixtures/data/users.js'
import { testExpOne } from './fixtures/data/experiments.js'
import { testDatasetOne, testDatasetTwo, testDatasetThree } from './fixtures/data/datasets.js'
import { testGroupOne, testGroupTwo } from './fixtures/data/groups.js'

import Dataset from '../models/dataset.js'
import { getNMRiumDataObj } from '../utils/nmriumUtils.js'

vi.mock('../utils/nmriumUtils.js', async () => {
  const actual = await vi.importActual('../utils/nmriumUtils.js')
  return {
    ...actual,
    getNMRiumDataObj: vi.fn(() => ({
      spectra: [{ data: 'testData', meta: 'testMeta' }]
    }))
  }
})

// vi.mock('fs/promises')

// vi.mock('jszip', async () => {
//   const jszip = vi.fn(() => ({
//     loadAsync: vi.fn(),
//     generateNodeStream: vi.fn(() => ({ pipe: vi.fn(() => {}) }))
//   }))
//   jszip.loadAsync = vi.fn(() => ({ files: [], generateAsync: vi.fn() }))
//   return { default: jszip, loadAsync: vi.fn(), generateNodeStream: vi.fn() }
// })

beforeAll(connectDB)
afterAll(dropDB)
beforeEach(setupDB)

describe('POST /api/data/dataset', () => {
  it('should fail with error 403 if request is not authorised', async () => {
    await request(app).post('/api/data/dataset').expect(403)
  })

  it('should fail if dataset title is invalid', async () => {
    await request(app)
      .post('/api/data/dataset')
      .send({
        title: '1           '
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
  })

  it('should fail with error 422 if experiment in the dataset has undefined data type', async () => {
    await request(app)
      .post('/api/data/dataset')
      .send({
        title: 'Dataset 1'
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
  })

  it('should fail with error 422 if experiment in the dataset has undefined id', async () => {
    await request(app)
      .post('/api/data/dataset')
      .send({
        title: 'Dataset 1',
        nmriumData: { data: { spectra: [{ dataType: 'auto' }] } }
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
  })

  it('should save dataset in DB', async () => {
    const molfile = fs.readFileSync(path.join(__dirname, '/fixtures/data/molecule1.mol')).toString()

    const { body } = await request(app)
      .post('/api/data/dataset')
      .send({
        title: 'Dataset 1',
        nmriumData: {
          data: {
            spectra: [{ dataType: 'auto', id: testExpOne._id, info: { type: 'NMR spectrum' } }],
            molecules: [{ molfile }]
          }
        }
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.user).toMatchObject({
      _id: testUserAdmin._id.toString(),
      username: testUserAdmin.username,
      fullName: testUserAdmin.fullName
    })
    expect(body.group).toMatchObject({
      _id: testGroupTwo._id.toString(),
      groupName: testGroupTwo.groupName
    })
    expect(body.title).toMatch('Dataset 1')

    //asserting change in DB
    const dataset = await Dataset.findById(body.id)
    expect(dataset.title).toMatch('Dataset 1')
    expect(dataset.smiles[0]).toMatch('C1(=CC=CC=C1)')
  })
})

describe('GET /api/data/dataset/:datasetId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .get('/api/data/dataset/' + testDatasetOne._id.toString())
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without rights to access the dataset', async () => {
    await request(app)
      .get('/api/data/dataset/' + testDatasetOne._id.toString())
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .expect(401)
  })

  it('should get dataset with spectrum and FID', async () => {
    const resp = await request(app)
      .get('/api/data/dataset/' + testDatasetOne._id.toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    const body = JSON.parse(resp.text)

    expect(body.nmriumData).toBeTypeOf('object')
    expect(body.nmriumData.data.spectra.length).toBe(2)
    expect(body.datasetMeta).toMatchObject({
      id: testDatasetOne._id.toString(),
      title: testDatasetOne.title,
      user: {
        _id: testUserOne._id.toString(),
        username: testUserOne.username,
        fullName: testUserOne.fullName
      },
      group: { _id: testGroupOne._id.toString(), groupName: testGroupOne.groupName },
      tags: ['test']
    })

    const filePath = path.join(process.env.DATASTORE_PATH, testExpOne.dataPath, testExpOne.expId)
    expect(getNMRiumDataObj).toHaveBeenCalledWith(filePath, testExpOne.title, false)
    expect(getNMRiumDataObj).toHaveBeenCalled(2)
    // expect(getNMRiumDataObj).toHaveBeenNthCalledWith(2, filePath, testExpOne.title, true)
  })
})

describe('PUT /api/data/dataset/:datasetId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .put('/api/data/dataset/' + testDatasetOne._id.toString())
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without rights to access the dataset', async () => {
    await request(app)
      .put('/api/data/dataset/' + testDatasetOne._id.toString())
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .expect(401)
  })

  it('should fail with error 422 if experiment in the dataset has undefined data type', async () => {
    await request(app)
      .put('/api/data/dataset/' + testDatasetOne._id.toString())
      .send({
        title: 'New title'
      })
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(422)
  })

  it('should update testDatasetOne in DB', async () => {
    const molfile = fs.readFileSync(path.join(__dirname, '/fixtures/data/molecule2.mol')).toString()

    await request(app)
      .put('/api/data/dataset/' + testDatasetOne._id.toString())
      .send({
        title: 'New title',
        nmriumData: {
          data: {
            spectra: [{ dataType: 'auto', id: testExpOne._id, info: { type: 'NMR spectrum' } }],
            molecules: [{ molfile }]
          }
        }
      })
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    //Asserting change in DB
    const dataset = await Dataset.findById(testDatasetOne._id)
    expect(dataset.title).toMatch('New title')
    expect(dataset.nmriumData.data.spectra.length).toBe(1)
    expect(dataset.smiles[0]).toMatch('C1(CCCO1)')
  })
})

describe('GET /api/data/dataset-zip/:datasetId', () => {
  it('should fail if request is not authorized', async () => {
    await request(app)
      .get('/api/data/dataset-zip/' + testDatasetOne._id.toString())
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without read access to the dataset', async () => {
    await request(app)
      .get('/api/data/dataset-zip/' + testDatasetOne._id.toString())
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .expect(401)
  })

  //Mocking JSZip is done but not really clear how to mock or test .pipe(res)
  //
  // it('should work', async () => {
  //   const response = await request(app)
  //     .get('/api/data/dataset-zip/' + testDatasetOne._id.toString())
  //     .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  //     .expect(200)
  // })
})

describe('GET /api/data/dataset-exps/:datasetId', () => {
  const payload = [
    {
      key: testDatasetOne._id.toString() + '-' + testExpOne._id.toString(),
      dataType: 'auto',
      isFid: false
    },
    {
      key: testDatasetOne._id.toString() + '-' + testExpOne._id.toString() + '/fid/12345',
      dataType: 'auto',
      isFid: true
    }
  ]

  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .get('/api/data/dataset-exps/?queryJSON=' + JSON.stringify(payload))
      .expect(403)
  })

  it('should return NMRium data object with spectrum and FID', async () => {
    const resp = await request(app)
      .get('/api/data/dataset-exps/?queryJSON=' + JSON.stringify(payload))
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    const body = JSON.parse(resp.text)
    expect(body.data.spectra.length).toBe(2)
    const filePath = path.join(process.env.DATASTORE_PATH, testExpOne.dataPath, testExpOne.expId)
    expect(getNMRiumDataObj).toHaveBeenCalledWith(filePath, testExpOne.title, false)
    expect(getNMRiumDataObj).toHaveBeenCalled(2)
  })
})

describe('PATCH /api/datasets/:datasetId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .patch('/api/datasets/' + testDatasetOne._id.toString())
      .expect(403)
  })

  it('should fail with error 422 if title is invalid', async () => {
    await request(app)
      .patch('/api/datasets/' + testDatasetOne._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .send({ title: '' })
      .expect(422)
  })

  it('should fail with error 401 if request is authorised by user without write access', async () => {
    await request(app)
      .patch('/api/datasets/' + testDatasetOne._id.toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .send({ title: 'New title     ' })
      .expect(401)
  })

  it('should change user group and title of dataset 1', async () => {
    const { body } = await request(app)
      .patch('/api/datasets/' + testDatasetOne._id.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .send({ title: 'New title     ', userId: testUserThree._id, groupId: testGroupTwo._id })
      .expect(200)

    expect(body).toMatchObject({
      id: testDatasetOne._id.toString(),
      title: 'New title',
      user: {
        _id: testUserThree._id.toString(),
        username: testUserThree.username,
        fullName: testUserThree.fullName
      },
      group: { _id: testGroupTwo._id.toString(), groupName: testGroupTwo.groupName },
      tags: ['test']
    })

    //asserting change in DB
    const dataset = await Dataset.findById(testDatasetOne._id)
    expect(dataset.title).toBe('New title')
    expect(dataset.user.toString()).toBe(testUserThree._id.toString())
    expect(dataset.group.toString()).toBe(testGroupTwo._id.toString())
  })
})

describe('GET /datasets', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app).get('/api/datasets/').expect(403)
  })

  it('should fail with status 422 if query is not defined', async () => {
    await request(app)
      .get('/api/datasets/')
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(422)
  })

  it('should return array with 3 datasets if default search parameters are given', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      tags: undefined,
      smiles: undefined
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 3)
    expect(body.datasets.length).toBe(3)
    expect(body.datasets[0].expsInfo.length).toBe(2)
    expect(body.datasets[1].molSVGs.length).toBe(1)
    //asserting default sorting
    expect(body.datasets[0]).toMatchObject({
      key: testDatasetTwo._id.toString(),
      title: testDatasetTwo.title,
      expCount: 2,
      tags: []
    })
  })

  it('should return array with 3 datasets sorted in ascending order by createdAt date', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      tags: undefined,
      smiles: undefined,
      sorterOrder: 'ascend',
      sorterField: 'createdAt'
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 3)
    expect(body.datasets.length).toBe(3)
    expect(body.datasets[0].key).toBe(testDatasetThree._id.toString())
  })

  it('should return array with test dataset one if title 1 is defined in search parameters', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      tags: undefined,
      smiles: undefined,
      title: '1'
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 1)
    expect(body.datasets.length).toBe(1)
    expect(body.datasets[0].title).toBe(testDatasetOne.title)
  })

  it('should return array with test dataset two if 3 day createdAt date range is provided ', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      tags: undefined,
      smiles: undefined,
      createdDateRange: [
        moment().subtract(3, 'days').format('YYYY-MM-DD'),
        moment().format('YYYY-MM-DD')
      ]
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 1)
    expect(body.datasets.length).toBe(1)
    expect(body.datasets[0].key).toBe(testDatasetTwo._id.toString())
  })

  it('should return array with dataset one if if updated date range 4 to 3 days back is provided', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      tags: undefined,
      smiles: undefined,
      updatedDateRange: [
        moment().subtract(4, 'days').format('YYYY-MM-DD'),
        moment().subtract(3, 'days').format('YYYY-MM-DD')
      ]
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 1)
    expect(body.datasets.length).toBe(1)
    expect(body.datasets[0].key).toBe(testDatasetOne._id.toString())
  })

  it('should return array with dataset two is smiles is defined and substructure is false', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      tags: undefined,
      smiles: ['C1(=CC(=CC=C1OC)C)'],
      substructure: false
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 1)
    expect(body.datasets.length).toBe(1)
    expect(body.datasets[0].key).toBe(testDatasetTwo._id.toString())
  })

  it('should return array with dataset one if smiles is defined and substructure is true', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      tags: undefined,
      smiles: ['C1(CCCO1)'],
      substructure: true
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.datasets.length).toBe(1)
    expect(body.datasets[0].key).toBe(testDatasetOne._id.toString())
  })

  it('should return array with dataset one if tags test is defined', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      smiles: undefined,
      tags: 'test'
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(200)

    expect(body.datasets.length).toBe(1)
    expect(body.datasets[0].key).toBe(testDatasetOne._id.toString())
  })

  it('should return array with dataset one if the request is authorised by test user one', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      smiles: undefined,
      tags: undefined
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 1)
    expect(body.datasets.length).toBe(1)
    expect(body.datasets[0].key).toBe(testDatasetOne._id.toString())
  })

  it('should return array with 3 datasets if request is authorised by user two', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      smiles: undefined,
      tags: undefined
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 3)
    expect(body.datasets.length).toBe(3)
  })

  it('should return array with dataset three if legacyData is set to true and request is authorised by test user three', async () => {
    const searchParams = {
      currentPage: 1,
      pageSize: 20,
      smiles: undefined,
      tags: undefined,
      legacyData: true
    }

    const { body } = await request(app)
      .get('/api/datasets/?' + new URLSearchParams(searchParams).toString())
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .expect(200)

    expect(body).toHaveProperty('total', 1)
    expect(body.datasets.length).toBe(1)
    expect(body.datasets[0].key).toBe(testDatasetThree._id.toString())
  })
})

describe('DELETE /api/datasets/:datasetId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .delete('/api/datasets/' + testDatasetOne._id)
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without write access', async () => {
    await request(app)
      .delete('/api/datasets/' + testDatasetOne._id)
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .expect(401)
  })

  it('should fail with error 404 if invalid dataset ID is provided', async () => {
    const newId = new mongoose.Types.ObjectId()
    await request(app)
      .delete('/api/datasets/' + newId.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .expect(404)
  })

  it('should delete test dataset three from DB', async () => {
    await request(app)
      .delete('/api/datasets/' + testDatasetThree._id)
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .expect(200)

    //asserting change in DB
    const dataset = await Dataset.findById(testDatasetThree._id)
    expect(dataset).toBeNull()
  })
})

describe('PATCH /api/datasets/tags/:datasetId', () => {
  it('should fail with error 403 if request is not authorized', async () => {
    await request(app)
      .patch('/api/datasets/tags/' + testDatasetTwo._id)
      .send({ tags: ['test2'] })
      .expect(403)
  })

  it('should fail with error 401 if request is authorised by user without write access', async () => {
    await request(app)
      .patch('/api/datasets/tags/' + testDatasetTwo._id)
      .set('Authorization', `Bearer ${testUserThree.tokens[0].token}`)
      .send({ tags: ['test2'] })
      .expect(401)
  })

  it('should fail with error 404 if invalid dataset ID is provided', async () => {
    const newId = new mongoose.Types.ObjectId()
    await request(app)
      .patch('/api/datasets/tags/' + newId.toString())
      .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
      .send({ tags: ['test2'] })
      .expect(404)
  })

  it('should update tags array for test dataset two', async () => {
    await request(app)
      .patch('/api/datasets/tags/' + testDatasetTwo._id)
      .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
      .send({ tags: ['test2'] })
      .expect(200)

    //asserting change in DB
    const dataset = await Dataset.findById(testDatasetTwo._id)
    expect(dataset.tags[0]).toBe('test2')
  })
})
