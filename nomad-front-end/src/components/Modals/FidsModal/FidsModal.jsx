import React, { useState } from 'react'
import { Modal, Table } from 'antd'

const FidsModal = props => {
  const { data, fetchFids, token } = props

  const [checked, setChecked] = useState([])

  const columns = [
    {
      title: 'Nucleus',
      dataIndex: 'nucleus',
      align: 'center'
    },
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'center'
    },
    {
      title: 'Title',
      dataIndex: 'title',
      align: 'center'
    }
  ]

  const rowSelection = {
    selectionType: 'checkbox',
    selectedRowKeys: checked,
    onChange: selectedRowKeys => {
      setChecked(selectedRowKeys)
    }
  }

  const fetchHandler = () => {
    const expsArray = checked.map(key => {
      const exp = data.find(entry => entry.key === key)
      return key + '/' + exp.dataType
    })
    fetchFids(expsArray, token)
    setChecked([])
  }

  return (
    <Modal
      title='Select experiments for adding FIDs'
      open={props.open}
      onCancel={() => {
        props.cancelHandler()
        setChecked([])
      }}
      onOk={() => fetchHandler()}
      okText='Proceed'
      width={800}
      okButtonProps={{ disabled: checked.length === 0 }}
    >
      <div style={{ margin: '20px 0' }}>
        {props.data.length > 0 ? (
          <Table
            columns={columns}
            size='small'
            dataSource={data}
            pagination={false}
            rowSelection={rowSelection}
          />
        ) : (
          'FIDs can be added only for 1D experiments. Currently there are no 1D experiments opened in NMRium'
        )}
      </div>
    </Modal>
  )
}

export default FidsModal
