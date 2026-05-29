import React from 'react'
import HeatMap from '@uiw/react-heat-map'
import Tooltip from '@uiw/react-tooltip'
import { Flex, Select, Spin } from 'antd'

const Heatmaps = props => {
  const sortedData = [...props.data].sort((a, b) => b.count - a.count)
  console.log('heatmap data', props.data[0])
  return (
    <div style={{ marginTop: 10 }}>
      <Select
        style={{ width: 180, marginBottom: 10 }}
        value={props.selectedInput}
        onChange={value => props.onSelectInputChange(value)}
      >
        <Select.Option value='days'>Days</Select.Option>
        <Select.Option value='months'>Months</Select.Option>
        <Select.Option value='years'>Years</Select.Option>
      </Select>
      <Spin spinning={props.loading}>
        <Flex justify='space-around'>
          <HeatMap
            value={props.data}
            width={1200}
            height={190}
            weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
            startDate={new Date(props.data[0]?.date)}
            endDate={new Date(props.data[props.data.length - 1]?.date)}
            rectSize={20}
            legendCellSize={0}
            style={{ '--rhm-rect': '#b9b9b9' }}
            rectProps={{
              rx: 4
            }}
            rectRender={(props, data) => {
              return (
                <Tooltip
                  placement='top'
                  content={`date: ${data.date.slice(2)}, count: ${data.count || 0}`}
                >
                  <rect {...props} />
                </Tooltip>
              )
            }}
          />
        </Flex>
        <div style={{ fontSize: 16 }}>
          <span style={{ fontWeight: 'bold' }}>Peak day: </span> {sortedData[0]?.date} with{' '}
          {sortedData[0]?.count} experiments
        </div>
      </Spin>
    </div>
  )
}

export default Heatmaps
