import React, { Fragment } from 'react'
import HeatMap from '@uiw/react-heat-map'
import TooltipHeat from '@uiw/react-tooltip'
import { Flex, Select, Spin } from 'antd'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

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
              <TooltipHeat
                placement='top'
                content={`date: ${valueObj.date.slice(2)}, count: ${valueObj.count || 0}`}
              >
                <rect {...props} />
              </TooltipHeat>
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
    const xKey = selectedInput === 'months' ? 'month' : 'year'
    heatmapElement = (
      <Flex justify='space-around'>
        <BarChart
          style={{ width: '100%', maxWidth: '1000px', maxHeight: '200px', aspectRatio: 1.618 }}
          responsive
          data={data}
        >
          <Bar
            dataKey='count'
            fill='#2f54eb'
            activeBar={{ fill: '#faad14', stroke: '#237804' }}
            radius={[10, 10, 0, 0]}
          />
          <XAxis dataKey={xKey} />
          <YAxis width='auto' />
          <Tooltip />
          <CartesianGrid strokeDasharray='3 3' />
        </BarChart>
      </Flex>
    )
  }

  return (
    <div style={{ marginTop: 10 }}>
      <Select
        style={{ width: 180, marginBottom: 20 }}
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
