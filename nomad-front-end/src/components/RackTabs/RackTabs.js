import React from 'react'
import { Tabs } from 'antd'

import RackTable from './RackTable/RackTable'

const { TabPane } = Tabs

const RackTabs = props => {
	const { data, activeTabId, setActiveTabId } = props

	const racksTabArr = data.map(rack => {
		const fontColor = rack.isOpen ? '#52c41a' : '#fa8c16'
		return (
			<TabPane
				tab={<div style={{ fontSize: '1rem', color: fontColor, padding: '0px 5px' }}>{rack.title}</div>}
				key={rack._id}>
				<div>
					<RackTable rackData={rack} />
				</div>
			</TabPane>
		)
	})
	return (
		<div style={{ margin: '20px 40px' }}>
			<Tabs
				tabBarGutter={15}
				activeKey={activeTabId}
				animated={false}
				centered
				onChange={activeKey => setActiveTabId(activeKey)}>
				{racksTabArr}
			</Tabs>
		</div>
	)
}

export default RackTabs
