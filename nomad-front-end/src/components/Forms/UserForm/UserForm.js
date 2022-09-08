import React, { useEffect, useState, Fragment } from 'react'
import { Form, Input, Button, Select, Checkbox } from 'antd'

import dataAccessOptions from '../dataAccessOptions'
import classes from '../Form.module.css'

const { Option } = Select

const layout = {
  labelCol: {
    span: 7
  },
  wrapperCol: {
    span: 17
  }
}

const tailLayout = {
  wrapperCol: {
    offset: 4,
    span: 20
  }
}

const UserForm = props => {
  const [form] = Form.useForm()

  const [isBatchState, setIsBatchState] = useState(false)
  const [formValues, setFormValues] = useState({
    accessLevel: 'user',
    isActive: true
  })
  const [currentGroup, setCurrentGroup] = useState(undefined)

  //Helper function that check whether the current groups is for batch submit
  const checkBatchHandler = grpId => {
    const group = props.groupList.find(grp => grp.id === grpId)
    const isBatch = group ? group.isBatch : false
    if (isBatch) {
      setIsBatchState(true)
      setFormValues({ ...form.getFieldsValue(), accessLevel: 'user-b' })
    } else {
      setIsBatchState(false)
      setFormValues({ ...form.getFieldsValue(), accessLevel: 'user' })
    }
  }

  useEffect(() => {
    if (currentGroup) {
      checkBatchHandler(currentGroup)
    }
    // adding checkBatchHandler to dependency array is not necessary and would complicate the things
    // eslint-disable-next-line
  }, [currentGroup])

  //Enables to control from through setFormValues.Don't move or remove!!!
  useEffect(() => {
    form.resetFields()
  })

  const onReset = () => {
    props.toggleDrawer()
    setFormValues({ accessLevel: 'user', isActive: true })
  }

  const onFinish = values => {
    // Checking whether to update or add
    if (values._id) {
      props.updateUsrHandler(values, props.authToken)
    } else {
      props.addUsrHandler(values, props.authToken)
    }
    setFormValues({ accessLevel: 'user', isActive: true })
  }

  const groupSelectOptions = props.groupList.map(grp => {
    return (
      <Option key={grp.id} value={grp.id}>
        {grp.name}
      </Option>
    )
  })

  let accessLevelOptions = (
    <Fragment>
      <Option value='admin'>admin</Option>
      <Option value='admin-b'>admin-b</Option>
      <Option value='user'>user</Option>
      <Option value='user-a'>user-a</Option>
    </Fragment>
  )

  if (isBatchState) {
    accessLevelOptions = (
      <Fragment>
        <Option value='user-b'>user-b</Option>
        <Option value='admin-b'>admin-b</Option>
      </Fragment>
    )
  }

  const newDataAccessOptions = [
    <Option key='undefined' value={undefined}>
      undefined
    </Option>,
    ...dataAccessOptions
  ]

  return (
    <div className={classes.formInDrawer}>
      <Form {...layout} form={form} ref={props.formReference} initialValues={formValues} onFinish={onFinish}>
        <Form.Item
          name='username'
          label='Username'
          rules={[{ required: true, whitespace: true, message: 'Username is required' }]}
        >
          <Input disabled={props.editing} style={{ width: '60%' }} />
        </Form.Item>
        <Form.Item
          name='email'
          label='Email'
          rules={[
            { required: true, whitespace: true, message: 'Email is required' },
            { type: 'email', message: 'The input is not valid E-mail' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='fullName'
          label='Full Name'
          rules={[{ required: true, whitespace: true, message: "User's full Name is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name='groupId' label='Group' rules={[{ required: true }]}>
          <Select style={{ width: '60%' }} onChange={value => setCurrentGroup(value)}>
            {groupSelectOptions}
          </Select>
        </Form.Item>
        <Form.Item name='accessLevel' label='Access Level'>
          <Select style={{ width: '60%' }}>{accessLevelOptions}</Select>
        </Form.Item>
        <Form.Item
          name='dataAccess'
          label='Data Access'
          tooltip='Leave undefined if you want to use settings from the group table'
        >
          <Select style={{ width: '60%' }}>{newDataAccessOptions}</Select>
        </Form.Item>
        <Form.Item name='isActive' label='Active' valuePropName='checked'>
          <Checkbox />
        </Form.Item>
        <Form.Item hidden name='_id'>
          <Input />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button className={classes.Button} type='primary' htmlType='submit'>
            Submit
          </Button>
          <Button className={classes.Button} htmlType='button' onClick={onReset}>
            Reset & Close
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default UserForm
