import React, { useEffect } from 'react'
import { Form, Input, Button, InputNumber, Row, Col } from 'antd'

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

  useEffect(() => {
    form.resetFields()
  })

  const onFinish = values => {
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
      <Form {...layout} form={form} ref={props.formReference} name='instruments-settings' onFinish={onFinish}>
        <Row>
          <Col span={14}>
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
              tooltip='Samplecanger capacity (number of holders)'
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

          <Col span={9} offset={1}>
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
            <Form.Item
              style={{ textAlign: 'left' }}
              name='maxNight'
              label='Max Night [h]'
              tooltip='Maximum length of overnight queue'
            >
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item
              style={{ textAlign: 'left' }}
              name='overheadTime'
              label='Overhead Time [s]'
              tooltip='Avarage time used by machine to change sample, lock and shim'
              rules={[
                { type: 'integer', message: 'Overhead time has to be an integer' },
                { required: true, message: ' Overhead time is required' }
              ]}
            >
              <InputNumber min={0} />
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
