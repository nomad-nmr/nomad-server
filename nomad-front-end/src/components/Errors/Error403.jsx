import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const Error403 = () => {
  const navigate = useNavigate()
  return (
    <Result
      status='403'
      title='403'
      subTitle='Sorry, you are not authorized to access this resource. Please, login'
      extra={
        <Button
          type='primary'
          onClick={() => {
            navigate('/')
            window.location.reload()
          }}
        >
          Back Home
        </Button>
      }
    />
  )
}

export default Error403
