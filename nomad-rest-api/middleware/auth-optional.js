import jsonwebtoken from 'jsonwebtoken'

import User from '../models/user.js'

//Attempts to authenticate the request but never blocks it - req.user/req.token are
//left undefined for missing, invalid or expired tokens so downstream handlers can
//distinguish "no user" from "logged in" without requiring authentication.
const authOptional = async (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    return next()
  }
  const token = authHeader.split(' ')[1]

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
    if (user) {
      req.user = user
      req.token = token
    }
  } catch (error) {
    //invalid/expired token - proceed as unauthenticated
  }
  next()
}

export default authOptional
