import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Result, Button } from 'antd'

const Error404 = () => {
  const navigate = useNavigate()

  return (
    <Result
      status='404'
      title='404'
      subTitle='Sorry, the resource that you have tried to access does not exist.'
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
export default Error404
