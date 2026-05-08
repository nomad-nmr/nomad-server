import React from 'react'
import { Flex, Statistic, Space, Popover } from 'antd'

import { QuestionCircleOutlined } from '@ant-design/icons'

const UserStats = props => {
  return (
    <div>
      <Flex justify='space-around' align='center'>
        {props.data.map((item, index) => (
          <div key={index}>
            <Space>
              <Statistic
                title={item.title}
                value={item.value}
                suffix={item.title === 'NMRium Utilisation' ? '%' : undefined}
              />
              {item.title === 'NMRium Utilisation' && (
                <Popover
                  content={
                    <div>
                      <p>This is the percentage of active users who more often open </p>
                      <p>spectra in NMRium than download data to use another software.</p>
                    </div>
                  }
                  title={item.title}
                  placement='left'
                >
                  <QuestionCircleOutlined />
                </Popover>
              )}
            </Space>
          </div>
        ))}
      </Flex>
    </div>
  )
}

export default UserStats
