const User = require('../../models/user')
const transporter = require('../../utils/emailTransporter')

exports.postMessage = async (req, res) => {
  const { recipients, subject, message } = req.body
  //excludedRec can be undefined if the controller is used to send message upon
  //sample reject
  let { excludeRec } = req.body
  if (!excludeRec) {
    excludeRec = []
  }

  try {
    const recipientsSet = new Set()

    const getUserList = async recList => {
      let userList = []
      await Promise.all(
        recList.map(async entry => {
          let users = []
          switch (entry.type) {
            case 'user':
              let user = undefined
              if (entry.id) {
                user = await User.findById(entry.id, 'username email')
              } else {
                user = await User.findOne({ username: entry.name }, 'username email')
              }
              users = [user]
              break

            case 'group':
              users = await User.find({ group: entry.id, isActive: true }, 'username email')
              break

            case 'all':
              users = await User.find({ isActive: true }, 'username email')
              break

            default:
              throw new Error('Recipient type unknown')
          }
          //   console.log(users)
          userList = [...userList, ...users]
        })
      )
      return userList
    }
    const recList = await getUserList(recipients)
    const recExcList = await getUserList(excludeRec)

    recList.forEach(user => {
      const excluded = recExcList.find(excU => excU.username === user.username)
      if (!excluded && user.email) {
        recipientsSet.add(user.email)
      }
    })

    await transporter.sendMail({
      from: process.env.SMTP_SENDER,
      cc: process.env.SMTP_SENDER,
      to: [...recipientsSet],
      subject: 'NOMAD: ' + (subject ? subject : ''),
      text: message
    })

    res.status(200).send(recipientsSet.size.toString())
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
