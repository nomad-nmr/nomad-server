const { validationResult } = require('express-validator')

const ParameterSet = require('../../models/parameterSet')
const Group = require('../../models/group')

exports.getParamSets = async (req, res) => {
  const { instrumentId, searchValue, list } = req.query
  const group = await Group.findById(req.user.group)

  const searchParams = { $and: [{}] }
  if (instrumentId !== 'null') {
    searchParams.$and.push({ availableOn: instrumentId })
  }

  if (searchValue) {
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
    if (list) {
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
    res.status(500).send(error)
  }
}

exports.postParamSet = async (req, res) => {
  const errors = validationResult(req)

  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }

    const newParamSet = new ParameterSet(convertInputData(req.body))
    const paramSet = await newParamSet.save()
    res.send(paramSet)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

exports.updateParamSet = async (req, res) => {
  const errors = validationResult(req)

  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }
    const updatedParamSet = await ParameterSet.findByIdAndUpdate(
      req.body._id,
      convertInputData(req.body)
    )
    res.send(updatedParamSet)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

exports.deleteParamSet = async (req, res) => {
  try {
    const paramSet = await ParameterSet.findByIdAndDelete(req.params.id)
    res.send({ message: 'Delete opeartion successful', id: paramSet._id })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
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
