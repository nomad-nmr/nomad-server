import moment from 'moment'
import { validationResult } from 'express-validator'

import Experiment from '../../models/experiment.js'
import Claim from '../../models/claim.js'
import Group from '../../models/group.js'
import User from '../../models/user.js'
import Instrument from '../../models/instrument.js'
import Grant from '../../models/grant.js'
import {
  checkDuplicate,
  getGrantInfo,
  getSearchParams,
  getSearchParamsClaims
} from '../../utils/accountsUtils.js'

export async function getCosts(req, res) {
  const { groupId, dateRange } = req.query
  try {
    const searchParams = getSearchParams(dateRange)
    const searchParamsClaims = getSearchParamsClaims(dateRange)

    const resData = []
    const instrumentList = await Instrument.find({ isActive: true }, 'name cost')

    if (groupId === 'undefined') {
      //each entry of the table is group
      const groupList = await Group.find({ isActive: true }, 'groupName')

      await Promise.all(
        groupList.map(async entry => {
          const newEntry = { name: entry.groupName, costsPerInstrument: [], totalCost: 0 }

          //adding group or user into search parameters
          const entrySearchParams = {}
          const entrySearchParamsClaims = {}
          entrySearchParams.$and = [...searchParams.$and, { 'group.id': entry._id }]
          entrySearchParamsClaims.$and = [...searchParamsClaims.$and, { group: entry._id }]

          const expArray = await Experiment.find(entrySearchParams, 'instrument totalExpTime')
          const claimsArray = await Claim.find(entrySearchParamsClaims, 'instrument expTime')

          instrumentList.forEach((i, index) => {
            const filteredExpArray = expArray.filter(exp => exp.instrument.name === i.name)
            const filteredClaimsArray = claimsArray.filter(
              claim => claim.instrument.toString() === i._id.toString()
            )
            const expTimeAuto = getExpTimeSum(filteredExpArray)
            const expTimeClaims = filteredClaimsArray.reduce(
              (sum, claim) => sum + Number(claim.expTime),
              0
            )
            const totalExpTime = moment.duration(expTimeAuto).asHours() + expTimeClaims
            const cost = Math.round(totalExpTime * i.cost * 100) / 100
            newEntry.costsPerInstrument.push({
              instrument: i.name,
              expTimeClaims,
              expTimeAuto,
              cost
            })
            newEntry.totalCost += cost
          })
          resData.push(newEntry)
        })
      )
    } else {
      //each entry of the table is user
      if (groupId !== 'all') {
        //add the groupid filter if all users are not requested
        searchParams.$and = [...searchParams.$and, { 'group.id': groupId }]
        searchParamsClaims.$and = [...searchParamsClaims.$and, { group: groupId }]
      }

      const expArray = await Experiment.find(searchParams, 'instrument totalExpTime user')
      const claimsArray = await Claim.find(searchParamsClaims, 'instrument expTime user')

      //getting list of users out of experiment array
      //to make sure that lists include users that have been moved to a different group
      const usrSet = new Set()
      expArray.forEach(exp => usrSet.add(exp.user.id.toString()))
      claimsArray.forEach(claim => usrSet.add(claim.user.toString()))
      const usrArray = Array.from(usrSet)

      await Promise.all(
        usrArray.map(async usrId => {
          const user = await User.findById(usrId)
          const grantInfo = await getGrantInfo(usrId, user.group)

          let grant
          if (grantInfo) {
            grant = await Grant.findById(grantInfo.grantId)
          }

          const usrInactive = !user.isActive || user.group.toString() !== groupId
          const newEntry = {
            name: `${user.username} - ${user.fullName}`,
            grantCode: grant && grant.grantCode,
            costsPerInstrument: [],
            totalCost: 0
          }

          if (groupId !== 'all') {
            newEntry.name += `${usrInactive ? '(Inactive)' : ''}`
          }

          instrumentList.forEach(i => {
            const filteredExpArray = expArray.filter(
              exp => exp.instrument.name === i.name && exp.user.id.toString() === usrId
            )
            const filteredClaimsArray = claimsArray.filter(
              claim =>
                claim.instrument.toString() === i._id.toString() && claim.user.toString() === usrId
            )
            const expTimeAuto = getExpTimeSum(filteredExpArray)
            const expTimeClaims = filteredClaimsArray.reduce(
              (sum, claim) => sum + Number(claim.expTime),
              0
            )
            const totalExpTime = moment.duration(expTimeAuto).asHours() + expTimeClaims
            const cost = Math.round(totalExpTime * i.cost * 100) / 100

            newEntry.costsPerInstrument.push({
              instrument: i.name,
              expTimeClaims,
              expTimeAuto,
              cost
            })
            newEntry.totalCost += cost
          })

          resData.push(newEntry)
        })
      )
    }

    //Calculation of the last row (Total) sum of columns
    const totalEntry = {
      name: 'Total',
      costsPerInstrument: [],
      totalCost: 0
    }

    if (resData.length === 0) {
      return res.send([])
    }

    resData[0].costsPerInstrument.forEach((col, colIndex) => {
      const expTimeClaimsSumArr = []
      const costSumArr = []
      const expTimeAutoSumArr = []
      resData.forEach(row => {
        expTimeClaimsSumArr.push(row.costsPerInstrument[colIndex].expTimeClaims)
        costSumArr.push(row.costsPerInstrument[colIndex].cost)
        expTimeAutoSumArr.push(
          moment.duration(row.costsPerInstrument[colIndex].expTimeAuto).asSeconds()
        )
      })
      totalEntry.costsPerInstrument.push({
        instrument: col.instrument,
        expTimeClaims: expTimeClaimsSumArr.reduce((a, b) => a + b, 0),
        cost: Math.round(costSumArr.reduce((a, b) => a + b, 0) * 100) / 100,
        expTimeAuto: moment
          .duration(
            expTimeAutoSumArr.reduce((a, b) => a + b, 0),
            'seconds'
          )
          .format('HH:mm:ss', { trim: false })
      })
    })

    resData.forEach(row => {
      totalEntry.totalCost += row.totalCost
      row.totalCost = Math.round(row.totalCost * 100) / 100
    })
    sortNames(resData)
    totalEntry.totalCost = Math.round(totalEntry.totalCost * 100) / 100

    res.send([...resData, totalEntry])
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

//Helper function to calculate sums of ExpT
const getExpTimeSum = expArr => {
  const expTimeSum = moment.duration()
  expArr.forEach(exp => {
    expTimeSum.add(exp.totalExpTime)
  })
  return expTimeSum.format('HH:mm:ss', { trim: false })
}

//Helper function to sort out alphabetically the first column with names
const sortNames = inputArray =>
  inputArray.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  })

