import React, { useState, useEffect } from 'react'
import { Row, Col, Form, Space, Button, Select, Input, message } from 'antd'
import moment from 'moment'

import SolventSelect from '../BookExperimentsForm/SolventSelect/SolventSelect'
import TitleInput from '../BookExperimentsForm/TitleInput/TitleInput'
import EditParamsModal from '../../Modals/EditParamsModal/EditPramsModal'

import classes from '../BookExperimentsForm/BookExperimentsForm.module.css'
import { legacy_createStore } from 'redux'

const { Option } = Select

const AddSampleForm = props => {
  const [form] = Form.useForm()

  //formSate is an array of exp counts
  const [formState, setFormState] = useState([1])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalInputData, setModalInputData] = useState({})
  const [resetModal, setResetModal] = useState(undefined)
  const [exptState, setExptState] = useState({})

  const { accessLevel, authToken } = props.user
  const { editParams, rackType, inputData } = props

  useEffect(() => {
    console.log(inputData)
    if (inputData) {
      setFormState([inputData.exps.length])
      form.setFieldsValue({
        0: {
          solvent: inputData.solvent,
          title: inputData.title,
          exps: inputData.exps,
          expTime: inputData.expTime
        }
      })
    }
  }, [inputData])

  console.log(exptState)

  const onFromFinish = data => {
    console.log(data)
    //adding total experimental time for each sample into data object
    const exptEntries = Object.entries(exptState)
    for (let entry of exptEntries) {
      const key = entry[0].split('#')[0]
      const value = data[key].expTime ? data[key].expTime : '00:00:00'
      data[key].expTime = moment
        .duration(value, 'hh:mm:ss')
        .add(moment.duration(entry[1], 'hh:mm:ss'))
        .format('HH:mm:ss', { trim: false })
    }

    props.onAddSample(data, props.rackId, authToken)
    form.resetFields()
    setFormState([1])
  }

  const closeHandler = () => {
    form.resetFields()
    setFormState([1])
    setExptState({})
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

  const closeModalHandler = () => {
    setModalVisible(false)
  }

  const openModalHandler = (event, key, expNo) => {
    event.preventDefault()

    const paramSetName = form.getFieldValue([key, 'exps', expNo, 'paramSet'])
    const paramsString = form.getFieldValue([key, 'exps', expNo, 'params'])
    if (paramSetName) {
      const { defaultParams, customParams } = props.paramSets.find(
        paramSet => paramSet.name === paramSetName
      )
      setModalInputData({
        sampleKey: key,
        paramSetName,
        expNo,
        defaultParams,
        customParams
      })
      //if paramsString has been already created and modal reopened
      //then resetModal sets the value in EditParamsModal form.
      setResetModal(paramsString ? null : key + '#' + expNo)
      setModalVisible(true)
    } else {
      message.warning('Please select experiment [Parameter Set]')
    }
  }

  const modalOkHandler = values => {
    const key = Object.keys(values)[0]
    const params = Object.values(values)[0]
    let paramsString = ''
    for (const param in params) {
      if (params[param] && param !== 'expt') {
        paramsString = paramsString + param + ',' + params[param] + ','
      }
    }

    paramsString = paramsString.substring(0, paramsString.length - 1)
    const sampleKey = key.split('#')[0]
    const expNo = key.split('#')[1]
    form.setFieldsValue({ [sampleKey]: { exps: { [expNo]: { params: paramsString } } } })
    setExptState({ ...exptState, [key]: params.expt })
    setModalVisible(false)
  }

  const onParamSetChange = (sampleKey, expNo, paramSetName) => {
    form.resetFields([[sampleKey, 'exps', expNo, 'params']])
    const key = sampleKey + '#' + expNo

    const paramSet = props.paramSets.find(paramSet => paramSet.name === paramSetName)

    if (paramSet.defaultParams.length < 4) {
      return message.warning(
        'Expt calculation cannot be performed. Default parameters were not defined'
      )
    }

    const newExptState = { ...exptState, [key]: paramSet.defaultParams[4].value }

    setExptState(newExptState)
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
        <Row gutter={16} key={expNo}>
          <Col span={2}>
            <span>{expNo}</span>
          </Col>
          <Col span={editParams ? 14 : 19}>
            <Form.Item
              name={[i, 'exps', j, 'paramSet']}
              style={{ textAlign: 'left' }}
              rules={[
                {
                  required: true,
                  message: 'Parameter set is required'
                }
              ]}
            >
              <Select onChange={value => onParamSetChange(i, j, value)}>{paramSetsOptions}</Select>
            </Form.Item>
          </Col>
          {editParams && (
            <Col span={6}>
              <Space align='start'>
                <Form.Item name={[i, 'exps', j, 'params']}>
                  <Input disabled />
                </Form.Item>
                <Button
                  type='primary'
                  // value={key}
                  onClick={e => openModalHandler(e, i, j)}
                >
                  Edit
                </Button>
              </Space>
            </Col>
          )}
          <Col span={2}>
            <span>{exptState[i + '#' + j]}</span>
          </Col>
        </Row>
      )
    }

    return (
      <Row gutter={16} key={i}>
        <Col span={editParams ? 6 : 8}>
          <TitleInput nameKey={i} />
        </Col>
        {rackType === 'Group' && (
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
        )}
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
        <Col span={editParams ? 11 : 9}>{expElements}</Col>
      </Row>
    )
  })

  return (
    <div style={{ margin: '0px 80px' }}>
      {!props.edit && (
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
      )}

      <Row gutter={16} className={classes.Header}>
        <Col span={editParams ? 6 : 8}>Title</Col>
        {rackType === 'Group' && <Col span={2}>Tube ID</Col>}
        <Col span={3}>Solvent</Col>

        <Col span={1} offset={1}>
          ExpNo
        </Col>
        <Col span={editParams ? 7 : 8}>Experiment [Parameter Set]</Col>
        {editParams && <Col span={3}>Parameters</Col>}
        <Col span={1}>ExpT</Col>
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
      <EditParamsModal
        visible={modalVisible}
        closeModal={closeModalHandler}
        onOkHandler={modalOkHandler}
        inputData={modalInputData}
        reset={resetModal}
      />
    </div>
  )
}

export default AddSampleForm
