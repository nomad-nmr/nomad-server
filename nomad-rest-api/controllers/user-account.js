import User from '../models/user.js'

export async function getUserSettings(req, res) {
  const { user } = req
  res.status(200).json({
    username: user.username,
    fullName: user.fullName,
    sendStatusError: user.sendStatusEmail.error,
    sendStatusArchived: user.sendStatusEmail.archived
  })
}

export async function patchUserSettings(req, res) {
  try {
    const { fullName, sendStatusError, sendStatusArchived } = req.body

    await User.findByIdAndUpdate(req.user._id, {
      fullName,
      sendStatusEmail: { error: sendStatusError, archived: sendStatusArchived }
    })
    res.status(200).json({ fullName, sendStatusArchived, sendStatusError })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
