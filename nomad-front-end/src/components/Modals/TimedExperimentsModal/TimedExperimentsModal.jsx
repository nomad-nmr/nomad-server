import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Row, Col, Button, Space } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'

const TimedExperimentsModal = props => {
  const [form] = Form.useForm()
  const { sampleKey, initialDelay, repeatLoops } = props.inputData

  useEffect(() => {
    if (props.visible && sampleKey) {
      form.setFieldsValue({
        [sampleKey]: {
          initialDelay: initialDelay ?? '00:00',
          repeatLoops:
            repeatLoops?.length > 0
              ? repeatLoops
              : [{ lag: '00:00', count: 0 }]
        }
      })
    }
  }, [props.visible, sampleKey, initialDelay, repeatLoops, form])

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
            <Form.Item name={[sampleKey, 'initialDelay']} style={{ marginBottom: 12 }}>
              <Input placeholder='HH:mm' style={{ width: 80 }} />
            </Form.Item>
          </Col>
          <Col span={4} />
        </Row>

        <Row gutter={16} align='middle' style={{ marginBottom: 4 }}>
          <Col span={10}>
            <strong>Delay between experiments </strong>
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
                    <Form.Item name={[field.name, 'lag']} style={{ marginBottom: 8 }}>
                      <Input placeholder='HH:mm' style={{ width: 80 }} />
                    </Form.Item>
                  </Col>

                  <Col span={10}>
                    <Form.Item name={[field.name, 'count']} style={{ marginBottom: 8 }}>
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
