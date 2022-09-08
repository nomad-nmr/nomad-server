import React, { useState } from 'react'
import { Modal, Table, Alert, message, Button, Space } from 'antd'

import StatusTag from '../StatusTag/StatusTag'

const RepairModal = props => {
  const [checked, setChecked] = useState([])

  const { repaired, data, token, instrId, visible } = props

  const columns = [
    {
      title: 'Dataset Name',
      dataIndex: 'datasetName'
    },
    {
      title: 'ExpNo',
      dataIndex: 'expNo',
      align: 'center'
    },
    {
      title: 'User',
      dataIndex: 'username',
      align: 'center'
    },
    {
      title: 'Group',
      dataIndex: 'group',
      align: 'center'
    },
    {
      title: 'Title',
      dataIndex: 'title'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      render: text => <StatusTag text={text} />
    }
  ]

  const cancelHandler = () => {
    setChecked([])
    props.closeModalHandler()
  }

  const oKHandler = () => {
    if (checked.length === 0) {
      return message.error('No experiments selected')
    }
    props.repairHandler(instrId, checked, token)
  }

  const onRefresh = () => {
    const expIdsArray = data.map(i => i.key)
    props.refreshHandler(expIdsArray, token)
  }

  let alertMessage = ''
  let alertType = undefined

  if (data.length > 0 && !repaired) {
    alertMessage = `${data.length} experiment${data.length !== 1 && 's'} in current history table ${
      data.length === 1 ? 'has' : 'have'
    } not been archived. Select experiments that you want to repair and click on "Proceed" to carry on repair routine.`
    alertType = 'warning'
  }

  if (data.length === 0 && !repaired) {
    alertMessage =
      'Nothing to repair. All experiments in current experiment history table have been archived.'
    alertType = 'success'
  }

  let unarchived = undefined

  if (repaired) {
    unarchived = data.find(i => i.status !== 'Archived')
    if (unarchived) {
      alertMessage =
        'Some experiments on the list have not been archived. Repair process might take a while to finish. Click on "Refresh" to see if there is any progress.'
    } else {
      alertMessage = 'Success! All experiments on the list have been archived'
      alertType = 'success'
    }
  }

  const rowSelection = {
    selectedRowKeys: checked,
    onChange: keys => setChecked(keys)
  }

  const buttons = repaired ? (
    <Space>
      <Button disabled={!unarchived} onClick={onRefresh}>
        Refresh
      </Button>
      <Button onClick={cancelHandler}>Close</Button>
    </Space>
  ) : (
    <Space>
      <Button type='primary' onClick={oKHandler}>
        Proceed
      </Button>
      <Button onClick={cancelHandler}>Close</Button>
    </Space>
  )

  return (
    <Modal visible={visible} width='80%' centered footer={null} onCancel={cancelHandler}>
      <Alert
        message={alertMessage}
        type={alertType}
        showIcon
        style={{ margin: '25px 10px', textAlign: 'center' }}
      />
      {data.length > 0 && (
        <Table
          columns={columns}
          dataSource={data}
          rowSelection={!repaired && rowSelection}
          pagination={!repaired}
          loading={props.loading}
        />
      )}
      <div style={{ textAlign: 'center', marginTop: repaired && 20 }}>{buttons}</div>
    </Modal>
  )
}

export default RepairModal
