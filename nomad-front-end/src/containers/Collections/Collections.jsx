import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import CollectionsTable from '../../components/CollectionsTable/CollectionsTable.jsx'
import classes from './Collections.module.css'
import { fetchCollections } from '../../store/actions/collections.js'

const Collections = props => {
  const { authToken, fetchData, data, loading } = props
  useEffect(() => {
    fetchData(authToken)
  }, [fetchData, authToken])

  return (
    <div className={classes.Container}>
      <CollectionsTable data={data} loading={loading} />
    </div>
  )
}

const mapStateToProps = state => ({
  data: state.collections.data,
  loading: state.collections.loading,
  authToken: state.auth.token
})

const mapDispatchToProps = dispatch => ({
  fetchData: token => dispatch(fetchCollections(token))
})

export default connect(mapStateToProps, mapDispatchToProps)(Collections)
