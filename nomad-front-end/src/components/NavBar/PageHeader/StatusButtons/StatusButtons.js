import React from 'react'
import { Avatar, Badge, Tooltip } from 'antd'
import TweenOne from 'rc-tween-one'
import { CaretRightOutlined, DownOutlined, ExclamationOutlined } from '@ant-design/icons'
import classes from './StatusButtons.module.css'

const statusButtons = props => {
	//props.data (statusButtonsData) is array of arrays [type, count]
	const buttonsArr = props.data.map((button, index) => {
		let badgeBackground = ''
		let icon
		let tooltipText = ''
		let animationObj = null
		const assignedClasses = [classes.Button]

		if (button[1] !== 0 && button[0] !== 'running') {
			animationObj = {
				opacity: 0.3,
				yoyo: true,
				repeat: -1,
				duration: 500,
				delay: 250 * index
			}
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
					<TweenOne animation={animationObj}>
						<Avatar
							shape='square'
							size='medium'
							icon={icon}
							className={assignedClasses.join(' ')}
							onClick={button[1] !== 0 ? () => props.click(button[0]) : null}
						/>
					</TweenOne>
				</Badge>
			</Tooltip>
		)
	})
	return <div className={classes.StatusButtons}>{buttonsArr}</div>
}

export default statusButtons
