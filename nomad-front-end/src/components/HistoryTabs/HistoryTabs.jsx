import React from 'react'
import { Tabs } from 'antd'

import HistoryTable from './HistoryTable/HistoryTable'

const historyTabs = props => {
  const items = props.tabsData.map((instr, index) => ({
    label: <div style={{ fontSize: '1.2rem', padding: '0px 5px' }}>{instr.name}</div>,
    key: index,
    children: <HistoryTable data={props.tableData} loading={props.loading} />
  }))

  return (
    <div style={{ margin: '20px 40px' }}>
      <Tabs
        tabBarGutter={15}
        activeKey={props.activeTab}
        animated={false}
        onChange={key => props.tabClicked(key)}
        centered
        items={items}
      />
    </div>
  )
}

export default historyTabs
