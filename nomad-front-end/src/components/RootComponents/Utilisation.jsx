import React from 'react'
import { Select, Col, Row } from 'antd'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList
} from 'recharts'

const Utilisation = props => {
  const { pieChartData, barChartData } = props.data

  console.log(pieChartData, barChartData)

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#FF7C7C'
  ]

  return (
    <div>
      <Select
        style={{ width: 180, margin: '10px 0 20px 0 ' }}
        value={props.selectedInput}
        onChange={value => props.onSelectInputChange(value)}
      >
        <Select.Option value='12_months'>Trailing 12 Months</Select.Option>
        <Select.Option value='last_30_days'>Last 30 Days</Select.Option>
        <Select.Option value='today'>Today</Select.Option>
      </Select>
      <Row>
        <Col span={12}>
          <PieChart
            style={{ width: '100%', maxWidth: '1000px', maxHeight: '200px', aspectRatio: 1.618 }}
            responsive
          >
            <Pie
              data={pieChartData}
              dataKey='value'
              nameKey='instrumentName'
              cx='50%'
              cy='50%'
              outerRadius={80}
              fill='#8884d8'
            >
              {pieChartData &&
                pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip formatter={value => `${value}%`} />
            <Legend />
          </PieChart>
        </Col>
        <Col span={12}>
          <BarChart
            style={{ width: '100%', maxWidth: '1000px', maxHeight: '220px', aspectRatio: 1.618 }}
            responsive
            data={barChartData}
          >
            <Bar
              dataKey='utilisation'
              fill='#2f54eb'
              activeBar={{ fill: '#faad14', stroke: '#237804' }}
              radius={[10, 10, 0, 0]}
            >
              <LabelList dataKey='totalExpTime' position='top' color='black' />
            </Bar>
            <XAxis dataKey='instrumentName' />
            <YAxis width='auto' tickFormatter={value => `${value}%`} />
            <Tooltip formatter={value => `${value}%`} />
            <CartesianGrid strokeDasharray='3 3' />
          </BarChart>
        </Col>
      </Row>
    </div>
  )
}

export default Utilisation
