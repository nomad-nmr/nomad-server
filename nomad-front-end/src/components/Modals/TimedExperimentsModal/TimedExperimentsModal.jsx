import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, TimePicker, Row, Col, Button, Space } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import dayjs from 'dayjs'

const TimedExperimentsModal = props => {
  const [form] = Form.useForm()
  const {
    sampleKey,
    firstExperimentStartsAt: inputFirstStart,
    repeatLoops: inputRepeatLoops,
    baseTotalSeconds = 0,
    oneSetSeconds = 0
  } = props.inputData

  const watchedFirstStart = Form.useWatch([sampleKey, 'firstExperimentStartsAt'], form)
  const watchedRepeatLoops = Form.useWatch([sampleKey, 'repeatLoops'], form)

  const currentFirstStart = watchedFirstStart ?? toTimePickerValue(inputFirstStart)
  const currentRepeatLoops =
    watchedRepeatLoops?.length > 0
      ? watchedRepeatLoops
      : inputRepeatLoops?.length > 0
        ? inputRepeatLoops
        : [{ lag: '00:00', count: 0 }]

  const timedEstimateSeconds = getTimedEstimateSeconds({
    baseTotalSeconds,
    oneSetSeconds,
    firstStart: currentFirstStart,
    repeatLoops: currentRepeatLoops
  })

  const timedEstimateMinutes = Math.ceil(timedEstimateSeconds / 60)

  const estimatedEndTime = moment()
    .add(timedEstimateMinutes, 'minutes')
    .format('DD/MM/YYYY HH:mm')

  useEffect(() => {
    if (props.visible && sampleKey) {
      form.setFieldsValue({
        [sampleKey]: {
          firstExperimentStartsAt: toTimePickerValue(inputFirstStart),
          repeatLoops:
            inputRepeatLoops?.length > 0 ? inputRepeatLoops : [{ lag: '00:00', count: 0 }]
        }
      })
    }
  }, [props.visible, sampleKey, inputFirstStart, inputRepeatLoops, form])

  //TimePicker holds a dayjs object. It gets converted to an 'HH:mm' string here
  //so that the parent form and the API payload only ever carry strings.
  const onFinishHandler = values => {
    const key = Object.keys(values)[0]
    const { firstExperimentStartsAt } = values[key]

    props.onOkHandler({
      ...values,
      [key]: {
        ...values[key],
        firstExperimentStartsAt: firstExperimentStartsAt
          ? firstExperimentStartsAt.format('HH:mm')
          : ''
      }
    })
  }

  return (
    <Modal
      title='Setup Timed Experiments'
      open={props.visible}
      footer={null}
      onCancel={props.closeModal}
    >
      {sampleKey && (
        <Form form={form} size='small' onFinish={onFinishHandler}>
          <Row gutter={16} align='middle'>
            <Col span={10}>
              <strong>First experiment starts at</strong>
            </Col>
            <Col span={10}>
              <Form.Item
                name={[sampleKey, 'firstExperimentStartsAt']}
                style={{ marginBottom: 12 }}
              >
                <TimePicker format='HH:mm' allowClear style={{ width: 100 }} />
              </Form.Item>
            </Col>
            <Col span={4} />
          </Row>

          <Row gutter={16} align='middle' style={{ marginBottom: 4 }}>
            <Col span={10}>
              <strong>Delay between experiments</strong>
            </Col>
            <Col span={10}>
              <strong>Loop Count</strong>
            </Col>
            <Col span={4} />
          </Row>

          <Form.List name={[sampleKey, 'repeatLoops']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <Row gutter={16} key={field.key} align='middle'>
                    <Col span={10}>
                      <Form.Item
                        name={[field.name, 'lag']}
                        style={{ marginBottom: 8 }}
                        rules={[
                          {
                            validator: (_, value) => {
                            if (!value) {
                              return Promise.resolve()
                            }

                            if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
                              return Promise.reject(new Error('Use HH:mm format'))
                            }

                            const lagSeconds = parseHHMMToSeconds(value)

                            if (lagSeconds > 0 && oneSetSeconds > 0 && lagSeconds < oneSetSeconds) {
                              return Promise.reject(
                                new Error(
                                  `Delay must exceed ${formatSecondsAsHHMM(oneSetSeconds)}, the experiment time`
                                )
                              )
                            }

                            return Promise.resolve()
                          }

                          }
                        ]}
                      >
                        <Input placeholder='HH:mm' style={{ width: 80 }} />
                      </Form.Item>
                    </Col>

                    <Col span={10}>
                      <Form.Item
                        name={[field.name, 'count']}
                        style={{ marginBottom: 8 }}
                        rules={[
                          {
                            required: true,
                            message: 'Enter a loop count'
                          }
                        ]}
                      >
                        <InputNumber min={0} style={{ width: 80 }} />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      {fields.length > 1 && (
                        <Button
                          type='text'
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </Col>
                  </Row>
                ))}

                <Row>
                  <Col span={24}>
                    <Form.Item style={{ marginTop: 8 }}>
                      <Button
                        type='dashed'
                        onClick={() => add({ lag: '00:00', count: 0 })}
                        icon={<PlusOutlined />}
                        block
                      >
                        Add Loop
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Form.List>

          <Row justify='center' style={{ marginTop: 12, marginBottom: 8 }}>
            <Col>
              <strong>Estimated end time: </strong>
              {estimatedEndTime}
            </Col>
          </Row>

          <Row justify='center'>
            <Form.Item style={{ marginTop: 12 }}>
              <Space>
                <Button type='primary' htmlType='submit'>
                  OK
                </Button>

                <Button
                  onClick={() => {
                    form.setFieldsValue({
                      [sampleKey]: {
                        firstExperimentStartsAt: null,
                        repeatLoops: [{ lag: '00:00', count: 0 }]
                      }
                    })
                  }}
                >
                  Reset
                </Button>

                <Button onClick={props.closeModal}>Cancel</Button>
              </Space>
            </Form.Item>
          </Row>
        </Form>
      )}
    </Modal>
  )
}

