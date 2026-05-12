import React from 'react'
import { Row, Flex, Statistic } from 'antd'

const TrafficDataStats = props => {
  return (
    <div style={{ marginTop: '2rem' }}>
      <Flex justify='space-around' align='center'>
        {props.data.map((item, index) => (
          <Statistic title={item.title} value={item.value} key={index} />
        ))}
      </Flex>
    </div>
  )
}

export default TrafficDataStats
