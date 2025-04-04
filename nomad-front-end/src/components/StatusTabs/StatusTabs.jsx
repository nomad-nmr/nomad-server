import React from 'react'
import { Tabs } from 'antd'

import StatusBanner from './StatusBanner/StatusBanner'
import StatusTable from './StatusTable/StatusTable'

import classes from './StatusTabs.module.css'

const statusTabs = props => {
  const items = props.summaryData.map(tab => {
    const fontColor = tab.available ? '#52c41a' : tab.rackOpen ? '#fadb14' : '#f5222d'
    return {
      label: (
        <div style={{ fontSize: '1.2rem', color: fontColor, padding: '0px 5px' }}>{tab.name}</div>
      ),
      key: tab.key,
      children: (
        <div>
          <StatusBanner data={tab} instrId={props.activeTab} />
          <div className={classes.StatusTable}>
            <StatusTable data={props.tableData} loading={props.tableLoading} />
          </div>
        </div>
      )
    }
  })

  return (
    <Tabs
      className={classes.StatusTabs}
      tabBarGutter={15}
      activeKey={props.activeTab}
      animated={false}
      onChange={key => props.clicked(key)}
      centered
      items={items}
    />
  )
}

export default statusTabs