export async function getInstrumentsCosting(req, res) {
  try {
    const resData = await Instrument.find({ isActive: true }, 'name cost')
    res.send(resData)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function putInstrumentsCosting(req, res) {
  try {
    const instrumentsArray = Object.keys(req.body)
    await Promise.all(
      instrumentsArray.map(async i => {
        await Instrument.findOneAndUpdate({ name: i }, { $set: { cost: req.body[i] } })
      })
    )
    res.send()
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function postGrant(req, res) {
  const errors = validationResult(req)
  const { grantCode, description, include, multiplier } = req.body

  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }

    const grants = await Grant.find({})
    if (checkDuplicate(include, grants)) {
      return res.status(409).send({
        message: 'Submitted grant includes user or group that has been added on a different grant'
      })
    }

    const newGrantObj = {
      grantCode: grantCode.toUpperCase(),
      description,
      include,
      multiplier
    }

    const grant = new Grant(newGrantObj)
    const grantObj = await grant.save()
    res.status(200).json({ ...grantObj._doc, key: grantObj._id })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function getGrants(req, res) {
  try {
    const grants = await Grant.find({})
    const resData = grants.map(grant => ({ ...grant._doc, key: grant._doc._id }))
    res.status(200).json(resData)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function deleteGrant(req, res) {
  try {
    const grant = await Grant.findByIdAndDelete(req.params.grantId)
    res.status(200).json({ grantId: grant._id })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function putGrant(req, res) {
  const { description, multiplier, include, _id } = req.body
  try {
    const grants = await Grant.find({})
    if (checkDuplicate(include, grants, _id)) {
      return res.status(409).send({
        message: 'Submitted grant includes user or group that has been added on a different grant'
      })
    }

    const updatedGrant = await Grant.findByIdAndUpdate(req.body._id, {
      description,
      include,
      multiplier
    })

    if (!updatedGrant) {
      return res.sendStatus(404)
    }

    res.status(200).json({ ...updatedGrant._doc, key: updatedGrant._id })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function getGrantsCosts(req, res) {
  try {
    const { dateRange } = req.query
    const searchParams = getSearchParams(dateRange)
    const searchParamsClaims = getSearchParamsClaims(dateRange)

    const grants = await Grant.find({}, 'grantCode description')

    const grantsCosts = await Promise.all(
      grants.map(async grant => {
        const entrySearchParams = {
          $and: [...searchParams.$and, { 'grantCosting.grantId': grant._id }]
        }
        const entrySearchParamsClaims = {
          $and: [...searchParamsClaims.$and, { 'grantCosting.grantId': grant._id }]
        }
        const usersIdSet = new Set()

        const experiments = await Experiment.find(entrySearchParams, 'grantCosting user')
        const costExps =
          Math.round(
            experiments.reduce((accu, exp) => {
              usersIdSet.add(exp.user.id.toString())
              return accu + exp.grantCosting.cost
            }, 0) * 100
          ) / 100

        const claims = await Claim.find(entrySearchParamsClaims, 'grantCosting user')
        const costClaims =
          Math.round(
            claims.reduce((accu, claim) => {
              usersIdSet.add(claim.user._id.toString())
              return accu + claim.grantCosting.cost
            }, 0) * 100
          ) / 100

        const usersArray = await getUsersArr(usersIdSet)

        return {
          ...grant._doc,
          costExps,
          costClaims,
          usersArray,
          totalCost: costExps + costClaims,
          key: grant._id.toString()
        }
      })
    )

    //looking for experiments and claims with no grant ID defined
    const noGrantSearchParams = {
      $and: [...searchParams.$and, { 'grantCosting.grantId': { $exists: false } }]
    }

    const noGrantSearchParamsClaims = {
      $and: [...searchParamsClaims.$and, { 'grantCosting.grantId': { $exists: false } }]
    }

    const usersIdSet = new Set()

    const noGrantExps = await Experiment.find(noGrantSearchParams, 'grantCosting user')
    const noGrantClaims = await Claim.find(noGrantSearchParamsClaims, 'grantCosting user')

    noGrantExps.forEach(exp => usersIdSet.add(exp.user.id.toString()))
    noGrantClaims.forEach(claim => usersIdSet.add(claim.user._id.toString()))

    const noGrantsData = {
      expsCount: noGrantExps.length,
      claimsCount: noGrantClaims.length,
      users: await getUsersArr(usersIdSet)
    }

    res.status(200).json({ grantsCosts, noGrantsData })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

// helper function that co

const getUsersArr = async usersIdSet => {
  const usersArray = await Promise.all(
    Array.from(usersIdSet).map(async userId => {
      const user = await User.findById(userId, 'username fullName')
      return user
    })
  )
  return Promise.resolve(usersArray)
}
