import bcrypt from 'bcryptjs'
import BcryptSalt from 'bcrypt-salt'
import jsonwebtoken from 'jsonwebtoken'
import { validationResult } from 'express-validator'

import User from '../models/user.js'
import transporter from '../utils/emailTransporter.js'

const { verify } = jsonwebtoken
const jwtExpiration = process.env.JWT_EXPIRATION || 3600

export const authLoginOpenApiDoc = {
  post: {
    summary: 'Login to NOMAD',
    description: 'Returns an access token for the user',
    tags: ['Auth'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {
                type: 'string'
              },
              password: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string'
                },
                accessLevel: {
                  type: 'string'
                },
                manualAccess: {
                  type: 'boolean'
                },
                groupName: {
                  type: 'string'
                },
                token: {
                  type: 'string'
                },
                expiresIn: {
                  type: 'number'
                }
              }
            }
          }
        }
      },
      400: {
        description: 'Wrong username or password'
      }
    }
  }
}

export async function postLogin(req, res) {
  try {
    const user = await User.findOne({ username: req.body.username })
    if (!user) {
      return res.status(400).send({ message: 'Wrong username or password' })
    }
    if (!user.isActive) {
      return res.status(400).send({ message: 'User is inactive' })
    }

    await user.populate('group')

    const passMatch = await bcrypt.compare(req.body.password, user.password)
    if (!passMatch) {
      return res.status(400).send({ message: 'Wrong username or password' })
    }

    const token = await user.generateAuthToken()
    return res.send({
      username: user.username,
      accessLevel: user.accessLevel,
      manualAccess: user.manualAccess,
      groupName: user.group.groupName,
      token: token,
      expiresIn: +jwtExpiration,
      customSolvents: process.env.CUSTOM_SOLVENTS ? process.env.CUSTOM_SOLVENTS.split(',') : []
    })
  } catch (error) {
    res.status(500).send()
    console.log(error)
  }
}

export async function postLogout(req, res) {
  req.user.removeAuthTokens(req.token)
  res.send()
}

export async function postPasswdReset(req, res) {
  try {
    const { username } = req.body
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json(`Username ${username} was not found in database`)
    }
    const token = await user.generateResetToken()
    await transporter.sendMail({
      from: process.env.SMTP_SENDER,
      to: user.email,
      subject: 'NOMAD-3 password reset ',
      html: `<p>Dear user ${user.fullName ? user.fullName : user.username}</p>
			<p>Use the link bellow to reset your NOMAD-3 password or register a new account</p>
			<p><a href="${process.env.FRONT_HOST_URL}/reset/${token}">Reset Password Link</a></p>
			<p>Please note that the link is valid for ${+jwtExpiration / 60} minutes only</p>
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
    const user = await User.findOne({ resetToken: token })
    if (!user) {
      return res.status(404).send({ message: 'Token is invalid or user does not exist' })
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
      res.status(403).send({ message: 'Token is invalid' })
    } else {
      console.log(error)
      res.status(500).send({ error: 'API error' })
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

    const user = await User.findOne({ username, resetToken: token })
    if (!user) {
      return res.status(404).send({ message: 'Token is invalid or user does not exist' })
    }
    const decode = verify(token, user.password)
    if (decode) {
      const bs = new BcryptSalt()
      const newPassword = await bcrypt.hash(password, bs.saltRounds)
      let resetting = true
      //new users added to the system from .csv file don't have full name and have to fill in password reset form
      //new users added to DB individually only reset passwords
      if (user.fullName !== fullName) {
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
      res.status(403).send({ message: 'Token is invalid' })
    } else {
      console.log(error)
      res.status(500).send({ error: 'API error' })
    }
  }
}
