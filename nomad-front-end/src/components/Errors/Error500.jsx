import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Result, Button } from 'antd'

const Error500 = () => {
  const navigate = useNavigate()
  return (
    <Result
      status='500'
      title='500'
      subTitle='Sorry, something went wrong on the server.'
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

export default Error500
