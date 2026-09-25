import jsonwebtoken from 'jsonwebtoken'

import User from '../models/user.js'

//Authenticates the request if a valid JWT is present, but never blocks it.
//Used by endpoints that are public but need to tailor the response for logged-in users.
const authOptional = async (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    return next()
  }
  const token = authHeader.split(' ')[1]

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET)
    const user = decoded && (await User.findOne({ _id: decoded._id, 'tokens.token': token }))
    if (user) {
      req.user = user
      req.token = token
    }
  } catch (error) {
    //invalid/expired token - proceed unauthenticated
  }

  next()
}

export default authOptional
