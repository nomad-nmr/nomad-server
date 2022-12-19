import React, { Fragment, useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'

import {
	fetchStatusSummary,
	fetchStatusTable,
	closeDashDrawer,
	statusUpdate,
	toggleAvailableSwitchSuccess
} from '../../store/actions'
import socket from '../../socketConnection'

import Animate from 'rc-animate'
import InfoCards from '../../components/InfoCards/InfoCards'
import StatusTabs from '../../components/StatusTabs/StatusTabs'
import StatusDrawer from '../../components/StatusDrawer/StatusDrawer'
import './Dashboard.css'

const Dashboard = props => {
	const [activeTab, setActiveTab] = useState('0')
	const { fetchStatusSum, fetchStatusTable, statusSummary } = props

	const activeTabIdRef = useRef(null)

	useEffect(() => {
		window.scrollTo(0, 0)
		fetchStatusSum()
		fetchStatusTable('0')
	}, [fetchStatusSum, fetchStatusTable])

	//Hook sets active tab to 1st instrument in the array when the page get reloaded
	useEffect(() => {
		if (activeTab === '0' && statusSummary.length > 0) {
			setActiveTab(statusSummary[0].key)
		}
	}, [activeTab, statusSummary])

	//Hook creates reference to instrument ID in activeTab and activeTab index value that is used in subsequent hook to reload the active tab if it gets updated.
	useEffect(() => {
		if (props.statusSummary.length > 0) {
			activeTabIdRef.current = {
				// instrId: props.statusSummary[activeTab]._id,
				instrId: activeTab,
				activeTab
			}
		}
	}, [props.statusSummary, activeTab])

	//Hook for socket.io that gets triggered when status of an instrument is updated by tracker at the backend
	useEffect(() => {
		socket.on('statusUpdate', data => {
			props.statUpdate(data)
			const { instrId, activeTab } = activeTabIdRef.current
			if (instrId === data.instrId) {
				fetchStatusTable(activeTab)
			}
		})

		socket.on('availableUpdate', data => {
			props.toggleAvailableSuccess(data)
		})
		return () => {
			socket.removeAllListeners('statusUpdate')
		}
		// useEffect for socket.io function must have empty dependency array otherwise the triggers infinite loop!!!
		// eslint-disable-next-line
	}, [])

	const tabChangeHandler = key => {
		fetchStatusTable(key)
		setActiveTab(key)
	}

	return (
		<Fragment>
			<Animate transitionName='fade-cards'>
				{props.showCards ? (
					<InfoCards cardsData={props.statusSummary} clicked={tabChangeHandler} />
				) : null}
			</Animate>
			<div>
				<StatusTabs
					activeTab={activeTab}
					summaryData={props.statusSummary}
					tableData={props.statusTable}
					clicked={tabChangeHandler}
					tableLoading={props.tableLoading}
				/>
			</div>
			<StatusDrawer status={props.drawerState} closeClicked={props.onCloseDrawer} />
		</Fragment>
	)
}

const mapStateToProps = state => {
	return {
		showCards: state.dash.showCards,
		statusSummary: state.dash.statusSummaryData,
		statusTable: state.dash.statusTableData,
		tableLoading: state.dash.tableLoading,
		drawerState: state.dash.drawerState,
		accessLevel: state.auth.accessLevel,
		authToken: state.auth.token,
		username: state.auth.username
	}
}

const mapDispatchToProps = dispatch => {
	return {
		fetchStatusSum: () => dispatch(fetchStatusSummary()),
		onCloseDrawer: () => dispatch(closeDashDrawer()),
		fetchStatusTable: key => dispatch(fetchStatusTable(key)),
		statUpdate: data => dispatch(statusUpdate(data)),
		toggleAvailableSuccess: payload => dispatch(toggleAvailableSwitchSuccess(payload))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
