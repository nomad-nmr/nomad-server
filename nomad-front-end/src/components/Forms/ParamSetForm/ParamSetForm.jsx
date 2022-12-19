import React, { useEffect } from 'react'
import moment from 'moment'
import {
  Form,
  Input,
  Button,
  Col,
  Row,
  Checkbox,
  InputNumber,
  Tooltip,
  Divider,
  TimePicker,
  Space
} from 'antd'
import { QuestionCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

import classes from '../Form.module.css'

const layout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 18
  }
}

const tailLayout = {
  wrapperCol: {
    offset: 6,
    span: 18
  }
}

const ParamSetForm = props => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.resetFields()
  })

  const availableOnGroup = props.instruments.map(i => (
    <Col span={8} key={i.id}>
      <Checkbox
        value={i.id}
        style={{
          lineHeight: '32px'
        }}
      >
        {i.name}
      </Checkbox>
    </Col>
  ))

  const formSubmitHandler = values => {
    values.defaultParams.expt = values.defaultParams.expt.format('HH:mm:ss')

    //Checking whether to add or update
    if (values._id) {
      props.updateHandler(props.token, values)
    } else {
      props.addHandler(props.token, values)
    }
  }

  return (
    <div className={classes.formInDrawer}>
      <Form
        {...layout}
        form={form}
        ref={props.formRef}
        initialValues={{
          defaultParams: { td1: 1, expt: moment('00:00:00', 'HH:mm:ss') }
        }}
        onFinish={formSubmitHandler}
      >
        <Form.Item hidden name='_id'>
          <Input />
        </Form.Item>
        <Form.Item
          name='name'
          label='Name'
          rules={[{ required: true, whitespace: true, message: 'Parameter set name is required' }]}
        >
          <Input disabled={props.editing} style={{ width: '50%' }} />
        </Form.Item>
        <Form.Item name='description' label='Description'>
          <Input />
        </Form.Item>
        <Form.Item name='availableOn' label='Available On'>
          <Checkbox.Group style={{ marginLeft: 20 }}>
            <Row>{availableOnGroup}</Row>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item
          name='hidden'
          label='Hidden'
          tooltip='Parameter set available only for access level admin'
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>

        <Divider>
          Default Parameters
          <Tooltip title='Parameters required for submission traffic control'>
            <QuestionCircleOutlined className={classes.Hint} />
          </Tooltip>
        </Divider>

        <Row>
          <Col span={8}>
            <Form.Item
              name={['defaultParams', 'ns']}
              label='ns'
              rules={[
                {
                  type: 'integer',
                  message: 'ns has to be integer'
                }
              ]}
            >
              <InputNumber min={1} placeholder='Number of scans' style={{ width: '90%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['defaultParams', 'd1']}
              label='d1'
              style={{ margin: 0 }}
              rules={[
                {
                  type: 'number',
                  message: 'd1 has to be number'
                }
              ]}
            >
              <InputNumber min={0} placeholder='Recycle delay [s]' style={{ width: '90%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['defaultParams', 'ds']}
              label='ds'
              rules={[
                {
                  type: 'integer',
                  message: 'ds has to be integer'
                }
              ]}
            >
              <InputNumber min={0} placeholder='Dummy scans' style={{ width: '90%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row style={{ marginBottom: 25 }}>
          <Col span={12}>
            <Form.Item
              name={['defaultParams', 'td1']}
              label='td1'
              tooltip='Number of point in indirect dimension (1 for 1D experiments)'
              rules={[
                {
                  type: 'integer',
                  message: 'td1 has to be integer'
                }
              ]}
            >
              <InputNumber min={1} placeholder='Number of points' style={{ width: 140 }} />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', justifyContent: 'center' }}>
            <Form.Item
              name={['defaultParams', 'expt']}
              label='expt'
              tooltip='Default experimental time in HH,mm,ss format'
              style={{ margin: 0 }}
            >
              <TimePicker showNow={false} style={{ marginLeft: 10 }} />
            </Form.Item>
          </Col>
        </Row>
        <Divider>
          Custom Parameters
          <Tooltip title='Parameters that users are able to change at submission alongside with default parameters ns and d1'>
            <QuestionCircleOutlined className={classes.Hint} />
          </Tooltip>
        </Divider>

        <Form.List name='customParams'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(field => (
                <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                  <Row align='top'>
                    <Col span={4}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'name']}
                        fieldKey={[field.fieldKey, 'name']}
                        style={{ margin: 0 }}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: 'Parameter name is required'
                          }
                        ]}
                      >
                        <Input placeholder='Name' />
                      </Form.Item>
                    </Col>
                    <Col span={13}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'comment']}
                        fieldKey={[field.fieldKey, 'comment']}
                        style={{ margin: 0 }}
                        rules={[{ required: true, whitespace: true, message: 'Comment is required' }]}
                      >
                        <Input placeholder='Comment' style={{ width: 285 }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        style={{ margin: 0 }}
                        fieldKey={[field.fieldKey, 'value']}
                      >
                        <Input placeholder='Default Value' />
                      </Form.Item>
                    </Col>
                    <Col span={1}>
                      <MinusCircleOutlined style={{ marginTop: 10 }} onClick={() => remove(field.name)} />
                    </Col>
                  </Row>
                </Space>
              ))}
              <Row justify='center'>
                <Form.Item style={{ margin: '10px 0' }}>
                  <Button type='dashed' onClick={() => add()} icon={<PlusOutlined />}>
                    Add parameter
                  </Button>
                </Form.Item>
              </Row>
            </>
          )}
        </Form.List>

        <Form.Item {...tailLayout} style={{ marginTop: 20 }}>
          <Button className={classes.Button} type='primary' htmlType='submit'>
            Submit
          </Button>
          <Button
            className={classes.Button}
            htmlType='button'
            onClick={() => {
              form.resetFields()
              props.toggleDrawer()
            }}
          >
            Reset & Close
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default ParamSetForm
