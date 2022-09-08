import React from 'react'
import { Modal, Form, Input, Button, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const SubmitModal = props => {
	const [form] = Form.useForm()

	const cancelModal = () => {
		props.setVisible(false)
		form.resetFields()
	}

	return (
		<Modal
			visible={props.visible}
			width='300px'
			okText='Continue'
			keyboard
			footer={null}
			onCancel={cancelModal}
			title={
				<div style={{ color: '#096dd9' }}>
					<UserOutlined />
					<span style={{ marginLeft: '10px' }}>Sign In</span>
				</div>
			}>
			<Form
				form={form}
				onFinish={values => {
					props.finishHandler(props.data.type, { ...values, holders: props.data.holders })
					cancelModal()
				}}>
				<Form.Item name='username' initialValue={props.data.username}>
					<Input disabled prefix={<UserOutlined className='site-form-item-icon' />} />
				</Form.Item>
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
				<Form.Item style={{ textAlign: 'center' }}>
					<Space size='large'>
						<Button type='primary' htmlType='submit'>
							Submit
						</Button>
						<Button onClick={cancelModal}>Cancel</Button>
					</Space>
				</Form.Item>
			</Form>
		</Modal>
	)
}

export default SubmitModal
