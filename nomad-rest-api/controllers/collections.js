import fs from 'fs'
import path from 'path'
import { mkdir } from 'fs/promises'

import { validationResult } from 'express-validator'
import JSZip from 'jszip'
import { v4 as uuidv4 } from 'uuid'

import Collection from '../models/collection.js'
import Dataset from '../models/dataset.js'
import { getDatasetResp } from './datasets.js'
import zipDataset from '../utils/zipDataset.js'
import transporter from '../utils/emailTransporter.js'

const downloadsPath = process.env.DOWNLOADS_PATH || '/app/downloads'

export const postCollection = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).send(errors)
  }
  try {
    const { collection, newTitle, datasets } = req.body
    if (collection === '##-new-##' && !newTitle) {
      return res.status(422).json({ errors: [{ msg: 'New Title has to be defined' }] })
    }
    const respData = {
      duplicatesCount: 0,
      newId: undefined,
      newTitle: undefined
    }

    if (newTitle) {
      const collection = new Collection({
        user: req.user._id,
        group: req.user.group,
        title: newTitle.trim(),
        datasets
      })
      const newCollection = await collection.save()

      await Promise.all(
        datasets.map(async id => {
          const dataset = await Dataset.findById(id)
          dataset.inCollections.push(newCollection._id)
          await dataset.save()
        })
      )

      respData.newId = newCollection._id
      respData.newTitle = newCollection.title
    } else {
      const collection = await Collection.findById(req.body.collection)
      if (
        req.user.accessLevel !== 'admin' &&
        req.user.id.toString() !== collection.user.toString()
      ) {
        return res.status(403).send()
      }
      const newDatasets = [...collection.datasets]
      await Promise.all(
        req.body.datasets.map(async datasetId => {
          const found = newDatasets.find(i => i.toString() === datasetId.toString())
          if (found) {
            respData.duplicatesCount++
          } else {
            newDatasets.push(datasetId)
            const dataset = await Dataset.findById(datasetId)
            dataset.inCollections.push(collection._id)
            await dataset.save()
          }
        })
      )
      collection.datasets = newDatasets
      await collection.save()
    }
    res.status(200).json(respData)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getCollections = async (req, res) => {
  const { userId, groupId, legacyData, search } = req.query

  try {
    let searchParams = { user: req.user.id, group: req.user.group }

    if (search === 'true') {
      if (userId !== 'undefined' && legacyData !== 'true') {
        searchParams = { user: userId, group: groupId !== 'undefined' ? groupId : req.user.group }
      } else if (userId !== 'undefined' && legacyData === 'true') {
        searchParams = { user: req.user.id, $nor: [{ group: req.user.group }] }
      } else if (groupId !== 'undefined') {
        searchParams = { group: groupId }
      } else {
        searchParams = {}
      }
    } else if (search === 'shared') {
      searchParams = {
        $or: [{ 'sharedWith.id': req.user.id }, { 'sharedWith.id': req.user.group.toString() }]
      }
    }

    let respData
    const collections = await Collection.find(searchParams)
      .sort({ updatedAt: 'desc' })
      .populate('user', 'username')
      .populate('group', 'groupName')

    if (req.query.list === 'true') {
      respData = collections.map(i => ({ label: i.title, value: i._id }))
    } else {
      respData = collections.map(i => ({
        key: i._id,
        username: i.user.username,
        group: i.group.groupName,
        title: i.title,
        datasetsCount: i.datasets.length,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt
      }))
    }
    res.status(200).send(respData)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getDatasets = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.collectionId)
      .populate('user', 'username')
      .populate('group', 'groupName')
    const datasets = await Promise.all(
      collection.datasets.map(datasetId => {
        const dataset = Dataset.findById(datasetId)
          .populate('user', 'username')
          .populate('group', 'groupName')
        return dataset
      })
    )
    const respData = {
      title: collection.title,
      id: collection.id,
      group: collection.group,
      user: collection.user,
      sharedWith: collection.sharedWith,
      datasetsData: getDatasetResp(datasets)
    }
    res.status(200).json(respData)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const deleteCollection = async (req, res) => {
  try {
    const { _id } = await Collection.findByIdAndDelete(req.params.collectionId)
    if (!_id) {
      return res.status(404).send()
    }
    res.status(200).json({ collectionId: _id })
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const removeDatasets = async (req, res) => {
  try {
    const { collectionId } = req.params
    const { datasetIds } = req.body
    const collection = await Collection.findById(collectionId)
    const newDatasetIds = collection.datasets.filter(id => !datasetIds.includes(id.toString()))
    collection.datasets = newDatasetIds
    await collection.save()
    res.status(200).json({ newDatasetIds, collectionId })
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const patchMetadata = async (req, res) => {
  const { userId, groupId, title } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).send(errors)
  }
  try {
    const collection = await Collection.findById(req.params.collectionId)
    if (!collection) {
      return res.status(404).send()
    }
    let resObj

    if (userId && userId !== 'undefined') {
      await Promise.all(
        collection.datasets.map(async datasetId => {
          await Dataset.findByIdAndUpdate(datasetId, { user: userId, group: groupId })
        })
      )

      const updatedCollection = await Collection.findByIdAndUpdate(collection._id, {
        title,
        user: userId,
        group: groupId
      })
        .populate('user', 'username')
        .populate('group', 'groupName')

      resObj = {
        title: updatedCollection.title,
        id: updatedCollection._id,
        group: updatedCollection.group,
        user: updatedCollection.user
      }
    } else {
      collection.title = title
      resObj = { id: collection._id, title: collection.title }
      await collection.save()
    }

    res.status(200).send(resObj)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const patchShare = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.collectionId, {
      sharedWith: req.body
    })
    res.status(200).send(collection.sharedWith)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getZip = async (req, res) => {
  const { user } = req
  try {
    const collection = await Collection.findById(req.params.collectionId)
    const mainZip = new JSZip()

    await Promise.all(
      collection.datasets.map(async id => {
        await zipDataset(mainZip, id)
      })
    )

    const uuid = uuidv4()
    const uuidPath = path.join(downloadsPath, uuid)

    await mkdir(uuidPath)

    const sanitisedTitle = collection.title.replace(/[\/\\]/, '_') + '.zip'
    const zipPath = path.join(uuidPath, sanitisedTitle)

    const downloadTimeout = +process.env.COLLECTION_DOWNLOAD_TIMEOUT || 30

    mainZip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(zipPath))
      .on('finish', function () {
        transporter.sendMail({
          from: process.env.SMTP_SENDER,
          to: user.email,
          subject: 'NOMAD-3 data collection download link',
          html: `<p>Dear user ${user.fullName ? user.fullName : user.username}</p>
          <p>Use the link bellow to download data collection "${collection.title}"</p>
          <p><a href="${
            process.env.FRONT_HOST_URL
          }/downloads/${uuid}/${sanitisedTitle}">Download Collection Link</a></p>
          <p>Please note that the link is valid for ${downloadTimeout} minutes only</p>
          `
        })
      })

    setTimeout(() => {
      fs.rmSync(uuidPath, { recursive: true, force: true })
    }, downloadTimeout * 60000)

    res.status(200).json({ email: user.email, title: collection.title })
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}
