import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Row, Col, Button, Space } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import moment from 'moment'

const TimedExperimentsModal = props => {
  const [form] = Form.useForm()
  const {
    sampleKey,
    initialDelay: inputInitialDelay,
    repeatLoops: inputRepeatLoops,
    baseTotalSeconds = 0,
    oneSetSeconds = 0
  } = props.inputData

  const watchedInitialDelay = Form.useWatch([sampleKey, 'initialDelay'], form)
  const watchedRepeatLoops = Form.useWatch([sampleKey, 'repeatLoops'], form)

  const currentInitialDelay = watchedInitialDelay ?? inputInitialDelay ?? '00:00'
  const currentRepeatLoops =
    watchedRepeatLoops?.length > 0
      ? watchedRepeatLoops
      : inputRepeatLoops?.length > 0
        ? inputRepeatLoops
        : [{ lag: '00:00', count: 0 }]

  const timedEstimateSeconds = getTimedEstimateSeconds({
    baseTotalSeconds,
    oneSetSeconds,
    initialDelay: currentInitialDelay,
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
          initialDelay: inputInitialDelay ?? '00:00',
          repeatLoops:
            inputRepeatLoops?.length > 0 ? inputRepeatLoops : [{ lag: '00:00', count: 0 }]
        }
      })
    }
  }, [props.visible, sampleKey, inputInitialDelay, inputRepeatLoops, form])

  return (
    <Modal
      title='Setup Timed Experiments'
      open={props.visible}
      footer={null}
      onCancel={props.closeModal}
    >
      {sampleKey && (
        <Form form={form} size='small' onFinish={props.onOkHandler}>
          <Row gutter={16} align='middle'>
            <Col span={10}>
              <strong>Initial Delay</strong>
            </Col>
            <Col span={10}>
              <Form.Item
                name={[sampleKey, 'initialDelay']}
                style={{ marginBottom: 12 }}
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Use HH:mm format'))
                    }
                  }
                ]}
              >
                <Input placeholder='HH:mm' style={{ width: 80 }} />
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
                        initialDelay: '00:00',
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
  initialDelay,
  repeatLoops
}) => {
  const initialDelaySeconds = parseHHMMToSeconds(initialDelay)
  const repeatLagSeconds = getRepeatLagSeconds(repeatLoops)
  const repeatCount = getRepeatCount(repeatLoops)
  const repeatedRunSeconds = oneSetSeconds * repeatCount

  return baseTotalSeconds + initialDelaySeconds + repeatLagSeconds + repeatedRunSeconds
}

const formatSecondsAsHHMM = seconds =>
  moment.duration(seconds, 'seconds').format('HH:mm', { trim: false })
