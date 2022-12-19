import React from 'react'
import { Select, Form } from 'antd'

import solvents from '../../../../misc/solvents'

const { Option } = Select

const SolventSelect = props => {
	return (
		<Form.Item
			name={[props.nameKey, 'solvent']}
			rules={[
				{
					required: true,
					message: 'Solvent is required'
				}
			]}>
			<Select>
				{solvents.map((solvent, i) => (
					<Option value={solvent} key={i}>
						{solvent}
					</Option>
				))}
			</Select>
		</Form.Item>
	)
}

export default SolventSelect
