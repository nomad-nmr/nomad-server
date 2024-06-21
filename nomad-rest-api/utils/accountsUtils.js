import moment from 'moment'

import Grant from '../models/grant.js'

//helper function that checks if user or group has been already added on the grant
const checkDuplicate = (includeArray, grants, grantId) => {
  const usrGrpIdArray = []
  grants.forEach(entry => {
    if (entry._id.toString() !== grantId) {
      entry.include.forEach(element => {
        usrGrpIdArray.push(element.id)
      })
    }
  })

  for (let i of includeArray) {
    const found = usrGrpIdArray.find(id => id.toString() === i.id.toString())
    if (found) {
      return true
    }
  }

  return false
}

const getSearchParams = dateRange => {
  const searchParams = { $and: [{ status: 'Archived' }] }
  if (dateRange && dateRange !== 'undefined' && dateRange !== 'null') {
    const datesArr = dateRange.split(',')
    searchParams.$and.push({
      updatedAt: {
        $gte: new Date(datesArr[0]),
        $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
      }
    })
  }
  return searchParams
}

const getSearchParamsClaims = dateRange => {
  const searchParamsClaims = { $and: [{ status: 'Approved' }] }
  if (dateRange && dateRange !== 'undefined' && dateRange !== 'null') {
    const datesArr = dateRange.split(',')
    searchParamsClaims.$and.push({
      createdAt: {
        $gte: new Date(datesArr[0]),
        $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
      }
    })
  }
  return searchParamsClaims
}

const getGrantId = async (userId, groupId) => {
  let grant = await Grant.findOne({
    include: {
      $elemMatch: { id: userId }
    }
  })

  if (!grant) {
    grant = await Grant.findOne({
      include: {
        $elemMatch: { id: groupId }
      }
    })
  }

  if (grant) {
    return Promise.resolve(grant._id)
  } else {
    return Promise.resolve(undefined)
  }
}

export { checkDuplicate, getSearchParams, getSearchParamsClaims, getGrantId }
