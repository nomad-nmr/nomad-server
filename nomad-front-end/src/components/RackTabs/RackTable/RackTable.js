import React from 'react'
import { connect } from 'react-redux'
import { Table, Space, Divider, Button, Modal, Form, Input } from 'antd'
import moment from 'moment'

import { sendMessage, deleteSample, setSelectedSlots } from '../../../store/actions'
import StatusTag from '../../StatusTag/StatusTag'

const RackTable = props => {
  const { username, accessLevel, authToken } = props
  const { rackData } = props
  const [form] = Form.useForm()

  const deleteRejectHandler = record => {
    const modalList = (
      <ul style={{ marginTop: 10 }}>
        <li>
          <span style={{ fontWeight: 600 }}>Rack Title: </span>
          {rackData.title}
        </li>
        <li>
          <span style={{ fontWeight: 600 }}>Username: </span>
          {record.user.username}
        </li>
        <li>
          <span style={{ fontWeight: 600 }}>Slot: </span>
          {record.slot}
        </li>

        <li>
          <span style={{ fontWeight: 600 }}>Sample Title: </span>
          {record.title}
        </li>
      </ul>
    )

    const rejectForm = (
      <Form form={form} labelCol={{ span: 4 }} layout='vertical'>
        <Form.Item name='reason' label='Reason'>
          <Input.TextArea />
        </Form.Item>
      </Form>
    )

    if (props.rackData.isOpen) {
      return (
        <Button
          type='link'
          disabled={!authToken || (username !== record.user.username && accessLevel === 'user-b')}
          onClick={() => {
            Modal.confirm({
              title: 'Do you want to delete this rack entry',
              content: modalList,

              onOk() {
                props.deleteSampleHandler(rackData._id, record.slot, authToken)
              }
            })
          }}
        >
          Delete
        </Button>
      )
    } else {
      return (
        <Button
          type='link'
          disabled={record.status}
          onClick={() =>
            Modal.confirm({
              width: 600,
              title: 'Reject rack entry',
              content: (
                <>
                  {modalList}
                  {rejectForm}
                </>
              ),
              onOk() {
                const messageData = {
                  recipients: [{ name: record.user.username, type: 'user' }],
                  subject: 'Sample rejected',
                  message: `Dear ${record.user.fullName}

Your sample in rack ${rackData.title} in slot ${record.slot} with title "${record.title}" 
was rejected for the following reason: ${form.getFieldValue('reason')}
`
                }
                props.sendMsg(authToken, messageData)
                props.deleteSampleHandler(rackData._id, record.slot, authToken)
                form.resetFields()
              }
            })
          }
        >
          Reject
        </Button>
      )
    }
  }

  const columns = [
    {
      title: 'Slot',
      dataIndex: 'slot',
      align: 'center',
      width: 75,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.slot - b.slot
    },
    {
      title: 'Username',
      dataIndex: ['user', 'username'],
      align: 'center',
      width: 75
    },
    {
      title: 'Full Name',
      dataIndex: ['user', 'fullName'],
      align: 'center'
    },
    {
      title: 'Solvent',
      dataIndex: 'solvent',
      align: 'center'
    },
    {
      title: 'Title',
      dataIndex: 'title',
      align: 'center'
    },
    {
      title: 'Sample ID',
      dataIndex: 'tubeId',
      align: 'center'
    },
    {
      title: 'Exp Count',
      dataIndex: 'exps',
      align: 'center',
      render: value => value.length
    },
    {
      title: 'Added at',
      dataIndex: 'addedAt',
      align: 'center',
      render: value => moment(value).format('HH:mm')
    },
    {
      title: 'Actions',
      align: 'center',
      render: record => deleteRejectHandler(record)
    }
  ]

  if (!rackData.isOpen) {
    columns.splice(
      7,
      0,
      {
        title: 'Instrument',
        align: 'center',
        render: record => (record.instrument ? record.instrument.name : 'N/A')
      },
      {
        title: 'Holder',
        align: 'center',
        render: record => (record.holder ? record.holder : 'N/A')
      },
      {
        title: 'Status',
        align: 'center',
        render: record => (record.status ? <StatusTag text={record.status} /> : 'N/A')
      }
    )
  }

  const expandElement = record => {
    const expElement = record.exps.map((exp, index) => (
      <div key={index}>
        {index !== 0 && <Divider type='vertical' />}
        {exp}
      </div>
    ))
    return (
      <Space>
        <span style={{ fontWeight: 600 }}>Experiments [Parameter Sets] : </span>
        {expElement}
        <span style={{ fontWeight: 600, marginLeft: 20 }}>Dataset Name: </span>
        {record.dataSetName ? record.dataSetName : 'N/A'}
      </Space>
    )
  }

  const rowSelection = !rackData.isOpen && {
    selectedRowKeys: props.selectedSlots,
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],

    onChange: selectedRowKeys => {
      props.setSlots(selectedRowKeys)
    }
  }

  const tableDataSource = rackData.samples.map(sample => ({ ...sample, key: sample.slot }))

  return (
    <Table
      columns={columns}
      dataSource={tableDataSource}
      pagination={false}
      size='small'
      expandable={{ expandedRowRender: expandElement }}
      rowSelection={rowSelection}
    />
  )
}

const mapStateToProps = state => {
  return {
    username: state.auth.username,
    authToken: state.auth.token,
    accessLevel: state.auth.accessLevel,
    selectedSlots: state.batchSubmit.selectedSlots
  }
}

const mapDispatchToProps = dispatch => {
  return {
    sendMsg: (token, data) => dispatch(sendMessage(token, data)),
    deleteSampleHandler: (rackId, slot, token) => dispatch(deleteSample(rackId, slot, token)),
    setSlots: slots => dispatch(setSelectedSlots(slots))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RackTable)
