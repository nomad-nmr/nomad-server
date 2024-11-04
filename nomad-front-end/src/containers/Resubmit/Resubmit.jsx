import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import BookExperimentsForm from '../../components/Forms/BookExperimentsForm/BookExperimentsForm'

import {
  fetchParamSets,
  fetchAllowance,
  bookExperiments,
  resetResubmit,
  signOutHandler
} from '../../store/actions'

const Resubmit = props => {
  const { reservedHolders, formValues, userId } = props.resubmitData
  const { fetchParamSets, authToken, allowance, accessLvl, logoutHandler } = props

  useEffect(() => {
    return () => {
      props.resetState()

      if (accessLvl !== 'admin' && authToken) {
        logoutHandler(authToken)
      }
    }
  }, [])

  useEffect(() => {
    fetchParamSets(authToken, { instrumentId: null, searchValue: '' })
  }, [fetchParamSets, authToken])

  return (
    <div>
      {reservedHolders.length !== 0 || props.loading ? (
        <BookExperimentsForm
          inputData={reservedHolders}
          loading={props.loading}
          accessLevel={accessLvl}
          token={authToken}
          paramSetsData={props.paramSets}
          fetchAllowance={props.fetchAllow}
          allowanceData={allowance}
          formValues={formValues}
          bookExpsHandler={props.bookExpsHandler}
          submittingUserId={userId}
        />
      ) : null}
    </div>
  )
}

const mapStateToProps = state => ({
  resubmitData: state.submit.resubmitData,
  loading: state.submit.loading,
  accessLvl: state.auth.accessLevel,
  authToken: state.auth.token,
  paramSets: state.paramSets.paramSetsData,
  allowance: state.submit.allowance
})

const mapDispatchToProps = dispatch => {
  return {
    fetchParamSets: (token, searchParams) => dispatch(fetchParamSets(token, searchParams)),
    fetchAllow: (token, instrIds) => dispatch(fetchAllowance(token, instrIds)),
    bookExpsHandler: (token, data, user) => dispatch(bookExperiments(token, data, user)),
    resetState: () => dispatch(resetResubmit()),
    logoutHandler: token => dispatch(signOutHandler(token))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Resubmit)
