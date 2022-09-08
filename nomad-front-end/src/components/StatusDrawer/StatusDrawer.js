import React, { useState } from 'react'
import { Drawer, Button, Row, Col, message } from 'antd'
import { connect } from 'react-redux'

import DrawerTable from './DrawerTable/DrawerTable'
import SubmitModal from '../Modals/SubmitModal/SubmitModal'
import { postPending, signOutHandler, postPendingAuth } from '../../store/actions'

const StatusDrawer = props => {
	const { id, visible, tableData, dataLoading } = props.status
	const { pendingHandler, authToken, selectedHolders, accessLvl } = props

	const [modalVisible, setModalVisible] = useState(false)
	const [modalData, setModalData] = useState({})

	let title = ''
	let buttons = null
	const headerClass = {
		textAlign: 'center',
		backgroundColor: '',
		borderBottom: '2px solid'
	}

	const btnClickHandler = type => {
		if (selectedHolders.length === 0) {
			return message.warning('No holders selected!')
		}
		if (authToken) {
			pendingHandler(authToken, type, selectedHolders)
			if (accessLvl !== 'admin') {
				props.logoutHandler(authToken)
			}
		} else {
			const usernames = new Set()
			selectedHolders.map(row => usernames.add(row.username))
			if (usernames.size !== 1) {
				return message.error('Holders for multiple user selected!')
			}
			setModalData({ username: usernames.values().next().value, type, holders: selectedHolders })

			setModalVisible(true)
		}
	}

	switch (id) {
		case 'errors':
			title = 'Errors'
			headerClass.backgroundColor = '#ffccc7'
			headerClass.borderBottom += '#f5222d'
			break
		case 'running':
			title = 'Running Experiments'
			headerClass.backgroundColor = '#bae7ff'
			headerClass.borderBottom += '#1890ff'
			break
		case 'pending':
			title = 'Pending Holders'
			headerClass.backgroundColor = '#ffffb8'
			headerClass.borderBottom += '#fadb14'
			buttons = (
				<Row>
					<Col span={2} style={{ textAlign: 'left' }}>
						<Button onClick={() => btnClickHandler('delete')}>Cancel Selected</Button>
					</Col>
					<Col span={20} style={{ textAlign: 'center' }}>
						<Button type='primary' onClick={() => btnClickHandler('submit')}>
							Submit
						</Button>
					</Col>
				</Row>
			)
			break
		default:
			title = ''
	}

	return (
		<>
			<Drawer
				title={title}
				placement='top'
				closable={true}
				mask={true}
				keyboard
				height='auto'
				visible={visible}
				onClose={props.closeClicked}
				headerStyle={headerClass}>
				<DrawerTable id={id} data={tableData} loading={dataLoading} drawerVisible={visible} />
				<div style={{ textAlign: 'center', marginTop: 20 }}>{buttons}</div>
			</Drawer>
			{/* Forcing modal to re-render after modalVisible set true to pick up updated modalData state} */}
			{modalVisible && (
				<SubmitModal
					visible={true}
					setVisible={setModalVisible}
					data={modalData}
					finishHandler={props.pendingAuthHandler}
				/>
			)}
		</>
	)
}

const mapStateToProps = state => {
	return {
		username: state.auth.username,
		accessLvl: state.auth.accessLevel,
		authToken: state.auth.token,
		selectedHolders: state.dash.drawerState.pendingChecked
	}
}

const mapDispatchToProps = dispatch => {
	return {
		pendingHandler: (token, type, data) => dispatch(postPending(token, type, data)),
		pendingAuthHandler: (type, data) => dispatch(postPendingAuth(type, data)),
		logoutHandler: token => dispatch(signOutHandler(token))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusDrawer)
