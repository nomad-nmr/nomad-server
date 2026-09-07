import React from 'react'
import { Row, Col, Space, Tooltip } from 'antd'

import nightIcon from '../../../../assets/night-mode.svg'

import classes from '../BookExperimentsForm.module.css'

//Header row of the book experiments form. The last column with night/priority legend
//is rendered for priority users only.
const FormHeader = props => {
  const { priorityAccess } = props

  const checkBoxesHeader = (
    <Col span={1} className={classes.CheckBoxes} flex={18}>
      <Space size='large'>
        <Tooltip title='Sample submitted into night queue'>
          <img src={nightIcon} style={{ height: '18px' }} alt='night icon' />
        </Tooltip>
        <Tooltip className={classes.Priority} title='Sample submitted with priority'>
          P
        </Tooltip>
      </Space>
    </Col>
  )

  return (
    <Row gutter={16} className={classes.Header}>
      <Col span={2}>Instrument</Col>
      <Col span={2}>Holder</Col>
      <Col span={2}>Solvent</Col>
      <Col span={priorityAccess ? 5 : 6}>Title</Col>
      <Col span={1}>
        <span style={{ marginLeft: 20 }}>ExpNo</span>
      </Col>
      <Col span={3} offset={1}>
        Experiment [Parameter Set]
      </Col>
      <Col span={2} offset={1}>
        <span style={{ marginLeft: 30 }}>Parameters</span>
      </Col>
      <Col span={2}>
        <span style={{ marginLeft: 30 }}>ExpT</span>
      </Col>
      {priorityAccess && checkBoxesHeader}
    </Row>
  )
}

export default FormHeader
