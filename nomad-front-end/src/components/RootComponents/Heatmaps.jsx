import React from 'react'
import HeatMap from '@uiw/react-heat-map'
import Tooltip from '@uiw/react-tooltip'
import { Flex } from 'antd'

const value = [
  { date: '2016/01/11', count: 2 },
  { date: '2016/01/12', count: 20 },
  { date: '2016/01/13', count: 10 },
  ...[...Array(17)].map((_, idx) => ({
    date: `2016/02/${idx + 10}`,
    count: idx,
    content: ''
  })),
  { date: '2016/04/11', count: 2 },
  { date: '2016/05/01', count: 5 },
  { date: '2016/05/02', count: 5 },
  { date: '2016/05/04', count: 11 }
]

const Heatmaps = () => {
  return (
    <Flex justify='space-around'>
      <div>
        <HeatMap
          value={value}
          width={1200}
          weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
          startDate={new Date('2016/01/01')}
          endDate={new Date('2016/12/31')}
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
      </div>
    </Flex>
  )
}

export default Heatmaps
