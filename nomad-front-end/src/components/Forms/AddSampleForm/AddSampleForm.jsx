import React, { useState } from 'react'
import { Row, Col, Form, Space, Button, Select, Input } from 'antd'

import SolventSelect from '../BookExperimentsForm/SolventSelect/SolventSelect'
import TitleInput from '../BookExperimentsForm/TitleInput/TitleInput'

import classes from '../BookExperimentsForm/BookExperimentsForm.module.css'

const { Option } = Select

const AddSampleForm = props => {
  const [form] = Form.useForm()

  //formSate is an array of exp counts
  const [formState, setFormState] = useState([1])

  const { accessLevel, authToken } = props.user

  const onFromFinish = data => {
    props.onAddSample(data, props.rackId, authToken)
    form.resetFields()
    setFormState([1])
  }

  const closeHandler = () => {
    form.resetFields()
    setFormState([1])
    props.toggleHandler()
    if (accessLevel !== 'admin' && accessLevel !== 'admin-b') {
      props.signOutHandler(authToken)
    }
  }

  const addEntryHandler = () => {
    const newFormState = [...formState, 1]
    setFormState(newFormState)
  }

  const removeEntryHandler = () => {
    const newFormState = [...formState]
    if (newFormState.length === 1) {
      return
    }
    newFormState.pop()
    setFormState(newFormState)
  }

  const addExpHandler = e => {
    e.preventDefault()
    const index = e.target.value
    const newFormState = [...formState]
    newFormState[index]++
    setFormState(newFormState)
  }
  const removeExpHandler = e => {
    e.preventDefault()
    const index = e.target.value
    const newFormState = [...formState]
    if (newFormState[index] === 1) {
      return
    }
    newFormState[index]--
    setFormState(newFormState)
  }

  const paramSetsOptions = props.paramSets.map((paramSet, i) => (
    <Option value={paramSet.name} key={i}>
      {`${paramSet.description} [${paramSet.name}]`}
    </Option>
  ))

  const formItems = formState.map((sampleCount, i) => {
    const expElements = []
    for (let j = 0; j < sampleCount; j++) {
      const expNo = (10 + j).toString()
      expElements.push(
        <Row key={expNo}>
          <Col span={2}>
            <span>{expNo}</span>
          </Col>
          <Col span={22}>
            <Form.Item
              name={[i, 'exps', j]}
              style={{ textAlign: 'left' }}
              rules={[
                {
                  required: true,
                  message: 'Parameter set is required'
                }
              ]}
            >
              <Select>{paramSetsOptions}</Select>
            </Form.Item>
          </Col>
        </Row>
      )
    }

    return (
      <Row gutter={16} key={i}>
        <Col span={8}>
          <TitleInput nameKey={i} />
        </Col>
        <Col span={2}>
          <Form.Item
            name={[i, 'tubeId']}
            rules={[
              {
                required: true,
                whitespace: true,

                message: 'Sample ID is required'
              },
              { min: 3, max: 6, message: 'Title must have min 3 and max 6 characters' }
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={3}>
          <SolventSelect nameKey={i} />
        </Col>

        <Col span={1} offset={1}>
          <Space>
            <button
              className={classes.CircleButton}
              value={i}
              onClick={event => addExpHandler(event)}
            >
              +
            </button>
            <button
              className={[classes.CircleButton, classes.CircleButtonMinus].join(' ')}
              value={i}
              onClick={event => removeExpHandler(event)}
            >
              -
            </button>
          </Space>
        </Col>
        <Col span={9}>{expElements}</Col>
      </Row>
    )
  })

  return (
    <div style={{ margin: '0px 80px' }}>
      <div style={{ marginBottom: 15, textAlign: 'center' }}>
        <Space size='large'>
          <Button shape='circle' type='primary' onClick={() => addEntryHandler()}>
            <span className={classes.LargeButton}>+</span>
          </Button>
          <Button shape='circle' onClick={() => removeEntryHandler()}>
            <span className={classes.LargeButton}>-</span>
          </Button>
        </Space>
      </div>

      <Row gutter={16} className={classes.Header}>
        <Col span={8}>Title</Col>
        <Col span={2}>Tube ID</Col>
        <Col span={3}>Solvent</Col>

        <Col span={1} offset={1}>
          ExpNo
        </Col>
        <Col span={9}>Experiment [Parameter Set]</Col>
      </Row>
      <Form form={form} size='small' onFinish={values => onFromFinish(values)}>
        {formItems}
        <Form.Item>
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <Space>
              <Button type='primary' size='middle' htmlType='submit'>
                Submit
              </Button>
              <Button
                size='middle'
                onClick={() => {
                  closeHandler()
                }}
              >
                Reset & Close
              </Button>
            </Space>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default AddSampleForm
