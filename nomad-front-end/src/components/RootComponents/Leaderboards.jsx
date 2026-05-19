import React from 'react'
import { Row, Col, Typography, Select, Table } from 'antd'

const Leaderboards = props => {
  const { Title } = Typography
  const { data } = props

  const tableTitles = [
    'Automation Experiments Archived',
    'Automation Samples Processed',
    'Datasets Created'
  ]

  const columns = [
    {
      title: 'User',
      dataIndex: 'fullName',
      key: 'user',
      align: 'center'
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'group',
      width: 120,
      align: 'center'
    },
    {
      title: 'Score',
      dataIndex: 'archivedCount',
      key: 'archivedCount',
      width: 120,
      align: 'center'
    }
  ]

  return (
    <div>
      <Select
        style={{ width: 180, margin: '10px 0 20px 0 ' }}
        value={props.selectedInput}
        onChange={value => props.onSelectInputChange(value)}
      >
        <Select.Option value='total'>Total</Select.Option>
        <Select.Option value='last_30_days'>Last 30 Days</Select.Option>
        <Select.Option value='today'>Today</Select.Option>
      </Select>
      <Row gutter={[16, 16]}>
        {tableTitles.map((title, index) => {
          const dataIndex = data.findIndex(stat => stat.title === title)
          return (
            <Col span={8} key={index}>
              <Title level={5} style={{ textAlign: 'center', color: '#237804' }}>
                {title}
              </Title>
              <Table
                columns={columns}
                dataSource={data.length > 0 ? data[dataIndex].dataArray : []}
                pagination={false}
                bordered
                size='small'
                style={{ margin: '10px' }}
                loading={props.loading}
              />
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

export default Leaderboards
