const connectTimeout = (req, res, next) => {
  req.connection.setTimeout(+process.env.DATA_UPLOAD_TIMEOUT * 1000 || 30000)
  next()
}

export default connectTimeout
