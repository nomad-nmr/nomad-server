import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { connect } from 'react-redux'
import { Button, Table, Drawer, Flex, Modal, Tag, Space, Pagination, Tooltip } from 'antd'
import { CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
const { confirm } = Modal

import UserForm from '../../components/Forms/UserForm/UserForm'
import {
  addUser,
  updateUser,
  fetchUsers,
  toggleUserForm,
  toggleActive,
  fetchGroupList,
  resetUserSearch,
  usersDeleteHandler,
  updatedCheckedUsers
} from '../../store/actions/index'
import { renderDataAccess } from '../../utils/tableUtils'

import { MailOutlined } from '@ant-design/icons'

const { CheckableTag } = Tag

const Users = props => {
  const {
    fetchUsers,
    fetchGrpList,
    authToken,
    showInactive,
    grpList,
    searchUserValue,
    resetUsrSearch,
    selectedRows,
    setSelectedRows
  } = props

  const formRef = useRef({})
  const navigate = useNavigate()

  //Local state for table and its pagination
  const [groupFilters, setGroupFilters] = useState([])
  const [pageSize, setPageSize] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({})
  const [sorter, setSorter] = useState({})

  //Hook to fetch users according using search params stored in the state
  useEffect(() => {
    window.scrollTo(0, 0)
    const searchParams = {
      current: currentPage,
      pageSize,
      ...filters,
      showInactive,
      username: searchUserValue,
      lastLoginOrder: sorter.order
    }
    fetchUsers(authToken, searchParams)
  }, [authToken, fetchUsers, filters, showInactive, searchUserValue, currentPage, pageSize, sorter])

  //Hook to fetch group list for form and filters
  useEffect(() => {
    fetchGrpList(authToken, showInactive)
  }, [fetchGrpList, authToken, showInactive])

  //Hook to set group filters in the local state.
  useEffect(() => {
    const grpFilters = grpList.map(grp => ({ text: grp.name, value: grp.id }))
    setGroupFilters(grpFilters)
  }, [grpList])

  useEffect(() => {
    return () => resetUsrSearch()
    // eslint-disable-next-line
  }, [])

  const handleTableChange = (pagination, filters, sorter) => {
    setFilters(filters)
    setSorter(sorter)
    setCurrentPage(1)
    setPageSize(15)
  }

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username'
    },
    {
      title: 'Email',
      dataIndex: 'email'
    },
    {
      title: 'Full name',
      dataIndex: 'fullName'
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'group',
      filters: groupFilters,
      filteredValue: filters.group || null
    },
    {
      title: 'Access level',
      children: [
        {
          title: 'Main',
          align: 'center',
          key: 'accessLevel',
          render: record => {
            let tagColor = null
            switch (record.accessLevel) {
              case 'admin':
                tagColor = 'red'
                break
              case 'admin-b':
                tagColor = 'orange'
                break

              case 'user':
                tagColor = 'blue'
                break

              case 'user-a':
                tagColor = 'green'
                break

              case 'user-b':
                tagColor = 'cyan'
                break

              case 'user-d':
                tagColor = 'purple'
                break

              default:
                break
            }
            return <Tag color={tagColor}>{record.accessLevel}</Tag>
          },
          filters: [
            { text: 'admin', value: 'admin' },
            { text: 'admin-b', value: 'admin-b' },
            { text: 'user', value: 'user' },
            { text: 'user-a', value: 'user-a' },
            { text: 'user-b', value: 'user-b' }
          ],
          filteredValue: filters.accessLevel || null
        },
        {
          title: (
            <Tooltip title='If undefined then settings from the group table apply'>Data</Tooltip>
          ),

          align: 'center',
          render: record => renderDataAccess(record.dataAccess)
        },
        {
          title: 'Manual',
          dataIndex: 'manualAccess',
          align: 'center',
          render: record =>
            record ? (
              <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} />
            ) : (
              <StopOutlined style={{ color: '#cf1322', fontSize: '18px' }} />
            )
        },
        {
          title: 'Accounts',
          dataIndex: 'accountsAccess',
          align: 'center',
          render: record =>
            record ? (
              <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} />
            ) : (
              <StopOutlined style={{ color: '#cf1322', fontSize: '18px' }} />
            )
        }
      ]
    },

    {
      title: 'Last login',
      dataIndex: 'lastLogin',
      align: 'center',
      sorter: (a, b) => a.lastLogin - b.lastLogin
    },
    {
      title: 'Inactive Days',
      dataIndex: 'inactiveDays',
      align: 'center'
    },

    {
      title: 'Actions',
      align: 'center',
      render: record => (
        <Space>
          <CheckableTag
            key={record.key}
            checked={record.isActive}
            onChange={() => props.toggleActive(record._id, authToken)}
          >
            {record.isActive ? 'Active' : 'Inactive'}
          </CheckableTag>
          <MailOutlined
            style={{ color: '#1890ff' }}
            onClick={() =>
              navigate(
                `/admin/message?userId=${record._id}&username=${record.username}&fullName=${record.fullName}`
              )
            }
          />
          <Button
            size='small'
            type='link'
            onClick={() => {
              props.toggleUsrDrawer(true)
              setTimeout(() => formRef.current.setFieldsValue(record), 200)
            }}
          >
            Edit
          </Button>
        </Space>
      )
    }
  ]
  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: selectedRowKeys => {
      setSelectedRows(selectedRowKeys)
    }
  }

  return (
    <div style={{ margin: '30px 20px 20px 20px' }}>
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection
        }}
        rowKey={record => record._id}
        size='small'
        dataSource={props.tabData}
        columns={columns}
        loading={props.tabLoading}
        pagination={false}
        onChange={handleTableChange}
        filters={filters}
      />
      <Pagination
        style={{ marginTop: '20px', textAlign: 'right' }}
        current={currentPage}
        pageSize={pageSize}
        defaultPageSize={15}
        total={props.totalUsers}
        size='small'
        hideOnSinglePage
        pageSizeOptions={[10, 15, 30, 60, 100]}
        onChange={page => setCurrentPage(page)}
        onShowSizeChange={(current, size) => {
          setCurrentPage(current)
          setPageSize(size)
        }}
        showTotal={total => `Total ${total} users`}
      />
      <Drawer
        width={400}
        open={props.usrDrawerVisible}
        placement='right'
        onClose={() => {
          props.toggleUsrDrawer(false)
        }}
      >
        <UserForm
          formReference={formRef}
          toggleDrawer={props.toggleUsrDrawer}
          authToken={props.authToken}
          addUsrHandler={props.addUsrHandler}
          updateUsrHandler={props.updateUsrHandler}
          editing={props.formEditing}
          groupList={props.grpList}
        />
      </Drawer>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    tabData: state.users.usersTableData,
    totalUsers: state.users.total,
    tabLoading: state.users.tableIsLoading,
    deleting: state.users.deleteInProgress,
    authToken: state.auth.token,
    usrDrawerVisible: state.users.showForm,
    formEditing: state.users.editing,
    showInactive: state.users.showInactive,
    selectedRows: state.users.checked,

    //list of group names for select component
    grpList: state.groups.groupList,
    searchUserValue: state.users.searchUserValue
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchUsers: (token, searchParams) => dispatch(fetchUsers(token, searchParams)),
    //argument editing (boolean) is used to disable name input
    toggleUsrDrawer: editing => dispatch(toggleUserForm(editing)),
    addUsrHandler: (formData, token) => dispatch(addUser(formData, token)),
    updateUsrHandler: (formData, token) => dispatch(updateUser(formData, token)),
    toggleActive: (id, token) => dispatch(toggleActive(id, token)),
    fetchGrpList: (token, showInactive) => dispatch(fetchGroupList(token, showInactive)),
    resetUsrSearch: () => dispatch(resetUserSearch()),

    setSelectedRows: rows => dispatch(updatedCheckedUsers(rows))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
