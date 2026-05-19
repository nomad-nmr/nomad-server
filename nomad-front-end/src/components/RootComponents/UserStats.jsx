import React from 'react'
import { Flex, Statistic, Space, Popover } from 'antd'

import { QuestionCircleOutlined } from '@ant-design/icons'
import { GroupSizeContext } from 'antd/es/button/button-group'

const UserStats = props => {
  const titles = [
    'Total Number of Users',
    'Users Active Last 30 Days',
    'Number of Active Groups',
    'NMRium Utilisation'
  ]

  const { data } = props

  return (
    <div>
      <Flex justify='space-around' align='center'>
        {titles.map((title, index) => {
          const dataIndex = data.findIndex(stat => stat.title === title)
          return (
            <div key={index}>
              <Space>
                <Statistic
                  title={<div style={{ fontWeight: 600, color: '#595959' }}>{title}</div>}
                  value={data.length > 0 ? data[dataIndex].value : null}
                  suffix={title === 'NMRium Utilisation' ? '%' : undefined}
                  loading={props.loading}
                />
                {title === 'NMRium Utilisation' && (
                  <Popover
                    content={
                      <div>
                        <p>This is the percentage of active users who more often open </p>
                        <p>spectra in NMRium than download data to use another software.</p>
                      </div>
                    }
                    title={title}
                    placement='left'
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                )}
              </Space>
            </div>
          )
        })}
      </Flex>
    </div>
  )
}

export default UserStats
