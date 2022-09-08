import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import socket from '../../socketConnection'

import InfoCards from '../../components/InfoCards/InfoCards'
import BookHoldersForm from '../../components/Forms/BookHoldersForm/BookHoldersForm'
import BookExperimentsForm from '../../components/Forms/BookExperimentsForm/BookExperimentsForm'
import {
  fetchInstrumentList,
  bookHolders,
  statusUpdate,
  fetchParamSets,
  cancelHolder,
  signOutHandler,
  cancelBookedHolders,
  bookExperiments,
  fetchGroupList,
  fetchUserList,
  clearBookedHolders,
  fetchAllowance
} from '../../store/actions'

const Submit = props => {
  const {
    fetchInstrList,
    fetchParamSets,
    authToken,
    accessLvl,
    instrList,
    reservedHolders,
    cancelBookedHoldersHandler,
    clrBookedHolders,
    logoutHandler,
    fetchGrpList
  } = props

  const priorityAccess = accessLvl === 'user-a' || accessLvl === 'admin'

  //Hook for socket.io to update status on InfoCards
  useEffect(() => {
    socket.on('statusUpdate', data => {
      props.statUpdate(data)
    })
    return () => {
      socket.removeAllListeners('statusUpdate')
    }
    // useEffect for socket.io function must have empty dependency array otherwise the triggers infinite loop!!!
    // eslint-disable-next-line
  }, [])

  //Clean up hook that cancels all booked holders after user leaves submit page.
  const reservedHoldersRef = useRef([])
  reservedHoldersRef.current = reservedHolders

  useEffect(() => {
    return () => {
      const keysArr = reservedHoldersRef.current.map(i => i.key)

      cancelBookedHoldersHandler(authToken, keysArr)

      //set bookedHolders in redux store to [] to reset the form
      clrBookedHolders()

      if (accessLvl !== 'admin' && authToken) {
        logoutHandler(authToken)
      }
    }
  }, [logoutHandler, clrBookedHolders, cancelBookedHoldersHandler, authToken, accessLvl])

  useEffect(() => {
    fetchInstrList(authToken)
    fetchParamSets(authToken, { instrumentId: null, searchValue: '' })
    if (accessLvl === 'admin') {
      fetchGrpList(authToken)
    }
  }, [fetchInstrList, fetchGrpList, accessLvl, fetchParamSets, authToken, reservedHolders])

  //form reference used to set instrument by clicking on cards
  const bookHoldersFormRef = useRef({})

  const [submittingUser, setSubmittingUser] = useState(undefined)

  const availableInstrList = priorityAccess ? instrList : instrList.filter(i => i.available)

  const onCardClick = key => {
    let instrId = key
    //Users without priority access level can't select unavailable instruments
    if (!priorityAccess && !props.statusSummary.find(card => card.key === key).available) {
      instrId = ''
    }
    bookHoldersFormRef.current.setFieldsValue({ instrumentId: instrId })
  }

  const submitHolders = values => {
    props.bookSlotsHandler(props.authToken, {
      instrumentId: values.instrumentId,
      count: values.count
    })
    setSubmittingUser(values.userId)
  }

  return (
    <div>
      <InfoCards cardsData={props.statusSummary} clicked={onCardClick} />
      <BookHoldersForm
        instruments={availableInstrList}
        formRef={bookHoldersFormRef}
        onSubmit={submitHolders}
        bookedCount={reservedHolders.length}
        token={props.authToken}
        accessLevel={props.accessLvl}
        groupList={props.grpList}
        onGrpChange={props.fetchUsrList}
        userList={props.usrList}
      />
      {reservedHolders.length !== 0 || props.loading ? (
        <BookExperimentsForm
          inputData={reservedHolders}
          loading={props.loading}
          paramSetsData={props.paramSets}
          onCancelHolder={props.cancelHolderHandler}
          token={props.authToken}
          accessLevel={props.accessLvl}
          bookExpsHandler={props.bookExpsHandler}
          submittingUserId={submittingUser}
          fetchAllowance={props.fetchAllow}
          allowanceData={props.allowance}
        />
      ) : null}
    </div>
  )
}

const mapStateToProps = state => {
  return {
    authToken: state.auth.token,
    accessLvl: state.auth.accessLevel,
    statusSummary: state.dash.statusSummaryData,
    instrList: state.instruments.instrumentList,
    paramSets: state.paramSets.paramSetsData,
    loading: state.submit.loading,
    reservedHolders: state.submit.bookedHolders,
    grpList: state.groups.groupList,
    usrList: state.users.userList,
    allowance: state.submit.allowance
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchInstrList: token => dispatch(fetchInstrumentList(token)),
    fetchGrpList: token => dispatch(fetchGroupList(token)),
    fetchUsrList: (token, groupId, showInactive) => dispatch(fetchUserList(token, groupId, showInactive)),
    bookSlotsHandler: (token, formData) => dispatch(bookHolders(token, formData)),
    statUpdate: data => dispatch(statusUpdate(data)),
    fetchParamSets: (token, searchParams) => dispatch(fetchParamSets(token, searchParams)),
    cancelHolderHandler: (token, key) => dispatch(cancelHolder(token, key)),
    logoutHandler: token => dispatch(signOutHandler(token)),
    cancelBookedHoldersHandler: (token, keys) => dispatch(cancelBookedHolders(token, keys)),
    bookExpsHandler: (token, data, user) => dispatch(bookExperiments(token, data, user)),
    clrBookedHolders: () => dispatch(clearBookedHolders()),
    fetchAllow: (token, instrIds) => dispatch(fetchAllowance(token, instrIds))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Submit)
