import React, { useState } from 'react'

import { Modal, Form, Input, Spin, Button, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const LoginModal = props => {
	const [form] = Form.useForm()

	const [resetting, setResetting] = useState(false)

	const onFinish = values => {
		if (resetting) {
			props.passwdResetHandler(values)
		} else {
			props.signInHandler(values)
		}
	}

	const passwordFormItem = (
		<Form.Item
			name='password'
			rules={[
				{
					required: true,
					message: 'Please input your password!'
				}
			]}>
			<Input.Password
				prefix={<LockOutlined className='site-form-item-icon' />}
				type='password'
				placeholder='Password'
			/>
		</Form.Item>
	)

	return (
		<Modal
			width='300px'
			okText='Sign in'
			title={
				<div style={{ color: '#096dd9' }}>
					<UserOutlined />
					<span style={{ marginLeft: '10px' }}>{resetting ? 'Reset Password' : 'Sign In'}</span>
				</div>
			}
			visible={props.visible}
			keyboard
			onCancel={props.cancelClicked}
			footer={null}>
			<Spin tip='Loading ...' spinning={props.loading}>
				<Form form={form} onFinish={values => onFinish(values)} hideRequiredMark>
					<Form.Item
						name='username'
						rules={[
							{
								required: true,
								message: 'Please input your username!'
							}
						]}>
						<Input prefix={<UserOutlined className='site-form-item-icon' />} placeholder='Username' />
					</Form.Item>

					{!resetting && passwordFormItem}

					<Form.Item style={{ textAlign: 'center' }}>
						<Space size='large'>
							<Button type='primary' htmlType='submit'>
								Submit
							</Button>
							<Button onClick={props.cancelClicked}>Cancel</Button>
						</Space>
					</Form.Item>
					<div style={{ textAlign: 'center' }}>
						<Button type='link' onClick={() => setResetting(!resetting)}>
							{resetting ? 'Sign in' : 'Reset password'}
						</Button>
					</div>
				</Form>
			</Spin>
		</Modal>
	)
}

export default LoginModal
