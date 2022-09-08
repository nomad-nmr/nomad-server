import React from 'react'

import { Card, Row, Col, Tag } from 'antd'
import moment from 'moment'

import TrafficLights from '../../TrafficLights/TrafficLights'
import classes from './InfoCard.module.css'

import nightIcon from '../../../assets/night-mode.svg'
import dayIcon from '../../../assets/sunny-day.svg'

const InfoCard = props => {
  const { name, model, probe, available, nightAllowance, dayAllowance } = props.data
  const { busyUntil, dayExpt, nightExpt } = props.data.status.summary
  const cardColor = available ? '#52c41a' : '#ff4d4f'
  const cardBackgroundColor = available ? '#f6ffed' : '#fff1f0'
  return (
    <Card
      className={classes.InfoCard}
      hoverable
      headStyle={{ backgroundColor: cardColor }}
      bodyStyle={{
        borderBottom: `2px solid ${cardColor}`,
        borderRadius: '4px',
        backgroundColor: cardBackgroundColor,
        padding: '12px 0px 0px 20px'
      }}
      title={
        <Row>
          <Col span={6}>
            <div className={classes.trafficLights}>
              <TrafficLights data={props.data} />
            </div>
          </Col>
          <Col span={18}>
            <div className={classes.CardHead}>
              <h2>{name}</h2>
              <h4>{model}</h4>
              <h4>[{probe}]</h4>
            </div>
          </Col>
        </Row>
      }
    >
      <div style={{ marginBottom: 10, textAlign: 'center' }}>
        <div>
          <strong>Busy until: </strong>
          {busyUntil === 'No Jobs' ? (
            <Tag color='green' style={{ fontWeight: '700' }}>
              {busyUntil}
            </Tag>
          ) : (
            busyUntil
          )}
        </div>
        <Row justify='center' align='middle'>
          <Col span={11} offset={2}>
            <strong>Expt Queue</strong>
          </Col>
          <Col span={11}>
            <strong>Allowance</strong>
          </Col>
        </Row>
        <Row justify='center' align='middle' style={{ marginTop: 2 }}>
          <Col span={2}>
            <img src={dayIcon} style={{ height: '18px' }} alt='day icon' />
          </Col>
          <Col span={11}>{dayExpt}</Col>
          <Col span={11}>{moment.duration(dayAllowance, 'm').format('HH:mm', { trim: false })}</Col>
        </Row>
        <Row justify='center' align='middle' style={{ marginTop: 2 }}>
          <Col span={2}>
            <img src={nightIcon} style={{ height: '18px' }} alt='night icon' />
          </Col>
          <Col span={11}>{nightExpt}</Col>
          <Col span={11}>{moment.duration(nightAllowance, 'm').format('HH:mm', { trim: false })}</Col>
        </Row>
      </div>
    </Card>
  )
}

export default InfoCard
