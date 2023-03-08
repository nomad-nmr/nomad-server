import { validationResult } from 'express-validator'

import ParameterSet from '../../models/parameterSet.js'
import Group from '../../models/group.js'

export async function getParamSets(req, res) {
  const { instrumentId, searchValue, list } = req.query
  const group = await Group.findById(req.user.group)

  const searchParams = { $and: [{}] }
  if (instrumentId !== 'null') {
    searchParams.$and.push({ availableOn: instrumentId })
  }

  if (searchValue) {
    // file deepcode ignore reDOS: <suggested fix using lodash does not seem to work>
    const regex = new RegExp(searchValue, 'i')
    searchParams.$and.push({
      $or: [{ name: { $regex: regex } }, { description: { $regex: regex } }]
    })
  }

  if (req.user.accessLevel !== 'admin') {
    searchParams.$and.push({ hidden: 'false' })
  }

  try {
    let paramSets = []
    if (group.expList.length > 0) {
      await group.populate('expList')
      paramSets = group.expList
    } else {
      paramSets = await ParameterSet.find(searchParams).sort({ count: 'desc' })
    }
    if (list === 'true') {
      const paramSetsList = paramSets.map(paramSet => ({
        name: paramSet.name,
        description: paramSet.description,
        id: paramSet._id
      }))
      return res.send(paramSetsList)
    }
    res.send(paramSets)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export async function postParamSet(req, res) {
  const errors = validationResult(req)

  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }

    const newParamSet = new ParameterSet(convertInputData(req.body))
    const paramSet = await newParamSet.save()
    res.status(200).json(paramSet)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export async function updateParamSet(req, res) {
  const errors = validationResult(req)

  try {
    if (!errors.isEmpty()) {
      return res.status(422).json(errors)
    }
    const updatedParamSet = await ParameterSet.findByIdAndUpdate(
      req.body._id,
      convertInputData(req.body)
    )
    res.status(200).json(updatedParamSet)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
}

export async function deleteParamSet(req, res) {
  try {
    const paramSet = await ParameterSet.findByIdAndDelete(req.params.id)
    res.send({ message: 'Delete successful', id: paramSet._id })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'API error' })
  }
}

//Helper function that takes req.body as input and returns object ready to be stored in DB
const convertInputData = input => {
  const defaultParamsArr = []
  for (const [key, value] of Object.entries(input.defaultParams)) {
    defaultParamsArr.push({ name: key, value })
  }
  const customParamsArr = input.customParams
    ? input.customParams.map(param => ({
        ...param,
        name: param.name.toLowerCase()
      }))
    : []

  const output = {
    ...input,
    defaultParams: defaultParamsArr,
    name: input.name.toLowerCase(),
    customParams: customParamsArr
  }
  return output
}
