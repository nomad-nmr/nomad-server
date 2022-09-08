import React from 'react'
import { Modal, Form, Input, Button, Space } from 'antd'
import moment from 'moment'

const DownloadModal = props => {
  const defaultZipFileName = 'NOMAD_download-' + moment().format('YY-MM-DD_HH:mm')

  const downloadHandler = values => {
    let expsArr = []
    props.checkedExps.forEach(entry => {
      expsArr = [...expsArr, ...entry.exps]
    })
    props.downloadHandler(expsArr, values.zipFileName, props.token)
  }

  return (
    <Modal visible={props.visible} onCancel={props.toggleHandler} width={600} footer={null}>
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 40 }}
        onFinish={values => downloadHandler(values)}
        initialValues={{ zipFileName: defaultZipFileName }}
      >
        <Form.Item
          label='File Name'
          name='zipFileName'
          rules={[
            {
              required: true,
              message: 'Please input download file name!'
            }
          ]}
        >
          <Input addonAfter='.zip' />
        </Form.Item>
        <Form.Item style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
          <Space size='large'>
            <Button type='primary' htmlType='submit'>
              Download
            </Button>
            <Button onClick={props.toggleHandler}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DownloadModal
