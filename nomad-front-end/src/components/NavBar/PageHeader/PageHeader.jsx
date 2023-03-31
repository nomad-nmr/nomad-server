import React from 'react'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { PageHeader } from '@ant-design/pro-layout'

import {
  toggleCards,
  openDashDrawer,
  toggleShowForm,
  toggleUserForm,
  toggleGroupForm,
  toggleShowInactive,
  toggleShowInactiveInstruments,
  toggleShowInactiveGroups,
  setExpHistoryDate,
  searchUser,
  setInstrumentId,
  searchParamSets,
  toggleParamsForm,
  toggleAddRack,
  closeRack,
  deleteRack,
  toggleAddSample,
  openAuthModal,
  toggleBookSamplesModal,
  submitSamples,
  cancelSamples,
  toggleDownloadModal,
  toggleSearchForm,
  fetchRepair,
  toggleCostingDrawer,
  fetchOverheadTime,
  fetchNMRiumData,
  saveNMRiumData,
  submitClaim,
  toggleShowArchivedSwitch
} from '../../../store/actions/index'

import classes from './PageHeader.module.css'

import BatchSubmitControls from './Controls/BatchSubmitControls'
import ExpHistControls from './Controls/ExpHistControls'
import ParamSetControls from './Controls/ParamSetControls'
import InstrumentsTabControls from './Controls/InstrumentsTabControls'
import GroupsTabControls from './Controls/GroupsTabControls'
import UsersTabControls from './Controls/UsersTabControls'
import DashControls from './Controls/DashControls'
import SearchControls from './Controls/SearchControls'
import AccountingControls from './Controls/AccountingControls'
import NMRiumControls from './Controls/NMRiumControls'
import ClaimControls from './Controls/ClaimControls'

import dashIcon from '../../../assets/dashboard.svg'
import userIcon from '../../../assets/user.svg'
import groupIcon from '../../../assets/group.svg'
import magnetIcon from '../../../assets/magnet.svg'
import experimentIcon from '../../../assets/lab.svg'
import historyIcon from '../../../assets/history-icon.webp'
import submitIcon from '../../../assets/submit.png'
import messageIcon from '../../../assets/email.png'
import batchSubmitIcon from '../../../assets/batch-submit.png'
import searchIcon from '../../../assets/loupe.svg'
import accountingIcon from '../../../assets/accounting.png'
import uploadIcon from '../../../assets/uploadIcon.png'

import { setAddingExpsStatus } from '../../../store/actions/nmrium'

