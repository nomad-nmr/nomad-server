import React, { useEffect, useState } from 'react'
import { Alert, Progress } from 'antd'

import socket from '../../socketConnection.js'

const ClaimProgress = props => {
  const { claimId, totalExpClaimed } = props

  const [count, setCount] = useState(0)
  const [showAlert, setShowAlert] = useState(false)

  let percentProgress = Math.round((count / totalExpClaimed) * 100)

  useEffect(() => {
    socket.on(
      claimId,
      data => {
        const newCount = count + 1
        setCount(newCount)
      },
      []
    )

    setTimeout(() => {
      setShowAlert(true)
    }, 30000)

    return () => {
      socket.removeAllListeners(claimId)
    }
  })

  if (count === totalExpClaimed) {
    setTimeout(() => {
      props.resetHandler()
    }, 2000)
  }

  return (
    <div>
      <Progress percent={percentProgress} style={{ marginBottom: '20px', width: '90%' }} />
      {showAlert && (
        <Alert
          message='Claim request timed out after 30 seconds. The claim could still be completed successfully. Please, check datastore whether the data was uploaded.'
          type='warning'
          closable
          style={{ marginBottom: '20px' }}
        />
      )}
    </div>
  )
}

export default ClaimProgress
