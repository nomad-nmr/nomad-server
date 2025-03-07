import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Spin } from 'antd'

import RackTabs from '../../components/RackTabs/RackTabs'
import AddRackModal from '../../components/Modals/AddRackModal/AddRackModal'
import AddSampleDrawer from '../../components/BatchSubmitComponents/AddSampleDrawer/AddSampleDrawer'
import BookSamplesModal from '../../components/Modals/BookSamplesModal/BookSamplesModal'
import EditSampleModal from '../../components/BatchSubmitComponents/EditSampleModal/EditSampleModal'

import {
  addRack,
  fetchGroupList,
  fetchParamSets,
  toggleAddRack,
  getRacks,
  setActiveRackId,
  toggleAddSample,
  signOutHandler,
  addSample,
  toggleBookSamplesModal,
  fetchInstrumentList,
  bookSamples,
  fetchUserList
} from '../../store/actions'

const BatchSubmit = props => {
  const {
    fetchGrpList,
    fetchInstrList,
    authToken,
    accessLevel,
    username,
    fetchRacks,
    racksData,
    setActiveTabId,
    activeTabId,
    fetchParamSets,
    addSampleVis,
    grpName
  } = props

  const user = { username, accessLevel, authToken }
  const activeRack = racksData.find(rack => rack._id === props.activeTabId)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState({})

  useEffect(() => {
    if (authToken && (accessLevel === 'admin' || accessLevel === 'admin-b')) {
      fetchGrpList(authToken)
      fetchInstrList(authToken)
    }
  }, [])

  useEffect(() => {
    if (authToken && activeRack && addSampleVis) {
      fetchParamSets(authToken, {
        instrumentId: activeRack.instrument ? activeRack.instrument : null,
        searchValue: '',
        list: false
      })
    }
  }, [addSampleVis])

  //Racks data are getting fetch if the tab changes in order to get updated status
  useEffect(() => {
    window.scrollTo(0, 0)
    fetchRacks()
  }, [fetchRacks, activeTabId])

  //Hook setting active tabId when tabs are reloaded
  useEffect(() => {
    if (!activeTabId && racksData.length > 0) {
      setActiveTabId(racksData[0]._id)
    }
  }, [racksData, activeTabId, setActiveTabId])

  let filteredRacks = []

  if (!authToken) {
    filteredRacks = racksData.filter(rack => rack.isOpen)
  } else {
    switch (accessLevel) {
      case 'admin':
        filteredRacks = [...racksData]
        break

      case 'admin-b':
        filteredRacks = racksData.filter(rack => {
          if (rack.accessList.length === 0) {
            return true
          } else {
            return (
              rack.accessList.some(i => i.type === 'group' && i.name === grpName) ||
              rack.accessList.some(i => i.type === 'user' && i.name === username)
            )
          }
        })
        break

      case 'user-b':
        filteredRacks = racksData.filter(rack => {
          if (rack.rackType === 'Instrument') {
            return false
          } else if (rack.isOpen && rack.group.groupName === grpName) {
            return true
          } else {
            return false
          }
        })
        break
      case 'user':
        filteredRacks = racksData.filter(rack => {
          if (rack.rackType === 'Group' || rack.isOpen === false) {
            return false
          } else {
            if (rack.accessList.length === 0) {
              return true
            } else {
              return (
                rack.accessList.some(i => i.type === 'group' && i.name === grpName) ||
                rack.accessList.some(i => i.type === 'user' && i.name === username)
              )
            }
          }
        })

        break

      default:
        break
    }
  }

  // setting error that disables user-b to add sample to a rack that does not belong to his group

  let drawerError = false
  if (accessLevel !== null && accessLevel !== 'admin' && accessLevel !== 'admin-b' && activeRack) {
    if (activeRack.group) {
      drawerError = activeRack.group.groupName !== props.grpName
    } else {
      drawerError = accessLevel === 'user-b'
    }
  }

  const entryEditHandler = data => {
    setModalData(data)
    setModalOpen(true)
  }

  return (
    <div>
      <Spin size='large' spinning={props.loading}>
        {filteredRacks.length === 0 ? (
          <h1 style={{ marginTop: 30 }}>No Racks Open</h1>
        ) : (
          <RackTabs
            data={filteredRacks}
            setActiveTabId={setActiveTabId}
            activeTabId={activeTabId}
            editHandler={entryEditHandler}
          />
        )}
      </Spin>

      <AddRackModal
        visible={props.addRackVis}
        toggleHandler={props.tglAddRack}
        groupList={props.grpList}
        onSubmit={props.addRackHandler}
        token={authToken}
        instruments={props.instrList}
        userList={props.usrList}
        onGrpChange={props.fetchUsrList}
      />
      <BookSamplesModal
        visible={props.bookSamplesVisible}
        toggleHandler={props.toggleBookSamples}
        instruments={props.instrList}
        rackData={{ rackId: props.activeTabId, slots: props.selectedSlots }}
        token={authToken}
        submitBookingData={props.bookSamples}
      />
      <AddSampleDrawer
        visible={username && addSampleVis}
        toggleHandler={props.tglAddSample}
        rackTitle={activeRack && activeRack.title}
        error={drawerError}
        user={user}
        signOutHandler={props.logOutHandler}
        paramSets={props.paramSetsList}
        activeRackId={activeTabId}
        onAddSample={props.addSampleHandler}
        editParams={activeRack && activeRack.editParams}
        rackType={activeRack && activeRack.rackType}
      />
      <EditSampleModal
        open={modalOpen}
        toggleModal={setModalOpen}
        user={{ username, accessLevel }}
        paramSets={props.paramSetsList}
        data={modalData}
        editParams={activeRack && activeRack.editParams}
      />
    </div>
  )
}

const mapStateToProps = state => {
  return {
    addRackVis: state.batchSubmit.addRackVisible,
    addSampleVis: state.batchSubmit.addSampleVisible,
    grpList: state.groups.groupList,
    racksData: state.batchSubmit.racks,
    activeTabId: state.batchSubmit.activeRackId,
    username: state.auth.username,
    authToken: state.auth.token,
    accessLevel: state.auth.accessLevel,
    grpName: state.auth.groupName,
    paramSetsList: state.paramSets.paramSetsData,
    instrList: state.instruments.instrumentList,
    loading: state.batchSubmit.loading,
    bookSamplesVisible: state.batchSubmit.bookSamplesVisible,
    selectedSlots: state.batchSubmit.selectedSlots,
    usrList: state.users.userList
  }
}

const mapDispatchToProps = dispatch => {
  return {
    tglAddRack: () => dispatch(toggleAddRack()),
    tglAddSample: () => dispatch(toggleAddSample()),
    fetchGrpList: token => dispatch(fetchGroupList(token)),
    addRackHandler: (data, token) => dispatch(addRack(data, token)),
    fetchRacks: () => dispatch(getRacks()),
    setActiveTabId: id => dispatch(setActiveRackId(id)),
    logOutHandler: token => dispatch(signOutHandler(token)),
    fetchParamSets: (token, searchParams) => dispatch(fetchParamSets(token, searchParams)),
    addSampleHandler: (data, rackId, token) => dispatch(addSample(data, rackId, token)),
    toggleBookSamples: () => dispatch(toggleBookSamplesModal()),
    fetchInstrList: token => dispatch(fetchInstrumentList(token)),
    bookSamples: (data, token) => dispatch(bookSamples(data, token)),
    fetchUsrList: (token, groupId, showInactive, search) =>
      dispatch(fetchUserList(token, groupId, showInactive, search))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchSubmit)
