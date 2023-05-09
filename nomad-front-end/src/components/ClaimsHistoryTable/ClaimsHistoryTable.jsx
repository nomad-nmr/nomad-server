import React, { useEffect, useState } from 'react'
import { Table, Space, Tag, Button } from 'antd'
import dayjs from 'dayjs'

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
      {record.folders.map(folder => (
        <span>{`[${folder}]`}</span>
      ))}
    </Space>
  )

  return (
    <Table
      columns={columns}
      dataSource={props.data}
      size='small'
      expandable={{ expandedRowRender: expandElement }}
    />
  )
}

export default ClaimsHistoryTable