export default TimedExperimentsModal

const parseHHMMToSeconds = value => {
  if (!value) return 0
  const [hours = 0, minutes = 0] = value.split(':').map(Number)
  return hours * 3600 + minutes * 60
}

const getRepeatCount = repeatLoops =>
  Array.isArray(repeatLoops)
    ? repeatLoops.reduce((sum, loop) => sum + (Number(loop?.count) || 0), 0)
    : 0

const getRepeatLagSeconds = repeatLoops =>
  Array.isArray(repeatLoops)
    ? repeatLoops.reduce(
        (sum, loop) => sum + parseHHMMToSeconds(loop?.lag) * (Number(loop?.count) || 0),
        0
      )
    : 0

const getTimedEstimateSeconds = ({
  baseTotalSeconds = 0,
  oneSetSeconds = 0,
  firstStart,
  repeatLoops
}) => {
  const startOffsetSeconds = getSecondsUntilFirstStart(firstStart)
  const repeatLagSeconds = getRepeatLagSeconds(repeatLoops)
  const repeatCount = getRepeatCount(repeatLoops)
  const repeatedRunSeconds = oneSetSeconds * repeatCount

  return baseTotalSeconds + startOffsetSeconds + repeatLagSeconds + repeatedRunSeconds
}

//'HH:mm' string coming from the parent form gets converted to the dayjs object TimePicker needs.
//Parsed by hand as the dayjs customParseFormat plugin is not loaded in this app.
const toTimePickerValue = value => {
  if (!value || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) return null
  const [hour, minute] = value.split(':').map(Number)
  return dayjs().set('hour', hour).set('minute', minute).set('second', 0).set('millisecond', 0)
}

//mirrors resolveFirstStartTime in the submit controller so that the estimated end time
//matches the schedule the server will calculate
const getSecondsUntilFirstStart = firstStart => {
  if (!firstStart) return 0

  const now = dayjs()
  let startTime = now
    .set('hour', firstStart.hour())
    .set('minute', firstStart.minute())
    .set('second', 0)
    .set('millisecond', 0)

  if (!startTime.isAfter(now)) {
    startTime = startTime.add(1, 'day')
  }

  return startTime.diff(now, 'second')
}

const formatSecondsAsHHMM = seconds =>
  moment.duration(seconds, 'seconds').format('HH:mm', { trim: false })
