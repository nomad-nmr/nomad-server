import React from 'react'
import { Form, Col, Space, Button, Checkbox, Tooltip } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

import classes from '../BookExperimentsForm.module.css'

//Night/priority check boxes and the button opening timed experiments modal.
//Rendered for priority users only. Check boxes get disabled if timed experiments are set up.
const PriorityCheckboxes = props => {
  const { nameKey, timedStatus, onOpenTimingModal } = props

  return (
    <Col span={2} className={classes.CheckBoxes}>
      <Space size='large'>
        <Form.Item name={[nameKey, 'night']} initialValue={false} valuePropName='checked'>
          <Checkbox disabled={timedStatus === 'valid'} />
        </Form.Item>

        <Form.Item name={[nameKey, 'priority']} initialValue={false} valuePropName='checked'>
          <Checkbox disabled={timedStatus === 'valid'} />
        </Form.Item>
      </Space>

      <Tooltip title='Timed Experiments'>
        <Button size='small' style={{ marginBottom: 24 }} onClick={onOpenTimingModal}>
          <ClockCircleOutlined
            style={{
              color:
                timedStatus === 'valid'
                  ? '#52c41a'
                  : timedStatus === 'invalid'
                    ? '#ff4d4f'
                    : undefined
            }}
          />
        </Button>
      </Tooltip>
    </Col>
  )
}

export default PriorityCheckboxes
