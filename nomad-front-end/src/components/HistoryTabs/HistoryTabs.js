import React from 'react'
import { Tabs } from 'antd'

import HistoryTable from '../HistoryTabs/HistoryTable/HistoryTable'

// import classes from './StatusTabs.module.css'

const { TabPane } = Tabs

const historyTabs = props => {
	const TabsArr = props.tabsData.map((instr, index) => {
		return (
			<TabPane
				tab={<div style={{ fontSize: '1.2rem', padding: '0px 5px' }}>{instr.name}</div>}
				key={index}>
				<div>
					<HistoryTable data={props.tableData} loading={props.loading} />
				</div>
			</TabPane>
		)
	})

	return (
		<div style={{ margin: '20px 40px' }}>
			<Tabs
				tabBarGutter={15}
				activeKey={props.activeTab}
				animated={false}
				onChange={key => props.tabClicked(key)}
				centered>
				{TabsArr}
			</Tabs>
		</div>
	)
}

export default historyTabs
