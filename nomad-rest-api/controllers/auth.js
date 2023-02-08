import bcrypt from 'bcryptjs'
import { verify } from 'jsonwebtoken'
import { validationResult } from 'express-validator'

import User from '../models/user.js'
import transporter from '../utils/emailTransporter.js'

export async function postLogin(req, res) {
  try {
    const user = await User.findOne({ username: req.body.username })

    if (!user) {
      return res.status(400).send('Wrong username or password')
    }
    if (!user.isActive) {
      return res.status(400).send('User is inactive')
    }

    await user.populate('group')

    const passMatch = await bcrypt.compare(req.body.password, user.password)
    if (!passMatch) {
      return res.status(400).send('Wrong username or password')
    }

    const token = await user.generateAuthToken()

    return res.send({
      username: user.username,
      accessLevel: user.accessLevel,
      groupName: user.group.groupName,
      token: token,
      expiresIn: process.env.JWT_EXPIRATION
    })
  } catch (error) {
    res.status(500).send()
    console.log(error)
  }
}

export async function postLogout(req, res) {
  req.user.removeAuthToken(req.token)
  res.send()
}

export async function postPasswdReset(req, res) {
  try {
    const { username } = req.body
    const user = await findOne({ username })
    if (!user) {
      return res.status(400).send(`Username ${username} was not found in database`)
    }
    const token = await user.generateResetToken()
    await transporter.sendMail({
      from: process.env.SMTP_SENDER,
      to: user.email,
      subject: 'NOMAD-3 password reset ',
      html: `<p>Dear user ${user.fullName ? user.fullName : user.username}</p>
			<p>Use the link bellow to reset your NOMAD-3 password or register a new account</p>
			<p><a href="${process.env.FRONT_HOST_URL}/reset/${token}">Reset Password Link</a></p>
			<p>Please note that the link is valid for ${+process.env.JWT_EXPIRATION / 60} minutes only</p>
			`
    })
    res.send({ username: user.username, email: user.email })
  } catch (error) {
    console.log(error)
    res.status(400).send(`Can't send the email to ${error}`)
  }
}

export async function getPasswdReset(req, res) {
  const token = req.params.token
  try {
    const user = await findOne({ resetToken: token })
    if (!user) {
      return res.status(404).send('Token is invalid or user does not exist')
    }
    const decode = verify(token, user.password)
    if (decode) {
      res.send({
        username: user.username,
        fullName: user.fullName
      })
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || 'TokenExpiredError') {
      res.status(403).send('Token is invalid')
    } else {
      console.log(error)
      res.status(500).send(error)
    }
  }
}

export async function postNewPasswd(req, res) {
  const { username, fullName, password, token } = req.body
  const errors = validationResult(req)

  try {
    if (!errors.isEmpty()) {
      return res.status(422).send(errors)
    }

    const user = await findOne({ username, resetToken: token })
    if (!user) {
      return res.status(404).send('Token is invalid or user does not exist')
    }
    const decode = verify(token, user.password)
    if (decode) {
      const newPassword = await bcrypt.hash(password, 12)
      let resetting = true
      if (fullName) {
        user.fullName = fullName
        resetting = false
        user.isActive = true
      }
      user.password = newPassword
      await user.save()
      res.send({ username, resetting })
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || 'TokenExpiredError') {
      res.status(403).send('Token is invalid')
    } else {
      console.log(error)
      res.status(500).send(error)
    }
  }
}
