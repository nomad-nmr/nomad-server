import React from 'react'
import { Button, Switch } from 'antd'

import classes from '../PageHeader.module.css'

const InstrumentsTabControls = props => {
	return (
		<div className={classes.ExtraContainer}>
			<Button
				className={classes.Button}
				type='primary'
				onClick={() => props.toggleInstForm(false)}
				disabled={props.formVisible}>
				Add
			</Button>
			<div className={classes.SwitchElement}>
				<label>Show Inactive</label>
				<Switch
					size='small'
					checked={props.showInactive}
					checkedChildren='On'
					unCheckedChildren='Off'
					onChange={props.toggleShowInactive}
				/>
			</div>
		</div>
	)
}

export default InstrumentsTabControls
