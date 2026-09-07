import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Form, Spin, Button, Space, message, Popconfirm } from 'antd'
import moment from 'moment'

import FormHeader from './FormHeader/FormHeader'
import SampleRow from './SampleRow/SampleRow'
import EditParamsModal from '../../Modals/EditParamsModal/EditPramsModal'
import TimedExperimentsModal from '../../Modals/TimedExperimentsModal/TimedExperimentsModal'

import createOnFinishHandler from './submitBooking'
import {
  deriveTimedStatus,
  getExperimentSetSeconds,
  computeExpTimeUpdate,
  computeExpTimeRemoval
} from './bookExperimentsUtils'

const BookExperimentsForm = props => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()

  const [formState, setFormState] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  //state used to generate form inputs in edit parameters modal
  const [modalInputData, setModalInputData] = useState({})

  const [timingModalVisible, setTimingModalVisible] = useState(false)
  const [timingModalData, setTimingModalData] = useState({})

  const [resetModal, setResetModal] = useState(undefined)
  const [exptState, setExptState] = useState({})
  const [totalExptState, setTotalExptState] = useState({})
  const [disableContinue, setDisableContinue] = useState(false)

  const {
    inputData,
    allowanceData,
    fetchAllowance,
    token,
    accessLevel,
    formValues,
    newHolderData
  } = props

  const priorityAccess = accessLevel === 'user-a' || accessLevel === 'admin'
  const resubmit = formValues

  //This hook is used to cancel booked holders on the form component dismount in /resubmit location
  // It uses deleteHolders function in submit controller at the backend which has
  // 120s timeout to allow for iconNMR to pickup submit file
  // It also sets disableContinue state to true for 20s to prevent user from submitting form.
  // If form is submitted to early then delete and book submit will created in the same time.

  useEffect(() => {
    if (location.pathname === '/resubmit') {
      setDisableContinue(true)
      setTimeout(() => {
        setDisableContinue(false)
      }, 20000)
      return () => {
        props.cancelHolders(
          token,
          inputData.map(i => i.key)
        )
      }
    }
  }, [])

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
          expCount: resubmit ? i.expCount : 1
        })
      }
    })

    setFormState(newFormState)

    if (instrIds.size !== 0) {
      fetchAllowance(token, Array.from(instrIds))
    }

    //setting up form values and  expTime if form used for resubmit
    if (resubmit) {
      form.setFieldsValue(formValues)
    }

    // formState can't be dependency as it gets updated in the hook. That would trigger loop.
    // eslint-disable-next-line
  }, [inputData, formValues])

  //This hook creates initial totalExpT state with overhead time for each entry
  useEffect(() => {
    if (resubmit) {
      const expTimeStateEntries = []
      const totalExpTimeStateEntries = []

      if (allowanceData.length > 0) {
        for (let sampleKey in formValues) {
          let expTimeSum = allowanceData[0].overheadTime
          //selecting first element of allowanceData array works as
          //only holders on one instrument can be selected for resubmit
          for (let expNo in formValues[sampleKey].exps) {
            expTimeStateEntries.push([
              sampleKey + '#' + expNo,
              formValues[sampleKey].exps[expNo].expTime
            ])
            expTimeSum += moment
              .duration(formValues[sampleKey].exps[expNo].expTime, 'HH:mm:ss')
              .asSeconds()
          }
          totalExpTimeStateEntries.push([sampleKey, expTimeSum])
        }
      }

      setExptState(Object.fromEntries(expTimeStateEntries))
      setTotalExptState(Object.fromEntries(totalExpTimeStateEntries))
    } else {
      const newTotalExptState = { ...totalExptState }
      if (allowanceData.length !== 0 && !resubmit) {
        formState.forEach(entry => {
          const instrId = entry.key.split('-')[0]
          const { overheadTime } = allowanceData.find(i => i.instrId === instrId)
          if (!newTotalExptState[entry.key]) {
            newTotalExptState[entry.key] = overheadTime
          }
        })
      }
      setTotalExptState(newTotalExptState)
    }

    // eslint-disable-next-line
  }, [allowanceData])

  useEffect(() => {
    for (let key in totalExptState) {
      const instrId = key.split('-')[0]
      const allowanceDataInstr = allowanceData.find(i => i.instrId === instrId)
      if (allowanceDataInstr && priorityAccess) {
        const { dayAllowance } = allowanceDataInstr
        if (totalExptState[key] > dayAllowance * 60) {
          form.setFieldValue([key, 'night'], true)
        }
      }
    }
  }, [totalExptState])

  useEffect(() => {
    if (newHolderData) {
      form.setFieldsValue({
        [newHolderData.key]: {
          holder: newHolderData.holder
        }
      })
    }
  }, [newHolderData])

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

    const newState = computeExpTimeRemoval({
      exptState,
      totalExptState,
      compositeKey: e.target.value + '#' + expNo
    })

    setExptState(newState.exptState)
    setTotalExptState(newState.totalExptState)
  }

  const onParamSetChange = (sampleKey, expNo, paramSetName) => {
    form.resetFields([[sampleKey, 'exps', expNo, 'params']])
    const paramSet = props.paramSetsData.find(paramSet => paramSet.name === paramSetName)

    if (paramSet.defaultParams.length < 4) {
      return message.warning(
        'Expt calculation cannot be performed. Default parameters were not defined'
      )
    }

    const newState = computeExpTimeUpdate({
      exptState,
      totalExptState,
      compositeKey: sampleKey + '#' + expNo,
      newExpTime: paramSet.defaultParams[4].value
    })

    setExptState(newState.exptState)
    setTotalExptState(newState.totalExptState)
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
        const newState = computeExpTimeUpdate({
          exptState,
          totalExptState,
          compositeKey: key,
          newExpTime: params.expt
        })

        setExptState(newState.exptState)
        setTotalExptState(newState.totalExptState)
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

  //handler for opening and closing timing modal.
  const openTimingModal = key => {
    setTimingModalData({
      sampleKey: key,
      firstExperimentStartsAt: form.getFieldValue([key, 'firstExperimentStartsAt']) ?? '',
      repeatLoops: form.getFieldValue([key, 'repeatLoops']) ?? [{ lag: '00:00', count: 0 }],
      baseTotalSeconds: totalExptState[key] || 0,
      oneSetSeconds: getExperimentSetSeconds(key, exptState)
    })

    setTimingModalVisible(true)
  }

  const closeTimingModal = () => {
    setTimingModalVisible(false)
  }

  const getTimedConfigStatus = key =>
    deriveTimedStatus(
      form.getFieldValue([key, 'firstExperimentStartsAt']),
      form.getFieldValue([key, 'repeatLoops'])
    )

  const timingModalOkHandler = values => {
    const key = Object.keys(values)[0]
    const { firstExperimentStartsAt, repeatLoops } = values[key]

    form.setFieldsValue({
      [key]: {
        firstExperimentStartsAt,
        repeatLoops,
        night: false,
        priority: false
      }
    })

    setTimingModalVisible(false)
  }

  //Generating form items from input data. inputData is array of objects.
  //The key property is the unique identifier created from instrument ID and holder number.
  const formItems = props.inputData.map(sample => {
    const key = sample.key
    const expNoArr = []
    const found = formState.find(entry => entry.key === key)
    if (found) {
      for (let i = 0; i < found.expCount; i++) {
        expNoArr.push((10 + i).toString())
      }
    }

    return (
      <SampleRow
        key={key}
        sample={sample}
        expNoArr={expNoArr}
        paramSetsData={props.paramSetsData}
        exptState={exptState}
        totalExpt={totalExptState[key]}
        allowanceDataInstr={allowanceData.find(i => i.instrId === key.split('-')[0])}
        timedStatus={getTimedConfigStatus(key)}
        priorityAccess={priorityAccess}
        resubmit={resubmit}
        newHolderLoading={props.newHolderLoading}
        newHolderKey={props.newHolderData?.key}
        onAddExp={addExpHandler}
        onRemoveExp={removeExpHandler}
        onSkipHolder={() => props.getNewHolder(token, key)}
        onCancelHolder={e => {
          e.preventDefault()
          props.onCancelHolder(props.token, e.target.value)
          form.resetFields([e.target.value])
        }}
        onParamSetChange={(expNo, value) => onParamSetChange(key, expNo, value)}
        onOpenParamsModal={(event, expNo) => openModalHandler(event, key, expNo)}
        onOpenTimingModal={() => openTimingModal(key)}
      />
    )
  })

  return (
    <div style={{ margin: '20px 40px' }}>
      <FormHeader priorityAccess={priorityAccess} />

      {props.loading ? (
        <Spin size='large' style={{ margin: 30 }} />
      ) : (
        <Form
          form={form}
          size='small'
          onFinish={createOnFinishHandler({
            priorityAccess,
            allowanceData,
            totalExptState,
            token,
            submittingUserId: props.submittingUserId,
            bookExpsHandler: props.bookExpsHandler,
            navigate
          })}
        >
          {formItems}
          <Space>
            <Form.Item>
              <Button
                type='primary'
                size='middle'
                htmlType='submit'
                loading={disableContinue}
                disabled={disableContinue}
              >
                Continue
              </Button>
            </Form.Item>
            {resubmit && (
              <Form.Item>
                <Popconfirm
                  title='Cancel holders'
                  description='Booked holders will be canceled '
                  onConfirm={() => navigate('/dashboard')}
                >
                  <Button size='middle'>Cancel</Button>
                </Popconfirm>
              </Form.Item>
            )}
          </Space>

          <TimedExperimentsModal
            visible={timingModalVisible}
            closeModal={closeTimingModal}
            onOkHandler={timingModalOkHandler}
            inputData={timingModalData}
          />

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
