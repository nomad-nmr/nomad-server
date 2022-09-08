import React from 'react'
import { Select, Button, Input } from 'antd'

import classes from '../PageHeader.module.css'

const ParamSetControls = props => {
	const { Option } = Select
	const { Search } = Input

	const instrOptionArr = props.data.map(i => (
		<Option value={i.id} key={i.id}>
			{i.name}
		</Option>
	))
	instrOptionArr.unshift(
		<Option key='all' value={null}>
			All instruments
		</Option>
	)

	return (
		<div className={classes.ExtraContainer}>
			<Button
				className={classes.Button}
				type='primary'
				onClick={() => props.toggleForm(false)}
				disabled={props.formVisible}>
				Add
			</Button>
			<Select
				defaultValue={props.instrId}
				style={{ width: 140, marginLeft: '15px' }}
				onChange={props.setInstrId}>
				{instrOptionArr}
			</Select>
			<Search
				placeholder='search name'
				allowClear
				onSearch={props.searchHandler}
				style={{ width: 155, marginLeft: '15px' }}
				defaultValue={props.defSearchValue}
			/>
		</div>
	)
}

export default ParamSetControls
