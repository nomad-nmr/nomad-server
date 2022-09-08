import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, Row, Col, Button, Space, Divider, message } from 'antd'
import moment from 'moment'
// eslint-disable-next-line
import momentDurationFormatSetup from 'moment-duration-format'

const EditParamsModal = props => {
	const [form] = Form.useForm()

	const { defaultParams, customParams, sampleKey, expNo, paramSetName } = props.inputData

	useEffect(() => {
		if (props.reset) {
			const resetFieldsArr = [...customParams, ...defaultParams].map(param => [
				props.reset.toString(),
				param.name
			])
			form.resetFields(resetFieldsArr)
		}
	}, [props.reset, customParams, defaultParams, form])

	const [nsState, setNsState] = useState(null)
	const [d1State, setD1State] = useState(null)

	const calcExpTime = (key, value) => {
		const defaultParamsEntries = defaultParams.map(i => [i.name, i.value])
		const defParamsObj = Object.fromEntries(defaultParamsEntries)
		const { expt, td1, ds, ns, d1 } = defParamsObj
		if (!expt || !td1 || !ds || !ns || !d1) {
			return message.warning('Parameter/s for estimate experimental time calculation are not defined')
		}

		const exptUnit = moment.duration(expt) / (ns * td1 + ds) - d1 * 1000

		let currentNs = nsState ? nsState : ns
		let currentD1 = d1State ? d1State : d1

		switch (key) {
			case 'ns':
				currentNs = value ? value : ns
				setNsState(value)
				break
			case 'd1':
				currentD1 = value ? value : d1
				setD1State(value)
				break
			default:
				break
		}

		const newExpt = (exptUnit + currentD1 * 1000) * (currentNs * td1 + ds)
		const newExptString = moment.duration(newExpt).format('HH:mm:ss', {
			trim: false
		})

		form.setFieldsValue({ [sampleKey + '#' + expNo]: { expt: newExptString } })
	}

	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 }
	}

	return (
		<Modal
			title={`Edit Parameters - ${paramSetName}`}
			visible={props.visible}
			footer={null}
			onCancel={props.closeModal}>
			{customParams && (
				<Form {...layout} form={form} size='small' onFinish={props.onOkHandler}>
					<Row gutter={16}>
						<Col span={8}>
							<Form.Item
								label='expt'
								name={[sampleKey + '#' + expNo, 'expt']}
								initialValue={defaultParams[4].value}>
								<Input disabled />
							</Form.Item>
						</Col>
						<Col span={16}>
							<span>Experimental time</span>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col span={8}>
							<Form.Item
								label='ns'
								name={[sampleKey + '#' + expNo, 'ns']}
								rules={[
									{
										type: 'integer',
										message: 'ns has to be integer'
									}
								]}>
								<InputNumber
									min={0}
									placeholder={defaultParams[0].value}
									onChange={value => calcExpTime('ns', value)}
								/>
							</Form.Item>
						</Col>
						<Col span={16}>
							<span>Number of scans</span>
						</Col>
						<Col span={8}>
							<Form.Item
								label='d1'
								name={[sampleKey + '#' + expNo, 'd1']}
								rules={[
									{
										type: 'number',
										message: 'd1 has to be number'
									}
								]}>
								<InputNumber
									min={0}
									placeholder={defaultParams[1].value}
									onChange={value => calcExpTime('d1', value)}
								/>
							</Form.Item>
						</Col>
						<Col span={16}>
							<span>Relaxation delay [s]</span>
						</Col>
					</Row>
					{customParams &&
						customParams.map(i => {
							return (
								<Row gutter={16} key={i.name}>
									<Col span={8}>
										<Form.Item label={i.name} name={[sampleKey + '#' + expNo, i.name]}>
											<Input placeholder={i.value} />
										</Form.Item>
									</Col>
									<Col span={16}>
										<span>{i.comment}</span>
									</Col>
								</Row>
							)
						})}
					<Divider style={{ marginTop: 0 }} />
					<Row justify='center'>
						<Form.Item>
							<Space>
								<Button type='primary' size='middle' htmlType='submit'>
									OK
								</Button>
								<Button
									size='middle'
									onClick={() => {
										setNsState(null)
										setD1State(null)
										form.resetFields()
									}}>
									Reset
								</Button>
								<Button size='middle' onClick={props.closeModal}>
									Cancel
								</Button>
							</Space>
						</Form.Item>
					</Row>
				</Form>
			)}
		</Modal>
	)
}

export default EditParamsModal
