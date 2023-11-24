import User from '../../models/user.js'

export async function getDatastoreStats(req, res) {
  const users = await User.find({ isActive: true })

  const statsObj = users.reduce(
    (accuObj, user) => {
      accuObj.nmriumCount += user.stats.nmriumCount
      accuObj.downloadCount += user.stats.downloadCount
      return accuObj
    },
    { nmriumCount: 0, downloadCount: 0 }
  )

  res.status(200).json(statsObj)
}