const PageHeaderEl = props => {
  const {
    toggleCards,
    cardSwitchOn,
    statusButtonsData,
    statusButtonClicked,
    username,
    grpName,
    accessLevel,
    authToken
  } = props

  let headerTitle = ''
  let avatarSrc
  let extra = null

  const location = useLocation()

  switch (location.pathname) {
    case '/dashboard':
      headerTitle = 'Dashboard'
      avatarSrc = dashIcon
      extra = (
        <DashControls
          buttonsData={statusButtonsData}
          onButtonClick={statusButtonClicked}
          switchOn={cardSwitchOn}
          toggleCards={toggleCards}
        />
      )
      break

    case '/admin/users':
      headerTitle = 'Manage Users'
      avatarSrc = userIcon
      const usernameQuery = new URLSearchParams(location.search).get('username')
      extra = (
        <UsersTabControls
          toggleDrawer={props.toggleUsrDrawer}
          searchHandler={props.userSearchHandler}
          searchDefValue={usernameQuery ? usernameQuery : props.usrSearchValue}
          showInactive={props.showInactiveUsr}
          switchShowInactive={props.switchShowInactiveUsr}
          query={usernameQuery}
        />
      )
      break

    case '/admin/groups':
      headerTitle = 'Manage Groups'
      avatarSrc = groupIcon
      extra = (
        <GroupsTabControls
          formHandler={props.toggleGrpForm}
          formVisible={props.grpFormVisible}
          showInactive={props.showInactiveGrps}
          toggleShowInactive={props.toggleShowInactiveGrps}
        />
      )
      break

    case '/admin/message':
      headerTitle = 'Send Message'
      avatarSrc = messageIcon
      break

    case '/admin/instruments':
      headerTitle = 'Instruments Settings'
      avatarSrc = magnetIcon
      extra = (
        <InstrumentsTabControls
          formHandler={props.toggleInstForm}
          formVisible={props.instFormVisible}
          showInactive={props.showInactiveInst}
          toggleShowInactive={props.toggleShowInactiveInstr}
          toggleInstForm={props.toggleInstForm}
          overheadTimeData={props.overheadTimeCalc}
          fetchOverheadHandler={props.fetchOverhead}
          token={props.authToken}
        />
      )
      break

    case '/admin/parameter-sets':
      headerTitle = 'Parameter Sets'
      avatarSrc = experimentIcon
      extra = (
        <ParamSetControls
          data={props.instrList}
          toggleForm={props.tglParamsForm}
          formVisible={props.paramsFormVisible}
          instrId={props.instrId}
          setInstrId={props.setInstrId}
          searchHandler={props.paramSetSearchHandler}
          searchDefValue={props.paramsSearchValue}
        />
      )
      break

    case '/admin/history':
      headerTitle = 'Experiment History'
      avatarSrc = historyIcon
      extra = (
        <ExpHistControls
          dateHandler={props.setExpHistoryDate}
          instrId={props.selectedInstrId}
          token={props.authToken}
          fetchRepair={props.getRepair}
        />
      )
      break

    case '/submit':
      headerTitle = 'Book New Job'
      avatarSrc = submitIcon
      break

    case '/batch-submit':
      headerTitle = 'Batch Submit'
      avatarSrc = batchSubmitIcon
      extra = (
        <BatchSubmitControls
          user={{ username, accessLevel, authToken, grpName }}
          toggleAddRackModal={props.tglAddRack}
          toggleAddSample={props.tglAddSample}
          toggleBookSamples={props.toggleBookSamples}
          closeRackHandler={props.closeRackHandler}
          deleteRackHandler={props.deleteRackHandler}
          activeRackId={props.activeRackId}
          racksData={props.racksData}
          openAuthModal={props.openAuthModal}
          selectedSlots={props.slots}
          submitSamplesHandler={props.submitSamples}
          cancelSamplesHandler={props.cancelSamples}
        />
      )

      break

    case '/search':
      headerTitle = 'Search'
      avatarSrc = searchIcon
      extra = (
        <SearchControls
          searchCheckedState={props.checked}
          toggleModal={props.toggleDownloadMdl}
          token={props.authToken}
          toggleForm={props.tglSearchForm}
          dataType={props.dataType}
          fetchNMRium={props.fetchNMRium}
          addingToNMRium={props.adding}
        />
      )

      break

    case '/admin/accounts':
      headerTitle = 'Accounting'
      avatarSrc = accountingIcon
      extra = <AccountingControls toggleDrawer={props.tglCostingDrawer} />

      break

    case '/claim':
      headerTitle = 'Manual Claim'
      avatarSrc = uploadIcon
      extra = (
        <ClaimControls
          submitClaimHandler={props.submitClaim}
          token={props.authToken}
          checked={props.claimChecked}
          userId={props.claimUserId}
          instrumentId={props.claimInstrId}
          accessLevel={props.accessLevel}
          showArchived={props.showArchived}
          showArchivedHandler={props.tglShowArchived}
          claimId={props.claimId}
        />
      )

      break

    case '/nmrium':
      extra = (
        <NMRiumControls
          token={props.authToken}
          saveHandler={props.saveNMRium}
          addExpsHandler={props.setAddExps}
          data={props.nmriumData}
        />
      )
      break

    default:
      headerTitle = ''
      avatarSrc = ''
  }

  return (
    <PageHeader
      className={classes.PageHeader}
      title={headerTitle}
      avatar={location.pathname !== '/nmrium' && { src: avatarSrc }}
      extra={extra}
    />
  )
}

