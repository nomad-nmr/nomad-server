import React, { useEffect, useState } from 'react'
import { Table, Space, Tag, Button, Pagination } from 'antd'
import dayjs from 'dayjs'
import { responsiveArray } from 'antd/es/_util/responsiveObserver'

const ClaimsHistoryTable = props => {
  const [usernameFilters, setUsernameFilters] = useState([])
  const [instrumentFilters, setInstrumentFilters] = useState([])

  useEffect(() => {
    const usernameSet = new Set()
    const instrumentsSet = new Set()
    props.data.forEach(i => {
      usernameSet.add(i.user.username)
      instrumentsSet.add(i.instrument.name)
    })
    const userFiltersArray = []
    const instrumentFiltersArray = []
    for (const entry of usernameSet.values()) {
      userFiltersArray.push({ text: entry, value: entry })
    }
    for (const entry of instrumentsSet.values()) {
      instrumentFiltersArray.push({ text: entry, value: entry })
    }
    setUsernameFilters(userFiltersArray)
    setInstrumentFilters(instrumentFiltersArray)
  }, [props.data])

  const columns = [
    {
      title: 'Date',
      align: 'center',
      dataIndex: 'createdAt',
      width: 150,
      defaultSortOrder: 'ascend',

      sorter: (a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),

      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-')
    },
    {
      title: 'Instrument',
      dataIndex: ['instrument', 'name'],
      align: 'center',
      filters: instrumentFilters,
      onFilter: (value, record) => record.instrument.name === value
    },
    {
      title: 'Group',
      dataIndex: ['group', 'groupName'],
      align: 'center'
    },
    {
      title: 'User',
      align: 'center',
      children: [
        { title: 'Full Name', dataIndex: ['user', 'fullName'], align: 'center' },
        {
          title: 'Username',
          dataIndex: ['user', 'username'],
          align: 'center',
          filters: usernameFilters,
          onFilter: (value, record) => record.user.username === value
        }
      ]
    },
    {
      title: 'Note',
      dataIndex: 'note',
      align: 'center',
      width: 300
    },
    {
      title: 'Experimental Time [hours]',
      dataIndex: 'expTime',
      align: 'center',
      width: 25
    },
    {
      title: 'Status',
      align: 'center',
      render: record => (
        <Tag color={record.status === 'Pending' ? 'orange' : 'green'}>{record.status}</Tag>
      )
    },
    {
      title: 'Actions',
      align: 'centre',
      render: record => (
        <Button
          size='small'
          type='link'
          disabled={record.status === 'Approved'}
          onClick={() => {
            props.onAmend({ claimId: record.key, expTime: record.expTime })
          }}
        >
          Amend
        </Button>
      )
    }
  ]

  const expandElement = record => (
    <Space>
      <span style={{ fontWeight: 700 }}>Folders:</span>
      {record.folders.map((folder, index) => (
        <span key={index}>{`[${folder}]`}</span>
      ))}
      {record.status === 'Approved' && (
        <div>
          <span style={{ fontWeight: 700 }}>Approved at: </span>
          <span>{dayjs(record.updatedAt).format('DD-MMM-YY HH:mm')}</span>
        </div>
      )}
    </Space>
  )

  const rowSelection = {
    selectionType: 'checkbox',
    selectedRowKeys: props.selected,
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
    onChange: selectedRowKeys => {
      props.checkedHandler(selectedRowKeys)
    },
    getCheckboxProps: record => ({
      disabled: record.status === 'Approved'
    })
  }

  return (
    <div>
      <Table
        columns={columns}
        dataSource={props.data}
        size='small'
        expandable={{ expandedRowRender: expandElement }}
        rowSelection={rowSelection}
        pagination={false}
      />
      <Pagination
        style={{ marginTop: '20px', textAlign: 'right' }}
        size='small'
        pageSize={props.pageSize}
        current={props.currentPage}
        defaultPageSize={15}
        showSizeChanger
        pageSizeOptions={[10, 15, 30, 60, 100]}
        total={props.total}
        onChange={page => props.currentPageHandler(page)}
        onShowSizeChange={(current, size) => {
          props.currentPageHandler(current)
          props.pageSizeHandler(size)
        }}
      />
    </div>
  )
}

export default ClaimsHistoryTable
