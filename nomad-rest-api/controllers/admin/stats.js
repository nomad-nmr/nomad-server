import User from '../../models/user.js'
import Group from '../../models/group.js'

export async function getDatastoreStats(req, res) {
  const { user, group } = req.query
  let searchParams = {}
  let respObj = {}

  if (user && !group) {
    searchParams = { username: user }
    respObj = { user }
  } else if (group && !user) {
    const { _id } = await Group.findOne({ groupName: group })
    searchParams = { group: _id }
    respObj = { group }
  } else {
    searchParams = { isActive: true }
  }

  const users = await User.find(searchParams)

  const { nmriumCount, downloadCount } = users.reduce(
    (accuObj, user) => {
      accuObj.nmriumCount += user.stats.nmriumCount
      accuObj.downloadCount += user.stats.downloadCount
      return accuObj
    },
    { nmriumCount: 0, downloadCount: 0 }
  )

  respObj.nmriumUsage = `${Math.round((nmriumCount / (nmriumCount + downloadCount)) * 100)}%`

  res.status(200).json(respObj)
}
