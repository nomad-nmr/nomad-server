import path from 'path'
import fs from 'fs/promises'

import { validationResult } from 'express-validator'
import JSZip from 'jszip'
import moment from 'moment'
import openChemLib from 'openchemlib'
const { Molecule: OCLMolecule, SSSearcher } = openChemLib

import Dataset from '../models/dataset.js'
import Experiment from '../models/experiment.js'
import ManualExperiment from '../models/manualExperiment.js'
import { getNMRiumDataObj } from '../utils/nmriumUtils.js'

export const postDataset = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).send(errors)
  }

  const { userId, groupId, title, nmriumData } = req.body

  try {
    const datasetObj = {
      user: userId ? userId : req.user._id,
      group: groupId ? groupId : req.user.group,
      title,
      nmriumData,
      smiles: getSmilesfromNMRiumData(nmriumData)
    }

    const dataset = new Dataset(datasetObj)

    const { _id } = await dataset.save()

    const newDataset = await Dataset.findById(_id)
      .populate('group', 'groupName')
      .populate('user', ['username', 'fullName'])

    const resObj = {
      id: newDataset._id,
      user: newDataset.user,
      group: newDataset.group,
      title: newDataset.title
    }

    res.status(200).json(resObj)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const getDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId)
      .populate('group', 'groupName')
      .populate('user', ['username', 'fullName'])

    //Updating NMR data arrays from raw Bruker zip files
    const spectraArr = await Promise.all(
      dataset.nmriumData.data.spectra.map(async i => {
        const expId = i.info.type === 'NMR FID' ? i.id.split('/fid/')[0] : i.id

        const experiment =
          i.dataType === 'auto'
            ? await Experiment.findById(expId)
            : await ManualExperiment.findById(expId)

        const filePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId
        )

        const nmriumDataObj = await getNMRiumDataObj(filePath, experiment.title, i.info.isFid)

        i.data = nmriumDataObj.spectra[0].data
        i.meta = nmriumDataObj.spectra[0].meta
        return Promise.resolve(i)
      })
    )

    dataset.nmriumData.data.spectra = [...spectraArr]

    const respObj = {
      datasetMeta: {
        id: dataset._id,
        title: dataset.title,
        user: dataset.user,
        group: dataset.group,
        tags: dataset.tags
      },
      nmriumData: dataset.nmriumData
    }

    const respJSON = JSON.stringify(respObj, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v))
    //.json can't be used as we already convert object to json above using custom function
    // deepcode ignore XSS: <please specify a reason of ignoring this>
    res.status(200).send(respJSON)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const putDataset = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).send(errors)
  }
  try {
    await Dataset.findByIdAndUpdate(req.params.datasetId, {
      ...req.body,
      smiles: getSmilesfromNMRiumData(req.body.nmriumData)
    })
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const getBrukerZip = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId)

    const mainZip = new JSZip()

    await Promise.all(
      dataset.nmriumData.data.spectra.map(async (i, count) => {
        if (i.info.type !== 'NMR FID') {
          const experiment =
            i.dataType === 'auto'
              ? await Experiment.findById(i.id)
              : await ManualExperiment.findById(i.id)

          const { datasetName, expNo } = experiment

          const zipFilePath = path.join(
            process.env.DATASTORE_PATH,
            experiment.dataPath,
            experiment.expId + '.zip'
          )
          const zipFile = await fs.readFile(zipFilePath)
          const zipObject = await JSZip.loadAsync(zipFile)

          const newExpNo = 10 + count

          //Changing subfolder structure in the zip file
          Object.keys(zipObject.files).forEach(key => {
            let newKey
            if (key.split('/').length === 1) {
              newKey = dataset.title + '/'
            } else {
              newKey = key.replace(
                datasetName + '/' + expNo + '/',
                dataset.title + '/' + newExpNo + '/'
              )
            }
            zipObject.files[newKey] = zipObject.files[key]
            delete zipObject.files[key]
          })

          const zipContent = await zipObject.generateAsync({ type: 'nodebuffer' })
          await mainZip.loadAsync(zipContent, { createFolders: true })
        }
      })
    )
    dataset.nmriumData.data.molecules.forEach(i => {
      mainZip.file(dataset.title + '/' + i.label + '.mol', i.molfile)
    })

    mainZip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(res)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const patchDataset = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).send(errors)
  }
  const { title, userId, groupId } = req.body
  try {
    const dataset = await Dataset.findByIdAndUpdate(req.params.datasetId, {
      title,
      group: groupId,
      user: userId
    })
      .populate('group', 'groupName')
      .populate('user', ['username', 'fullName'])

    const respObj = {
      id: dataset._id,
      title: dataset.title,
      user: dataset.user,
      group: dataset.group,
      tags: dataset.tags
    }
    res.status(200).json(respObj)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const searchDatasets = async (req, res) => {
  try {
    const {
      title,
      createdDateRange,
      updatedDateRange,
      groupId,
      userId,
      currentPage,
      pageSize,
      sorterField,
      sorterOrder,
      smiles,
      substructure,
      tags,
      legacyData
    } = req.query

    if (!currentPage || !pageSize) {
      return res.send(422)
    }

    let sorter
    if (!sorterOrder || sorterOrder === 'undefined') {
      sorter = { createdAt: 'desc' }
    } else {
      sorter = sorterOrder === 'descend' ? { [sorterField]: 'desc' } : { [sorterField]: 'asc' }
    }

    const dataAccess = await req.user.getDataAccess()

    const searchParams = { $and: [{}] }

    if (title && title !== 'undefined') {
      // file deepcode ignore reDOS: <fix using lodash does not seem to work>
      const regex = new RegExp(title, 'i')
      searchParams.$and.push({ title: { $regex: regex } })
    }

    if (createdDateRange && createdDateRange !== 'undefined') {
      const datesArr = createdDateRange.split(',')
      searchParams.$and.push({
        createdAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })
    }

    if (updatedDateRange && updatedDateRange !== 'undefined') {
      const datesArr = updatedDateRange.split(',')
      searchParams.$and.push({
        updatedAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })
    }

    if (
      smiles !== 'undefined' &&
      smiles.length > 0 &&
      (substructure === 'false' || substructure === 'undefined')
    ) {
      searchParams.$and.push({ smiles })
    }

    if (tags !== 'undefined' && tags.length > 0) {
      searchParams.$and.push({ tags })
    }

    const adminSearchLogic = () => {
      if (groupId && groupId !== 'undefined') {
        searchParams.$and.push({ group: groupId })
      }

      if (userId && userId !== 'undefined') {
        searchParams.$and.push({ user: userId })
      }
    }

    //this switch should assure that search is performed in accordance with data access privileges
    switch (dataAccess) {
      case 'user':
        searchParams.$and.push({ user: req.user._id })
        break

      case 'group':
        if (legacyData === 'true') {
          searchParams.$and.push({ user: req.user._id })
          searchParams.$nor = [{ group: req.user.group }]
        } else {
          if (userId && userId !== 'undefined') {
            searchParams.$and.push({ user: userId, group: req.user.group })
          } else {
            searchParams.$and.push({ group: req.user.group })
          }
        }
        break

      case 'admin-b':
        if (legacyData === 'true') {
          searchParams.$and.push({ user: req.user._id })
          searchParams.$nor = [{ group: req.user.group }]
        } else {
          adminSearchLogic()
          if ((!groupId || groupId === 'undefined') && (!userId || userId === 'undefined')) {
            searchParams.$and.push({ group: req.user.group })
          }
        }
        break

      case 'admin':
        adminSearchLogic()
        break
      default:
        throw new Error('Data access rights unknown')
    }

    let total = await Dataset.find(searchParams).countDocuments()
    let datasets

    if (smiles !== 'undefined' && smiles.length > 0 && substructure === 'true') {
      //search including substructure
      const searcher = new SSSearcher()
      const fragment = OCLMolecule.fromSmiles(smiles)
      fragment.setFragment(true)
      searcher.setFragment(fragment)

      //getting all datasets that fits searchParams without pagination
      //If pagination is used substructure search is performed only on one page
      const datasetsToFilter = await Dataset.find(searchParams)
        .sort(sorter)
        .populate('user', 'username')
        .populate('group', 'groupName')

      //using OCL to filter array to get datasets containing substructure
      datasets = datasetsToFilter.filter(i => {
        const hasSubstructure = i.smiles.find(j => {
          const molecule = OCLMolecule.fromSmiles(j)
          searcher.setMolecule(molecule)
          return searcher.isFragmentInMolecule()
        })

        return hasSubstructure
      })

      //returning total = null disables pagination on front end
      total = null
    } else {
      //dataset search including pagination if substructure is not involved
      datasets = await Dataset.find(searchParams)
        .skip((currentPage - 1) * pageSize)
        .limit(+pageSize)
        .sort(sorter)
        .populate('user', 'username')
        .populate('group', 'groupName')
    }

    const respData = datasets.map(i => {
      const expsInfo = i.nmriumData.data.spectra.map(spec => ({
        key: i.id + '-' + spec.id,
        dataType: spec.dataType,
        isFid: spec.info.isFid,
        dimension: spec.info.dimension,
        nucleus: spec.info.nucleus,
        pulseSequence: spec.info.pulseSequence,
        solvent: spec.info.solvent,
        name: spec.info.name,
        title: spec.info.title,
        date: spec.info.date
      }))
      return {
        key: i._id,
        username: i.user.username,
        groupName: i.group.groupName,
        title: i.title,
        tags: i.tags,
        expCount: i.nmriumData.data.spectra.length,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        expsInfo,
        molSVGs: i.nmriumData.data.molecules.map(mol => {
          const molecule = OCLMolecule.fromMolfile(mol.molfile)
          return {
            svg: molecule.toSVG(150, 150, null, {
              suppressChiralText: true,
              suppressESR: true,
              autoCrop: true
            }),
            label: mol.label
          }
        })
      }
    })
    res.status(200).json({ datasets: respData, total })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findByIdAndDelete(req.params.datasetId)
    if (!dataset) {
      return res.sendStatus(404)
    }
    res.status(200).json({ datasetId: dataset._id })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export const updateTags = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId)
    if (!dataset) {
      return res.sendStatus(404)
    }
    dataset.tags = req.body.tags
    const savedDataset = await dataset.save()
    res.status(200).json({ tags: savedDataset.tags, datasetId: savedDataset._id })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

const getSmilesfromNMRiumData = nmriumData => {
  const smilesArray = nmriumData.data.molecules.map(i => {
    const molecule = OCLMolecule.fromMolfile(i.molfile)
    return molecule.toSmiles()
  })
  return smilesArray
}
