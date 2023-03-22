import React, { useEffect } from 'react'
import { Form, Input, Button, InputNumber, Row, Col, TimePicker, Switch } from 'antd'
import moment from 'moment'

import classes from '../Form.module.css'

const layout = {
  labelCol: {
    span: 10
  },
  wrapperCol: {
    span: 14
  }
}

const tailLayout = {
  wrapperCol: {
    offset: 4,
    span: 20
  }
}

const InstrumentsForm = props => {
  const [form] = Form.useForm()

  const { resetOverheadHandler } = props

  useEffect(() => {
    return () => resetOverheadHandler()
  }, [resetOverheadHandler])

  const onFinish = values => {
    values.nightStart = values.nightStart.format('HH:mm')
    values.nightEnd = values.nightEnd.format('HH:mm')
    // Checking whether to update or add
    if (values._id) {
      props.updateInstrumentsHandler(values, props.authToken)
    } else {
      props.addInstrumentHandler(values, props.authToken)
    }
  }

  const onReset = () => {
    form.resetFields()
    props.toggleFormHandler()
  }

  return (
    <div className={classes.Form}>
      <Form
        {...layout}
        form={form}
        ref={props.formReference}
        name='instruments-settings'
        onFinish={onFinish}
        initialValues={{
          nightStart: moment('09:00', 'HH:mm'),
          nightEnd: moment('19:00', 'HH:mm'),
          dayAllowance: 20,
          nightAllowance: 120,
          paramsEditing: true
        }}
      >
        <Row>
          <Col span={8}>
            <Form.Item
              name='name'
              label='Name'
              rules={[{ required: true, whitespace: true, message: 'Instrument name is required' }]}
            >
              <Input disabled={props.editing} />
            </Form.Item>
            <Form.Item name='model' label='Model'>
              <Input />
            </Form.Item>
            <Form.Item name='probe' label='Probe'>
              <Input />
            </Form.Item>
            <Form.Item
              label='Capacity'
              required
              tooltip='Sample changer capacity (number of holders)'
              name='capacity'
              style={{ textAlign: 'left' }}
              rules={[
                { type: 'integer', message: 'Capacity has to be an integer' },
                { required: true, message: ' Capacity of sample changer is required' }
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>

          <Col span={7} offset={1}>
            <Form.Item
              style={{ textAlign: 'left' }}
              name='dayAllowance'
              label='Day Allowance [min]'
              tooltip='Maximum total experimental time per user during day time'
              rules={[{ type: 'integer', message: 'Day allowance has to be an integer' }]}
            >
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item
              style={{ textAlign: 'left' }}
              name='nightAllowance'
              label='Night Allowance [min]'
              tooltip='Maximum total experimental time per user during night time'
              rules={[{ type: 'integer', message: 'Night allowance has to be an integer' }]}
            >
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item style={{ textAlign: 'left' }} name='nightStart' label='Night Queue Start'>
              <TimePicker format='HH:mm' />
            </Form.Item>
            <Form.Item style={{ textAlign: 'left' }} name='nightEnd' label='Night Queue End'>
              <TimePicker format='HH:mm' />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              style={{ textAlign: 'left' }}
              name='overheadTime'
              label='Overhead Time [s]'
              tooltip='Avarage time used by machine to change sample, lock and shim'
              rules={[{ required: true, message: ' Overhead time is required' }]}
            >
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item
              style={{ textAlign: 'left' }}
              name='paramsEditing'
              label='Parameters Editing'
              tooltip='Allow or deny users from editing parameters'
              valuePropName='checked'
            >
              <Switch size='small' checkedChildren='ON' unCheckedChildren='OFF' />
            </Form.Item>
            <Form.Item
              style={{ textAlign: 'left' }}
              name='isManual'
              label='Manually Used'
              tooltip='Instrument set for manual use and data archiving'
              valuePropName='checked'
            >
              <Switch size='small' checkedChildren='ON' unCheckedChildren='OFF' />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item hidden name='_id'>
          <Input />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button className={classes.Button} type='primary' htmlType='submit'>
            Submit
          </Button>
          <Button className={classes.Button} htmlType='button' onClick={onReset}>
            Reset & Close
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default InstrumentsForm
