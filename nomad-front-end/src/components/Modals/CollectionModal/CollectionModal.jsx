import React, { useState } from 'react'
import { Modal, Select, Form, Input, Radio } from 'antd'
import { useLocation } from 'react-router'

const CollectionModal = props => {
  const { token } = props

  const [form] = Form.useForm()
  const [newCollection, setNewCollection] = useState(false)
  const [radioValue, setRadioValue] = useState('Copy')
  const { pathname } = useLocation()

  const options = [
    { label: 'Create New', value: '##-new-##' },
    {
      label: '---------',
      options: props.collectionList
    }
  ]

  const okHandler = async () => {
    const values = await form.validateFields()
    if (values.collection) {
      props.requestHandler({ ...values, datasets: props.data }, token)
      form.resetFields()
      setNewCollection(false)
    }
    if (radioValue === 'Move') {
      props.removeHandler(props.collectionId, props.data, token)
      setRadioValue('Copy')
    }
  }

  return (
    <Modal
      title={`Add${pathname.includes('collections') && ' / Move'} datasets to collection`}
      open={props.open}
      onCancel={() => {
        props.cancelHandler()
        form.resetFields()
        setNewCollection(false)
        setRadioValue('Copy')
      }}
      onOk={() => okHandler()}
      width={700}
    >
      {pathname.includes('collections') && (
        <Radio.Group
          options={['Copy', 'Move']}
          optionType='button'
          buttonStyle='solid'
          value={radioValue}
          defaultValue={'Copy'}
          onChange={event => setRadioValue(event.target.value)}
        />
      )}
      <Form form={form} style={{ marginTop: '25px' }}>
        <Form.Item name='collection' label='Collection'>
          <Select
            options={options}
            onSelect={value => {
              if (value === '##-new-##') {
                setNewCollection(true)
              } else {
                setNewCollection(false)
              }
            }}
          />
        </Form.Item>
        {newCollection && (
          <Form.Item
            name='newTitle'
            label='New Title'
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Title for new collection is required'
              },
              { min: 5, message: 'Title has to have more tha 5 characters' }
            ]}
          >
            <Input />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default CollectionModal
