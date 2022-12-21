import React from 'react'
import { Tabs } from 'antd'

import RackTable from './RackTable/RackTable'

const RackTabs = props => {
  const { data, activeTabId, setActiveTabId } = props

  const items = data.map(rack => {
    const fontColor = rack.isOpen ? '#52c41a' : '#fa8c16'
    return {
      label: (
        <div style={{ fontSize: '1rem', color: fontColor, padding: '0px 5px' }}>{rack.title}</div>
      ),
      key: rack._id,
      children: <RackTable rackData={rack} />
    }
  })

  return (
    <div style={{ margin: '20px 40px' }}>
      <Tabs
        tabBarGutter={15}
        activeKey={activeTabId}
        animated={false}
        centered
        onChange={activeKey => setActiveTabId(activeKey)}
        items={items}
      />
    </div>
  )
}

export default RackTabs