const mapStateToProps = state => {
  return {
    cardSwitchOn: state.dash.showCards,
    statusButtonsData: state.dash.statusButtonsData,
    instFormVisible: state.instruments.showForm,
    showInactiveUsr: state.users.showInactive,
    showInactiveInst: state.instruments.showInactive,
    grpFormVisible: state.groups.showForm,
    showInactiveGrps: state.groups.showInactive,
    instrList: state.instruments.instrumentList,
    overheadTimeCalc: state.instruments.overheadCalc,
    instrId: state.paramSets.instrumentId,
    paramsSearchValue: state.paramSets.searchValue,
    usrSearchValue: state.users.searchUserValue,
    paramsFormVisible: state.paramSets.formVisible,
    username: state.auth.username,
    grpName: state.auth.groupName,
    accessLevel: state.auth.accessLevel,
    authToken: state.auth.token,
    addRackModalVisible: state.batchSubmit.addRackVisible,
    activeRackId: state.batchSubmit.activeRackId,
    racksData: state.batchSubmit.racks,
    slots: state.batchSubmit.selectedSlots,
    checked: state.search.checked,
    dataType: state.search.dataType,
    selectedInstrId: state.expHistory.instrumentId,
    nmriumData: state.nmrium.changedData,
    adding: state.nmrium.adding,
    claimChecked: state.claim.checked,
    claimUserId: state.claim.userId,
    claimInstrId: state.claim.instrumentId,
    showArchived: state.claim.showArchived,
    claimId: state.claim.claimId
  }
}

const mapDispatchToProps = dispatch => {
  return {
    toggleCards: () => dispatch(toggleCards()),
    statusButtonClicked: id => dispatch(openDashDrawer(id)),
    toggleInstForm: editing => dispatch(toggleShowForm(editing)),
    toggleUsrDrawer: editing => dispatch(toggleUserForm(editing)),
    switchShowInactiveUsr: () => dispatch(toggleShowInactive()),
    toggleShowInactiveInstr: () => dispatch(toggleShowInactiveInstruments()),
    toggleGrpForm: editing => dispatch(toggleGroupForm(editing)),
    toggleShowInactiveGrps: () => dispatch(toggleShowInactiveGroups()),
    setExpHistoryDate: date => dispatch(setExpHistoryDate(date)),
    userSearchHandler: value => dispatch(searchUser(value)),
    setInstrId: id => dispatch(setInstrumentId(id)),
    paramSetSearchHandler: value => dispatch(searchParamSets(value)),
    tglParamsForm: editing => dispatch(toggleParamsForm(editing)),
    tglAddRack: () => dispatch(toggleAddRack()),
    closeRackHandler: (rackId, token) => dispatch(closeRack(rackId, token)),
    deleteRackHandler: (rackId, token) => dispatch(deleteRack(rackId, token)),
    tglAddSample: () => dispatch(toggleAddSample()),
    openAuthModal: () => dispatch(openAuthModal()),
    toggleBookSamples: () => dispatch(toggleBookSamplesModal()),
    submitSamples: (data, token) => dispatch(submitSamples(data, token)),
    cancelSamples: (data, token) => dispatch(cancelSamples(data, token)),
    toggleDownloadMdl: () => dispatch(toggleDownloadModal()),
    tglSearchForm: payload => dispatch(toggleSearchForm(payload)),
    getRepair: (instrId, token) => dispatch(fetchRepair(instrId, token)),
    tglCostingDrawer: () => dispatch(toggleCostingDrawer()),
    fetchOverhead: (instrId, token) => dispatch(fetchOverheadTime(instrId, token)),
    fetchNMRium: (expsArr, authToken, dataType) =>
      dispatch(fetchNMRiumData(expsArr, authToken, dataType)),
    saveNMRium: (dataJSON, authToken) => dispatch(saveNMRiumData(dataJSON, authToken)),
    setAddExps: () => dispatch(setAddingExpsStatus()),
    submitClaim: (token, payload) => dispatch(submitClaim(token, payload)),
    tglShowArchived: () => dispatch(toggleShowArchivedSwitch())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PageHeaderEl)
