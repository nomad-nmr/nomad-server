import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Form,
  Select,
  Input,
  Row,
  Col,
  Spin,
  Button,
  Divider,
  Space,
  message,
  Modal,
  Checkbox,
  Tooltip
} from 'antd'
import moment from 'moment'

// import solvents from '../../../misc/solvents'
import SolventSelect from './SolventSelect/SolventSelect'
import TitleInput from './TitleInput/TitleInput'
import EditParamsModal from '../../Modals/EditParamsModal/EditPramsModal'
import nightIcon from '../../../assets/night-mode.svg'

import classes from './BookExperimentsForm.module.css'

const { Option } = Select

const disabledStyle = {
  textAlign: 'center',
  color: '#389e0d',
  fontWeight: 600,
  backgroundColor: '#f0f5ff'
}

const BookExperimentsForm = props => {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const [formState, setFormState] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  //state used to generate form inputs in edit parameters modal
  const [modalInputData, setModalInputData] = useState({})
  const [resetModal, setResetModal] = useState(undefined)
  const [exptState, setExptState] = useState({})
  const [totalExptState, setTotalExptState] = useState({})

  const { inputData, allowanceData, fetchAllowance, token, accessLevel } = props

  const priorityAccess = accessLevel === 'user-a' || accessLevel === 'admin'

  //Hook to create state for dynamic ExpNo part of form from inputData
  //InputData gets updated every time new holder is booked
  useEffect(() => {
    const newFormState = []
    const instrIds = new Set()
    inputData.forEach(i => {
      instrIds.add(i.instId)
      const found = formState.find(entry => entry.key === i.key)
      if (found) {
        newFormState.push(found)
      } else {
        newFormState.push({
          key: i.key,
          expCount: 1
        })
      }
    })
    setFormState(newFormState)
    if (instrIds.size !== 0) {
      fetchAllowance(token, Array.from(instrIds))
    }

    // formState can't be dependency as it gets updated in the hook. That would trigger loop.
    // eslint-disable-next-line
  }, [inputData])

  const addExpHandler = e => {
    e.preventDefault()
    const newFormState = [...formState]
    const index = newFormState.findIndex(i => i.key === e.target.value)
    newFormState[index].expCount++
    setFormState(newFormState)
  }

  const removeExpHandler = e => {
    e.preventDefault()
    const newFormState = [...formState]
    const index = newFormState.findIndex(i => i.key === e.target.value)
    if (newFormState[index].expCount > 1) {
      newFormState[index].expCount--
      setFormState(newFormState)
    }
    const expNo = 10 + newFormState[index].expCount
    form.resetFields([[e.target.value, 'exps', expNo]])
    const newExptState = { ...exptState }
    delete newExptState[e.target.value + '#' + expNo]

    const sampleKey = e.target.value.split('#')[0]
    const oldExpt = exptState[e.target.value + '#' + expNo]
    const newTotalExptValue = moment
      .duration(totalExptState[sampleKey], 'seconds')
      .subtract(oldExpt)
      .as('seconds')

    const newTotalExptState = { ...totalExptState, [sampleKey]: newTotalExptValue }

    setExptState(newExptState)
    setTotalExptState(newTotalExptState)
  }

  const onParamSetChange = (sampleKey, expNo, paramSetName) => {
    form.resetFields([[sampleKey, 'exps', expNo, 'params']])
    const key = sampleKey + '#' + expNo
    const paramSet = props.paramSetsData.find(paramSet => paramSet.name === paramSetName)

    if (paramSet.defaultParams.length < 4) {
      return message.warning('Expt calculation cannot be performed. Default parameters were not defined')
    }
    const newExptState = { ...exptState, [key]: paramSet.defaultParams[4].value }

    const oldExpt = exptState[key]
    const newTotalExptValue = moment
      .duration(totalExptState[sampleKey], 'seconds')
      .subtract(oldExpt)
      .add(moment.duration(paramSet.defaultParams[4].value))
      .as('seconds')
    const newTotalExptState = { ...totalExptState, [sampleKey]: newTotalExptValue }

    setExptState(newExptState)
    setTotalExptState(newTotalExptState)
  }

  const openModalHandler = (event, key, expNo) => {
    event.preventDefault()

    const paramSetName = form.getFieldValue([key, 'exps', expNo, 'paramSet'])
    const paramsString = form.getFieldValue([key, 'exps', expNo, 'params'])
    if (paramSetName) {
      const { defaultParams, customParams } = props.paramSetsData.find(
        paramSet => paramSet.name === paramSetName
      )
      setModalInputData({
        sampleKey: key,
        paramSetName,
        expNo,
        defaultParams,
        customParams
      })
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

      if (param === 'expt') {
        const newExptState = { ...exptState, [key]: params.expt }

        const sampleKey = key.split('#')[0]

        const oldExpt = exptState[key]
        const newTotalExptValue = moment
          .duration(totalExptState[sampleKey], 'seconds')
          .subtract(oldExpt)
          .add(moment.duration(params.expt))
          .as('seconds')

        const newTotalExptState = { ...totalExptState, [sampleKey]: newTotalExptValue }

        setExptState(newExptState)
        setTotalExptState(newTotalExptState)
      }
    }
    paramsString = paramsString.substring(0, paramsString.length - 1)
    const sampleKey = key.split('#')[0]
    const expNo = key.split('#')[1]
    form.setFieldsValue({ [sampleKey]: { exps: { [expNo]: { params: paramsString } } } })

    setModalVisible(false)
  }

  const closeModalHandler = () => {
    setModalVisible(false)
  }

  const expRejectError = {
    title: 'Maximum allowance exceeded',
    content: 'Total experimental time for at least one instrument has exceeded maximum allowance'
  }
  const maxNightRejectError = {
    title: 'Total length of night experiments exceeded',
    content: `The queue of night experiments exceeds maximum length and your experiment would not get executed. 
    Please, try to submit your experiment to a different instrument`
  }

  const onFinishHandler = async values => {
    if (!priorityAccess) {
      //accumulator is an object total expt of day classified experiments for each instrument in the form
      const accumulator = {}
      let nightExp = undefined

      for (let sampleKey in totalExptState) {
        const instrId = sampleKey.split('-')[0]

        const { dayAllowance, nightAllowance, maxNight, nightExpt } = allowanceData.find(
          i => i.instrId === instrId
        )

        if (totalExptState[sampleKey] < dayAllowance * 60) {
          if (accumulator[instrId]) {
            accumulator[instrId] += totalExptState[sampleKey]
          } else {
            accumulator[instrId] = totalExptState[sampleKey]
          }
        } else if (
          totalExptState[sampleKey] > dayAllowance * 60 &&
          totalExptState[sampleKey] < nightAllowance * 60
        ) {
          if (moment.duration(nightExpt, 'hh:mm').asSeconds() + totalExptState[sampleKey] > maxNight * 3600) {
            return Modal.error(maxNightRejectError)
          }

          values[sampleKey].night = true
          nightExp = true
        } else {
          return Modal.error(expRejectError)
        }
      }

      const nightInstrId = []
      for (let instrId in accumulator) {
        const { dayAllowance, nightAllowance } = allowanceData.find(i => i.instrId === instrId)

        if (accumulator[instrId] > nightAllowance * 60) {
          return Modal.error(expRejectError)
        }

        if (accumulator[instrId] > dayAllowance * 60 && accumulator[instrId] < nightAllowance * 60) {
          nightInstrId.push(instrId)
        }
      }

      if (nightInstrId.length > 0 || nightExp) {
        return Modal.confirm({
          title: 'Maximum allowance exceeded',
          content:
            'The experiments that exceeded peak time allowance will be submitted into the night queue.',
          onOk: () => {
            for (let sampleKey in values) {
              const found = nightInstrId.find(id => id === sampleKey.split('-')[0])
              if (found) {
                values[sampleKey].night = true
              }
            }
            props.bookExpsHandler(token, values, props.submittingUserId)
            navigate('/')
          }
        })
      }
    }
    props.bookExpsHandler(token, values, props.submittingUserId)
    navigate('/')
  }

  //Generating form items from input data. inputData is array of objects.
  //The key property is the unique identifier created from instrument ID and holder number.
  const formItems = props.inputData.map(sample => {
    const expNoArr = []
    const found = formState.find(entry => entry.key === sample.key)
    if (found) {
      for (let i = 0; i < found.expCount; i++) {
        expNoArr.push((10 + i).toString())
      }
    }
    //Filtering paramSetsData to get array specific for the instrument
    //And generating corresponding Options for Select input
    const filteredParamSetArr = props.paramSetsData.filter(paramSet =>
      paramSet.availableOn.includes(sample.instId.toString())
    )
    const paramSetsOptions = filteredParamSetArr.map((paramSet, i) => (
      <Option value={paramSet.name} key={i}>
        {`${paramSet.description} [${paramSet.name}]`}
      </Option>
    ))

    //changing style of totalExpt time according to allowance state
    const totalExptClass = [classes.TotalExptBasic]
    const key = sample.key
    const instrId = key.split('-')[0]
    const allowanceDataInstr = allowanceData.find(i => i.instrId === instrId)
    if (allowanceDataInstr) {
      const { dayAllowance, nightAllowance } = allowanceDataInstr
      if (totalExptState[key] < dayAllowance * 60) {
        totalExptClass.push(classes.TotalExptOk)
      } else if (totalExptState[key] > nightAllowance * 60) {
        totalExptClass.push(classes.TotalExptDanger)
      } else {
        totalExptClass.push(classes.TotalExptWarning)
      }
    }

    const checkBoxes = (
      <Col span={1} className={classes.CheckBoxes}>
        <Form.Item name={[key, 'night']} initialValue={false} valuePropName='checked'>
          <Checkbox />
        </Form.Item>
        <Form.Item name={[key, 'priority']} initialValue={false} valuePropName='checked'>
          <Checkbox />
        </Form.Item>
      </Col>
    )

    return (
      <div key={key}>
        <Row gutter={16}>
          <Col span={2}>
            <Form.Item name={[key, 'instrumentName']} initialValue={sample.instrument}>
              <Input size='small' disabled style={disabledStyle} />
            </Form.Item>
          </Col>
          <Col span={1}>
            <Form.Item name={[key, 'holder']} initialValue={sample.holder}>
              <Input size='small' disabled style={disabledStyle} />
            </Form.Item>
          </Col>
          <Col span={2}>
            <SolventSelect nameKey={key} />
          </Col>
          <Col span={priorityAccess ? 6 : 7}>
            <TitleInput nameKey={key} />
          </Col>
          <Col span={1}>
            <Space>
              <button className={classes.CircleButton} value={key} onClick={addExpHandler}>
                +
              </button>
              <button
                className={[classes.CircleButton, classes.CircleButtonMinus].join(' ')}
                value={key}
                onClick={removeExpHandler}
              >
                -
              </button>
            </Space>
          </Col>
          <Col span={10}>
            {expNoArr.map(expNo => (
              <Row key={expNo} gutter={16} align='top'>
                <Col span={1}>
                  <span>{expNo}</span>
                </Col>
                <Col span={13}>
                  <Form.Item
                    name={[key, 'exps', expNo, 'paramSet']}
                    style={{ textAlign: 'left' }}
                    rules={[
                      {
                        required: true,
                        message: 'Parameter set is required'
                      }
                    ]}
                  >
                    <Select
                      onChange={value => {
                        onParamSetChange(key, expNo, value)
                      }}
                    >
                      {paramSetsOptions}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Space align='start'>
                    <Form.Item name={[key, 'exps', expNo, 'params']}>
                      <Input disabled style={disabledStyle} />
                    </Form.Item>
                    <button
                      className={classes.ActionButton}
                      value={key}
                      onClick={e => openModalHandler(e, key, expNo)}
                    >
                      Edit
                    </button>
                  </Space>
                </Col>
                <Col span={2}>{exptState[key + '#' + expNo]}</Col>
              </Row>
            ))}
          </Col>
          {priorityAccess && checkBoxes}
          <Col span={1}>
            <button
              className={classes.CancelButton}
              value={key}
              onClick={e => {
                e.preventDefault()
                props.onCancelHolder(props.token, e.target.value)
                form.resetFields([e.target.value])
              }}
            >
              Cancel
            </button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={3} offset={priorityAccess ? 19 : 20} style={{ textAlign: 'right', marginBottom: 10 }}>
            <span className={totalExptClass.join(' ')}>
              Total ExpT:
              {'  ' + moment.duration(totalExptState[key], 'seconds').format('HH:mm:ss', { trim: false })}
            </span>
          </Col>
        </Row>
        <Divider style={{ marginTop: 0 }} />
      </div>
    )
  })

  const checkBoxesHeader = (
    <Col span={1} className={classes.CheckBoxes}>
      <Tooltip title='Sample submitted into night queue'>
        <img src={nightIcon} style={{ height: '18px' }} alt='night icon' />
      </Tooltip>
      <Tooltip className={classes.Priority} title='Sample submitted with priority'>
        P
      </Tooltip>
    </Col>
  )

  return (
    <div style={{ margin: '20px 40px' }}>
      <Row gutter={16} className={classes.Header}>
        <Col span={2}>Instrument</Col>
        <Col span={1}>Holder</Col>
        <Col span={2}>Solvent</Col>
        <Col span={priorityAccess ? 6 : 7}>Title</Col>
        <Col span={1}>
          <span style={{ marginLeft: 20 }}>ExpNo</span>
        </Col>
        <Col span={4} offset={1}>
          Experiment [Parameter Set]
        </Col>
        <Col span={2} offset={1}>
          Parameters
        </Col>
        <Col span={2}>
          <span style={{ marginLeft: 15 }}>ExpT</span>
        </Col>
        {priorityAccess && checkBoxesHeader}
      </Row>

      {props.loading ? (
        <Spin size='large' style={{ margin: 30 }} />
      ) : (
        <Form form={form} ref={props.formRef} size='small' onFinish={onFinishHandler}>
          {formItems}
          <Form.Item>
            <Button type='primary' size='middle' htmlType='submit'>
              Continue
            </Button>
          </Form.Item>
          <EditParamsModal
            visible={modalVisible}
            closeModal={closeModalHandler}
            onOkHandler={modalOkHandler}
            inputData={modalInputData}
            reset={resetModal}
          />
        </Form>
      )}
    </div>
  )
}

export default BookExperimentsForm
