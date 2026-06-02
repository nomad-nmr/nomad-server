import React from 'react'
import { Row, Flex, Statistic } from 'antd'

const TrafficDataStats = props => {
  const { data } = props

  const titles = [
    'Experiments Archived',
    'Automation Experiments Archived',
    'Manual Experiments Archived',
    'Automation Processed Samples',
    'Created Datasets',
    'Created Collections'
  ]

  return (
    <div style={{ marginTop: '2rem' }}>
      <Flex justify='space-around' align='center'>
        {titles.map((title, index) => {
          const dataIndex = data.findIndex(stat => stat.title === title)
          return (
            <Statistic
              title={<div style={{ fontWeight: 600, color: '#595959' }}>{title}</div>}
              value={data.length > 0 ? data[dataIndex].value : null}
              key={index}
              loading={props.loading}
            />
          )
        })}
      </Flex>
    </div>
  )
}

export default TrafficDataStats
