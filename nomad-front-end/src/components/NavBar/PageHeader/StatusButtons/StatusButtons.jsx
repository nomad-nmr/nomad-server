import React from 'react'
import { Avatar, Badge, Tooltip } from 'antd'
import { CaretRightOutlined, DownOutlined, ExclamationOutlined } from '@ant-design/icons'
import classes from './StatusButtons.module.css'

const statusButtons = props => {
	//props.data (statusButtonsData) is array of arrays [type, count]
	const buttonsArr = props.data.map((button, index) => {
		let badgeBackground = ''
		let icon
		let tooltipText = ''
		const assignedClasses = [classes.Button]
		let pulseStyle = null

		if (button[1] !== 0 && button[0] !== 'running') {
			assignedClasses.push(classes.Pulsing)
			pulseStyle = { animationDelay: `${250 * index}ms` }
		}

		if (button[1] !== 0) {
			assignedClasses.push(classes.Active)
		}

		switch (button[0]) {
			case 'running':
				badgeBackground = '#1890ff'
				icon = <CaretRightOutlined />
				assignedClasses.push(classes.Running)
				tooltipText = 'Running Experiments'
				break
			case 'errors':
				badgeBackground = '#ff4d4f'
				icon = <ExclamationOutlined />
				assignedClasses.push(classes.Errors)
				tooltipText = 'Errors'
				break
			case 'pending':
				badgeBackground = '#fadb14'
				icon = <DownOutlined />
				assignedClasses.push(classes.Pending)
				tooltipText = 'Pending Experiments'
				break
			default:
				badgeBackground = ''
				icon = null
		}

		return (
			<Tooltip key={button[0]} placement='bottom' title={tooltipText}>
				<Badge count={button[1]} offset={[-12, 2]} style={{ backgroundColor: badgeBackground }}>
					<Avatar
						shape='square'
						size='medium'
						icon={icon}
						style={pulseStyle}
						className={assignedClasses.join(' ')}
						onClick={button[1] !== 0 ? () => props.click(button[0]) : null}
					/>
				</Badge>
			</Tooltip>
		)
	})
	return <div className={classes.StatusButtons}>{buttonsArr}</div>
}

export default statusButtons
