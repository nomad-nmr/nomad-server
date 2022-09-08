const connectTimeout = (req, res, next) => {
  req.connection.setTimeout(+process.env.DATA_UPLOAD_TIMEOUT || 30000)
  next()
}

module.exports = connectTimeout
