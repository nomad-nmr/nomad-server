import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { fetchClaims, patchClaims } from '../../store/actions'

import ClaimsHistoryTable from '../../components/ClaimsHistoryTable/ClaimsHistoryTable'
import AmendClaim from '../../components/Modals/AmendClaim/AmendClaim'

const ClaimsHistory = props => {
  const { authToken } = props

  const [showModal, setShowModal] = useState(false)
  const formRef = useRef({})

  useEffect(() => {
    props.fetchClaims(authToken)
  }, [])

  const amendHandler = values => {
    setShowModal(true)
    //setting 200ms delay to allow for form getting rendered in the modal
    setTimeout(() => formRef.current.setFieldsValue(values), 200)
  }

  return (
    <div style={{ margin: '30px 50px 20px 50px' }}>
      <ClaimsHistoryTable data={props.data} onAmend={amendHandler} />
      <AmendClaim
        closeModalHandler={() => setShowModal(false)}
        open={showModal}
        formReference={formRef}
        updateClaimHandler={props.patchClaims}
        token={authToken}
      />
    </div>
  )
}

const mapStateToProps = state => ({
  authToken: state.auth.token,
  data: state.claimsHistory.data
})

const mapDispatchToProps = dispatch => {
  return {
    fetchClaims: token => dispatch(fetchClaims(token)),
    patchClaims: (token, payload) => dispatch(patchClaims(token, payload))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClaimsHistory)
