import moment from 'moment'

import Experiment from '../../models/experiment.js'
import Claim from '../../models/claim.js'
import Group from '../../models/group.js'
import User from '../../models/user.js'
import Instrument from '../../models/instrument.js'
import Grant from '../../models/grant.js'
import grant from '../../models/grant.js'

export async function getCosts(req, res) {
  const { groupId, dateRange } = req.query
  try {
    const searchParams = { $and: [{ status: 'Archived' }] }
    const searchParamsClaims = { $and: [{ status: 'Approved' }] }

    if (dateRange && dateRange !== 'undefined' && dateRange !== 'null') {
      const datesArr = dateRange.split(',')
      searchParams.$and.push({
        updatedAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })
      searchParamsClaims.$and.push({
        createdAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })
    }

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

      searchParams.$and = [...searchParams.$and, { 'group.id': groupId }]
      searchParamsClaims.$and = [...searchParamsClaims.$and, { group: groupId }]

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
          const usrInactive = !user.isActive || user.group.toString() !== groupId
          const newEntry = {
            name: `${user.username} - ${user.fullName} ${usrInactive ? '(Inactive)' : ''}`,
            costsPerInstrument: [],
            totalCost: 0
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
  try {
    const grant = new Grant(req.body)
    await grant.save()

    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

export async function getGrants(req, res) {
  try {
    const grants = await Grant.find({})
    const resData = grants.map(grant => ({ ...grant._doc, key: grant._doc._id }))
    console.log(resData)
    res.status(200).json(resData)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
