import React from 'react'
import { Form, Row, Col, Space, Select, Input, Button } from 'antd'

//Row with inputs for a single experiment [ExpNo] of a sample.
//disabledStyle is passed down from SampleRow to keep the styling of disabled inputs consistent.
const ExpNoRow = props => {
  const {
    nameKey,
    expNo,
    paramSetsOptions,
    exptValue,
    disableEdit,
    disabledStyle,
    onParamSetChange,
    onEditParams
  } = props

  return (
    <Row gutter={16} align='top'>
      <Col span={1}>
        <span>{expNo}</span>
      </Col>
      <Col span={13}>
        <Form.Item
          name={[nameKey, 'exps', expNo, 'paramSet']}
          style={{ textAlign: 'left' }}
          rules={[
            {
              required: true,
              message: 'Parameter set is required'
            }
          ]}
        >
          <Select
            showSearch
            filterOption={(val, option) => {
              return option.children.toLowerCase().indexOf(val.toLowerCase()) > -1
            }}
            onChange={onParamSetChange}
          >
            {paramSetsOptions}
          </Select>
        </Form.Item>
      </Col>
      <Col span={7}>
        <Space align='start'>
          <Form.Item name={[nameKey, 'exps', expNo, 'params']}>
            <Input disabled style={disabledStyle} />
          </Form.Item>
          <Button type='primary' value={nameKey} onClick={onEditParams} disabled={disableEdit}>
            Edit
          </Button>
        </Space>
      </Col>
      <Col span={2}>{exptValue}</Col>
    </Row>
  )
}

export default ExpNoRow
