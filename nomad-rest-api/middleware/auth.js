import { verify } from 'jsonwebtoken'

import User from '../models/user.js'

const auth = async (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    return res.status(403).send('Please authenticate')
  }
  const token = authHeader.split(' ')[1]

  try {
    const decoded = verify(token, process.env.JWT_SECRET)
    if (decoded) {
      const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
      if (!user) {
        if (req.body.timeOut) {
          //request comes from checkAuthTimeout and user has logged out already
          return res.send()
        } else {
          throw new Error()
        }
      }
      req.user = user
      req.token = token
      next()
    }
  } catch (error) {
    const user = await User.findOne({ 'tokens.token': token })
    if (user) {
      user.removeAuthTokens(token)
    }
    res.status(403).send('Please authenticate.')
  }
}

export default auth
