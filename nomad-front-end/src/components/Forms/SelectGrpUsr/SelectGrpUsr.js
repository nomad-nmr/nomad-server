import React, { useState, useEffect } from 'react'
import { Form, Select, Space, Switch } from 'antd'

const SelectGrpUsr = props => {
  const { inactiveSwitch, fetchUsrListHandler, userList, fetchGrpListHandler, token, formRef } = props

  let groupList = props.groupList

  const { Option } = Select

  const [grpInactiveChecked, setGrpInactiveChecked] = useState(false)
  const [usrInactiveChecked, setUsrInactiveChecked] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(undefined)

  useEffect(() => {
    if (groupList.length === 1) {
      const groupId = groupList[0].id
      fetchUsrListHandler(token, groupId, false, true)
      formRef.current.setFieldsValue({ groupId })
      setSelectedGroupId(groupId)
    }
    // eslint-disable-next-line
  }, [])

  //API returns list of all users including inactive and thus we filter to get inactive users only
  if (grpInactiveChecked) {
    groupList = groupList.filter(grp => !grp.isActive)
  }

  const grpOptions = groupList.map(i => (
    <Option value={i.id} key={i.id}>
      {i.name}
    </Option>
  ))

  const usrOptions = userList.map(i => (
    <Option value={i._id} key={i._id}>
      {`[${i.username}] ${i.fullName}`}
    </Option>
  ))

  return (
    <Space size='large'>
      {inactiveSwitch && (
        <Form.Item label='Inactive Groups' tooltip='if ON select from inactive groups'>
          <Switch
            disabled={props.dataAccessLvl === 'group'}
            checkedChildren='ON'
            unCheckedChildren='OFF'
            onChange={checked => {
              setGrpInactiveChecked(checked)
              fetchGrpListHandler(token, checked)
              props.resetUserListHandler()
              formRef.current.setFieldsValue({
                groupId: undefined,
                userId: undefined,
                inactiveSwitchOn: checked
              })
            }}
          />
        </Form.Item>
      )}
      <Form.Item label='Group' name='groupId'>
        <Select
          disabled={props.dataAccessLvl === 'group'}
          style={{ width: 150 }}
          onChange={value => {
            fetchUsrListHandler(token, value, usrInactiveChecked, inactiveSwitch)
            formRef.current.setFieldsValue({ userId: undefined })
            setSelectedGroupId(value)
          }}
        >
          {grpOptions}
        </Select>
      </Form.Item>
      {inactiveSwitch && (
        <Form.Item
          label='Inactive Users'
          name='inactiveSwitchOn'
          valuePropName='checked'
          tooltip='if ON select from inactive users'
        >
          <Switch
            checkedChildren='ON'
            unCheckedChildren='OFF'
            onChange={checked => {
              if (selectedGroupId) {
                fetchUsrListHandler(token, selectedGroupId, checked, inactiveSwitch)
                formRef.current.setFieldsValue({ userId: undefined })
                setUsrInactiveChecked(checked)
              }
            }}
          />
        </Form.Item>
      )}
      <Form.Item label='Username' name='userId'>
        <Select style={{ width: 250 }}>{usrOptions}</Select>
      </Form.Item>
    </Space>
  )
}

export default SelectGrpUsr
