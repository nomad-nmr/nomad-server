import React from 'react'
import { Form, Input } from 'antd'

const TitleInput = props => {
	return (
		<Form.Item
			name={[props.nameKey, 'title']}
			rules={[
				{
					required: true,
					whitespace: true,

					message: 'Title is required'
				},
				{ min: 5, message: 'Title must have minimum 5 characters' }
			]}>
			<Input />
		</Form.Item>
	)
}

export default TitleInput
