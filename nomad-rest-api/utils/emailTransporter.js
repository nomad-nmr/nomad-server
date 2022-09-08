const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: +process.env.SMTP_PORT,
	secure: process.env.SMTP_SECURE === 'true',
	requireTLS: process.env.SMTP_REQUIRE_TLS === 'true',
	auth: process.env.SMTP_USER
		? {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
		  }
		: null
})
