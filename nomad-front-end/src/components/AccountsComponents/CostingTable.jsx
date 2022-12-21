import React, { useState } from 'react'
import { Form, InputNumber, Popconfirm, Table, Button, Space } from 'antd'

//The original code from antd was simplified as only the table
// will ever have only one row

const reformatOriginData = input => {
  const output = {}
  input.forEach(i => {
    output[i.name] = i.cost
  })
  return { ...output, key: '1' }
}

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0
          }}
          rules={[
            {
              required: true,
              message: `Please Input Costing for ${title}!`
            }
          ]}
        >
          <InputNumber precision={2} min={0} />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  )
}

const CostingTable = props => {
  const [form] = Form.useForm()
  const [data, setData] = useState([reformatOriginData(props.costingData)])
  const [editing, setEditing] = useState(false)

  const edit = record => {
    const valuesObj = data[0]
    form.setFieldsValue({ ...valuesObj, ...record })
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
  }

  const save = async () => {
    try {
      props.resetTable()

      const row = await form.validateFields()
      const newData = [...data]
      const item = newData[0]

      newData.splice(0, 1, { ...item, ...row })
      setData(newData)
      setEditing(false)
      props.updateDataHandler(props.token, row)
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

  const columns = []

  props.costingData.forEach(i => {
    columns.push({
      title: i.name,
      dataIndex: i.name,
      render: text => `£ ${text.toFixed(2)}`,
      editable: true,
      width: 100,
      align: 'center'
    })
  })

  columns.push({
    title: 'Actions',
    dataIndex: 'operation',
    width: 100,
    render: () => {
      return editing ? (
        <Space>
          <Button type='link' onClick={() => save()}>
            Save
          </Button>
          <Popconfirm title='Sure to cancel?' onConfirm={cancel}>
            <Button type='link'>Cancel</Button>
          </Popconfirm>
        </Space>
      ) : (
        <Button type='link' disabled={editing} onClick={() => edit()}>
          Edit
        </Button>
      )
    }
  })

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col
    }

    return {
      ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing
      })
    }
  })

  return (
    <div style={{ width: props.costingData.length * 120 + 100, margin: 'auto' }}>
      <h3 style={{ textAlign: 'center' }}>Cost per hour of machine time</h3>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell
            }
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName='editable-row'
          pagination={false}
          width={300}
        />
      </Form>
    </div>
  )
}

export default CostingTable
