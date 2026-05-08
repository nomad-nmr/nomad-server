import React from 'react'
import { Row, Col, Typography, Statistic, Divider } from 'antd'

import Logo from '../../components/RootComponents/RoundLogo'
import UserStats from '../../components/RootComponents/UserStats'
import TrafficDataStats from '../../components/RootComponents/TrafficDataStats'
import DateRangeSwitch from '../../components/RootComponents/DateRangeSwitch'

import classes from './Root.module.css'

const { Title, Paragraph } = Typography

const Root = () => {
  const userData = [
    { title: 'Total Number of Users', value: 1128 },
    { title: 'Users Active Last 30 Days', value: 426 },
    { title: 'Number of Active Groups', value: 28 },
    { title: 'NMRium Utilisation', value: 65 }
  ]
  const trafficData = [
    { title: 'Total Experiments Archived', value: 2560 },
    { title: 'Automation Experiments Archived', value: 540 },
    { title: 'Manual Experiments Archived', value: 10 },
    { title: 'Automation Processed Samples', value: 320 },
    { title: 'Number of Created Datasets', value: 20 },
    { title: 'Number of Created Collection', value: 1 }
  ]

  const dividerStyle = {
    borderColor: '#4096ff',
    color: '#4096ff'
  }

  return (
    <div className={classes.RootContainer}>
      <Row justify='center' align='top' className={classes.TitleHeader}>
        <Col span={4}>
          <Logo />
        </Col>
        <Col span={16}>
          <div className={classes.Title}>
            <Title level={1}>Welcome to Nomad @</Title>
          </div>
        </Col>
        <Col span={4}>
          <Logo />
        </Col>
      </Row>
      <div className={classes.Content}>
        <Divider style={dividerStyle} size='medium'>
          Users Stats
        </Divider>
        <UserStats data={userData} />
        <Divider style={dividerStyle} size='medium'>
          Traffic & Datastore Stats
        </Divider>
        <DateRangeSwitch />
        <TrafficDataStats data={trafficData} />
        <Divider style={dividerStyle}></Divider>
      </div>
    </div>
  )
}

export default Root
