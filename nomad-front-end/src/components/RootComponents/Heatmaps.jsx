import React, { Fragment } from 'react'
import HeatMap from '@uiw/react-heat-map'
import Tooltip from '@uiw/react-tooltip'
import { Flex, Select, Spin } from 'antd'

const Heatmaps = props => {
  const { selectedInput, onSelectInputChange, data, loading } = props
  const sortedData = [...data].sort((a, b) => b.count - a.count)

  let heatmapElement = (
    <Fragment>
      <Flex justify='space-around'>
        <HeatMap
          value={data}
          width={1200}
          height={190}
          weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
          startDate={new Date(data[0]?.date)}
          endDate={new Date(data[data.length - 1]?.date)}
          rectSize={20}
          legendCellSize={0}
          style={{ '--rhm-rect': '#b9b9b9' }}
          rectProps={{
            rx: 4
          }}
          rectRender={(props, valueObj) => {
            return (
              <Tooltip
                placement='top'
                content={`date: ${valueObj.date.slice(2)}, count: ${valueObj.count || 0}`}
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
    </Fragment>
  )

  if (selectedInput !== 'days') {
    console.log(data)
    heatmapElement = <div>Bar Chart</div>
  }

  return (
    <div style={{ marginTop: 10 }}>
      <Select
        style={{ width: 180, marginBottom: 10 }}
        value={selectedInput}
        onChange={value => onSelectInputChange(value)}
      >
        <Select.Option value='days'>Days</Select.Option>
        <Select.Option value='months'>Months</Select.Option>
        <Select.Option value='years'>Years</Select.Option>
      </Select>
      <Spin spinning={props.loading}>{heatmapElement}</Spin>
    </div>
  )
}

export default Heatmaps
