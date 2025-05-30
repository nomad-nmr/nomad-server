import React, { useState, useEffect } from 'react'
import { Form, Select, Space, Switch } from 'antd'

const SelectGrpUsr = props => {
  const {
    inactiveSwitch,
    fetchUsrListHandler,
    userList,
    fetchGrpListHandler,
    token,
    formRef,
    dataAccessLvl,
    needUserSelection = true
  } = props

  let groupList = props.groupList

  const { Option } = Select

  const [grpInactiveChecked, setGrpInactiveChecked] = useState(false)
  const [usrInactiveChecked, setUsrInactiveChecked] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(undefined)
  const [legacy, setLegacy] = useState()

  useEffect(() => {
    if (groupList.length === 1) {
      const groupId = groupList[0].id
      fetchUsrListHandler(token, groupId, false, true)
      formRef.current.setFieldsValue({ groupId })
      setSelectedGroupId(groupId)
    }
    // eslint-disable-next-line
  }, [groupList])

  //API returns list of all users including inactive and thus we filter to get inactive users only
  if (grpInactiveChecked) {
    groupList = groupList.filter(grp => !grp.isActive)
  }

  const grpOptions = groupList.map(i => (
    <Option value={i.id} key={i.id}>
      {i.name}
    </Option>
  ))

  //no need for finding users if you dont need them
  const usrOptions = (!needUserSelection ? [] : userList).map(i => (
    <Option value={i._id} key={i._id}>
      {`[${i.username}] ${i.fullName}`}
    </Option>
  ))

  return (
    <Space size='large'>
      {inactiveSwitch && (
        <Form.Item label='Inactive' tooltip='if ON select from inactive groups'>
          <Switch
            disabled={props.dataAccessLvl === 'group'}
            checkedChildren='ON'
            unCheckedChildren='OFF'
            size='small'
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
          disabled={props.dataAccessLvl === 'group' || props.disabled}
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
          label='Inactive'
          name='inactiveSwitchOn'
          valuePropName='checked'
          tooltip='if ON select from inactive users'
        >
          <Switch
            size='small'
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
      {
        needUserSelection && (
          <Form.Item label='Username' name='userId'>
          <Select style={{ width: 250 }} disabled={legacy || props.disabled}>
            {usrOptions}
          </Select>
        </Form.Item>
        )
      }
      {props.legacySwitch && (dataAccessLvl === 'group' || dataAccessLvl === 'admin-b') ? (
        <Form.Item
          label='Legacy'
          name='legacyData'
          valuePropName='checked'
          tooltip='if ON data acquired for previous groups included in search and data acquired for current group are excluded'
        >
          <Switch
            checkedChildren='ON'
            unCheckedChildren='OFF'
            size='small'
            onChange={() => {
              setLegacy(!legacy)
              const user = userList.find(usr => usr.username === props.loggedUser)
              formRef.current.setFieldsValue({ groupId: undefined, userId: user._id })
            }}
          />
        </Form.Item>
      ) : null}
    </Space>
  )
}

export default SelectGrpUsr
