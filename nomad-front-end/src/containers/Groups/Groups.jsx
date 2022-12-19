import React, { useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Table, Tag, Space, Button, Popconfirm, Tooltip, Upload, Modal } from 'antd'
import Animate from 'rc-animate'

import { ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'

import GroupForm from '../../components/Forms/GroupForm/GroupForm'
import { renderDataAccess } from '../../utils/tableUtils'

import {
  fetchGroups,
  fetchParamSets,
  addGroup,
  updateGroup,
  toggleGroupForm,
  toggleActiveGroup,
  addUsers
} from '../../store/actions/index'

import './Groups.css'
import classes from './Groups.module.css'

const { CheckableTag } = Tag

const Groups = props => {
  const { fetchGrps, authToken, showInactive, getParamSetsList } = props

  const formRef = useRef({})

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchGrps(authToken, showInactive)
    getParamSetsList(authToken, { instrumentId: null, searchValue: '', list: true })
  }, [fetchGrps, authToken, showInactive, getParamSetsList])

  const addUsersfromCSV = (file, record) => {
    const reader = new FileReader()
    reader.onload = e => {
      const resultArr = e.target.result.split('\n').map(row => row.substr(0, row.length - 1))
      let usernamesCount = 0
      resultArr.forEach(i => {
        if (i.length > 0) {
          usernamesCount++
        }
      })
      Modal.confirm({
        title: `Add users from CSV file to group ${record.groupName}`,
        content: (
          <div style={{ marginTop: 10 }}>
            <span>CSV file contains {usernamesCount} usernames</span>
            <p style={{ fontWeight: 600, marginTop: 5 }}>Do you want to proceed?</p>
          </div>
        ),
        onOk() {
          props.addUsrs(resultArr, record._id, authToken, showInactive)
        }
      })
    }
    reader.readAsText(file)
    return false
  }

  const renderActions = record => {
    let popConfirmMsg = (
      <div className={classes.Message}>
        <h4>Setting a group inactive will also set all users in the group inactive.</h4>
        <p>Do you want to continue?</p>
      </div>
    )

    if (!record.isActive) {
      popConfirmMsg = (
        <div className={classes.Message}>
          <h4>After setting a group active the users within the group will remain inactive.</h4>
          <p>Do you want to continue?</p>
        </div>
      )
    }

    return (
      <Space>
        <Popconfirm
          title={popConfirmMsg}
          placement='left'
          icon={<ExclamationCircleOutlined style={{ fontSize: '20px', paddingRight: '10px' }} />}
          onConfirm={() => {
            props.toggleActive(record._id, authToken)
          }}
        >
          <CheckableTag key={record.key} checked={record.isActive}>
            {record.isActive ? 'Active' : 'Inactive'}
          </CheckableTag>
        </Popconfirm>

        <Button
          size='small'
          type='link'
          onClick={() => {
            if (!props.showForm) {
              props.toggleGrpForm(true)
            }
            setTimeout(() => formRef.current.setFieldsValue(record), 100)
          }}
        >
          Edit
        </Button>
        <Tooltip title='Add users from csv file' placement='topLeft'>
          <Upload accept='.csv' showUploadList={false} beforeUpload={file => addUsersfromCSV(file, record)}>
            <Button size='small' type='link'>
              Add users
            </Button>
          </Upload>
        </Tooltip>
      </Space>
    )
  }

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      sorter: (a, b) => a.groupName.localeCompare(b.groupName)
    },
    {
      title: 'Description',
      dataIndex: 'description'
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt'
    },
    {
      title: 'Active/Total Users',
      align: 'center',
      render: record => (
        <div>
          {record.activeUserCount}/{record.totalUserCount}
        </div>
      )
    },
    {
      title: 'Experiment List Count',
      align: 'center',
      render: record => record.expList.length
    },
    {
      title: 'Batch Submit',
      align: 'center',
      render: record => {
        return record.isBatch && <CheckCircleOutlined style={{ color: '#52c41a' }} />
      }
    },
    {
      title: 'Data Access',
      align: 'center',
      render: record => renderDataAccess(record.dataAccess)
    },

    {
      title: 'Actions',
      align: 'center',
      render: record => renderActions(record)
    }
  ]

  const form = (
    <GroupForm
      formReference={formRef}
      addGroupHandler={props.addGrp}
      updateGroupHandler={props.updateGrp}
      authToken={props.authToken}
      editing={props.formEditing}
      toggleForm={props.toggleGrpForm}
      paramSets={props.paramSetsList}
    />
  )

  return (
    <div style={{ margin: '30px 50px 20px 50px' }}>
      <Animate transitionName='fade-form'>{props.showForm && form}</Animate>
      <Table
        size='small'
        dataSource={props.tableData}
        columns={columns}
        loading={props.tabLoading}
        pagination={false}
      />
    </div>
  )
}

const mapStateToProps = state => {
  return {
    authToken: state.auth.token,
    tableData: state.groups.groupsTableData,
    tabLoading: state.groups.tableIsLoading,
    showForm: state.groups.showForm,
    formEditing: state.groups.isEditing,
    showInactive: state.groups.showInactive,
    paramSetsList: state.paramSets.paramSetsData
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchGrps: (token, showInactive) => dispatch(fetchGroups(token, showInactive)),
    getParamSetsList: (token, searchParams) => dispatch(fetchParamSets(token, searchParams)),
    addGrp: (data, token) => dispatch(addGroup(data, token)),
    updateGrp: (data, token) => dispatch(updateGroup(data, token)),
    toggleGrpForm: editing => dispatch(toggleGroupForm(editing)),
    toggleActive: (groupId, token) => dispatch(toggleActiveGroup(groupId, token)),
    addUsrs: (users, groupId, token, showInactive) => dispatch(addUsers(users, groupId, token, showInactive))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups)
