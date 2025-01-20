import User from '../../models/user.js'
import Experiment from '../../models/experiment.js'
import transporter from '../../utils/emailTransporter.js'

const sendStatusEmail = {
  error: async datasetName => {
    const errorExp = await Experiment.findOneOne({ datasetName, status: 'Error' })
    const { instrument, remarks, holder, user, title } = errorExp
    const { email, fullName, sendStatusEmail } = await User.findById(user.id)
    if (!email) {
      return new Error('E-mail not found')
    }

    const message = `
      <p>Dear ${fullName}</p>
      <p>
      An experiment on instrument <strong>${
        instrument.name
      }</strong> in holder <strong>${holder}</strong> with title <strong>${
      title.split('||')[0]
    }</strong> finished with Error status. 
      </p>
      <p>
      Error remarks: ${remarks}
      </p>    
      <i style="margin-top: 20px;">
      This is an automated NOMAD notification. Do not replay!
      </i> 
      `
    if (sendStatusEmail.error) {
      transporter.sendMail({
        from: process.env.SMTP_SENDER,
        to: email,
        subject: 'NOMAD: Error status warning',
        html: message
      })
    }
  },

  archived: async datasetName => {
    const expArray = await Experiment.find({ datasetName })

    const archivedExps = expArray.filter(exp => exp.status === 'Archived')

    if (archivedExps.length === expArray.length) {
      const { instrument, holder, user, title } = expArray[0]

      const { email, fullName, sendStatusEmail } = await User.findById(user.id)

      const link = process.env.FRONT_HOST_URL + '/search-experiment/' + datasetName

      const message = `
      <p>
      Dear ${fullName}
      </p>
      <p>
      All your experiments on instrument <strong>${
        instrument.name
      }</strong> for the sample in holder <strong>${holder}</strong> with title <strong>${
        title.split('||')[0]
      }</strong>
      have been finished and data archived. 
      </p>
      <p>
      The dataset can be accessed in NOMAD datastore by following <a href=${link}>link</a>
      </p>
      <i style="margin-top: 20px;">
      This is an automated NOMAD notification. Do not replay! 
      </i>
      `
      if (sendStatusEmail.archived) {
        transporter.sendMail({
          from: process.env.SMTP_SENDER,
          to: email,
          subject: 'NOMAD: Your experiments have been completed and archived',
          html: message
        })
      }
    }
  },

  pending: async datasetName => {
    const experiment = await Experiment.findOne({ expId: datasetName + '-10' })
    const delay = process.env.PENDING_EMAIL_DELAY || 30
    console.log('Sending Pending', experiment.expId)

    setTimeout(async () => {
      const pendingExp = await Experiment.findOne({ expId: datasetName + '-10' })
      if (pendingExp.status === 'Available') {
        const { instrument, holder, user, title } = pendingExp
        const { email, fullName } = await User.findById(user.id)
        const message = `
      <p>Dear ${fullName}</p>
      <p>
      You have booked holder <strong>${holder}</strong> on instrument <strong>${
          instrument.name
        }</strong> to run experiments with title <strong>${
          title.split('||')[0]
        }</strong> more than ${delay} minutes ago. 
      </p>
      <p style="color:red; font-weight:600;">
      Please, submit the experiments or cancel the booked holder
      </p>    
      <i style="margin-top: 20px;">
      This is an automated NOMAD notification. Do not replay!
      </i> 
      `

        transporter.sendMail({
          from: process.env.SMTP_SENDER,
          to: email,
          subject: 'NOMAD: Experiments in pending status warning',
          html: message
        })
      }
    }, delay * 60000)
  }
}

export default sendStatusEmail
