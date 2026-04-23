import React from 'react'
import { Row, Col, Typography } from 'antd'
import classes from './Root.module.css'

const { Title, Paragraph } = Typography

const Root = () => {
  return (
    <div className={classes.RootContainer}>
      <Row justify='center' align='middle' style={{ minHeight: '80vh' }}>
        <Col xs={24} sm={20} md={16} lg={12}>
          <div className={classes.Content}>
            <Title level={1}>Welcome to Nomad</Title>
            <Paragraph>This is a placeholder for the landing page under development.</Paragraph>
            <div className={classes.ButtonGroup}></div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Root
