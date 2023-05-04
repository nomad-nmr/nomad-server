import React, { useEffect, useState } from 'react'
import { Progress } from 'antd'

import socket from '../../socketConnection.js'

const ClaimProgress = props => {
  const { claimId, totalExpClaimed } = props

  const [count, setCount] = useState(0)

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
  })

  if (count === totalExpClaimed) {
    setTimeout(() => {
      props.resetHandler()
    }, 2000)
  }

  return <Progress percent={percentProgress} style={{ marginBottom: '20px', width: '90%' }} />
}

export default ClaimProgress
