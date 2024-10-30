import React, { useState, Suspense, useEffect } from 'react'
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  closeAuthModal,
  signInHandler,
  signOutHandler,
  authCheckState,
  postPasswdReset
} from './store/actions'

import { Layout, Spin, Affix, FloatButton } from 'antd'
import classes from './App.module.css'

import AdminMenu from './components/AdminMenu/AdminMenu'
import NavBar from './components/NavBar/NavBar'
import LoginModal from './components/Modals/LoginModal/LoginModal'
import LogoutModal from './components/Modals/LogoutModal/LogoutModal'
import Dashboard from './containers/Dashboard/Dashboard'
import Error500 from './components/Errors/Error500'
import Error404 from './components/Errors/Error404'
import Error403 from './components/Errors/Error403'
import Credits from './components/Credits/Credits'
import Reset from './containers/Reset/Reset'
import Resubmit from './containers/Resubmit/Resubmit'

const { Header, Sider, Content, Footer } = Layout

const App = props => {
  const [adminMenuCollapsed, setAdminMenuCollapsed] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const toggleAdminMenu = () => {
    setAdminMenuCollapsed(!adminMenuCollapsed)
  }

  const {
    username,
    accessLevel,
    manualAccess,
    authModalVisible,
    closeModal,
    onSignIn,
    onSignOut,
    onTryAutoSignIn,
    err
  } = props

  useEffect(() => {
    onTryAutoSignIn()
    //Redirecting from Redux errorHandler
    if (err) {
      navigate('/' + err)
    }
  }, [])

  // Lazy loading
  const Users = React.lazy(() => import('./containers/Users/Users'))
  const Instruments = React.lazy(() => import('./containers/Instruments/Instruments'))
  const Groups = React.lazy(() => import('./containers/Groups/Groups'))
  const Message = React.lazy(() => import('./containers/Message/Message'))
  const ExpHistory = React.lazy(() => import('./containers/ExpHistory/ExpHistory'))
  const ParameterSets = React.lazy(() => import('./containers/ParameterSets/ParameterSets'))
  const Submit = React.lazy(() => import('./containers/Submit/Submit'))
  const BatchSubmit = React.lazy(() => import('./containers/BatchSubmit/BatchSubmit'))
  const SearchExperiment = React.lazy(() =>
    import('./containers/SearchExperiment/SearchExperiment')
  )
  const SearchDataset = React.lazy(() => import('./containers/SearchDataset/SearchDataset'))
  const Accounts = React.lazy(() => import('./containers/Accounts/Accounts'))
  const NMRium = React.lazy(() => import('./containers/NMRium/NMRium'))
  const Claim = React.lazy(() => import('./containers/Claim/Claim'))
  const ClaimsHistory = React.lazy(() => import('./containers/ClaimsHistory/ClaimsHistory'))
  const Collections = React.lazy(() => import('./containers/Collections/Collections'))

  //Logic for authentication modal. Different modal is rendered depending whether a user is logged in or not
  let authModal = null
  if (authModalVisible) {
    if (username) {
      authModal = (
        <LogoutModal
          visible={authModalVisible}
          cancelClicked={closeModal}
          okClicked={onSignOut}
          token={props.authToken}
        />
      )
    } else {
      authModal = (
        <LoginModal
          visible={authModalVisible}
          cancelClicked={closeModal}
          signInHandler={onSignIn}
          passwdResetHandler={props.onPasswdReset}
          loading={props.authSpin}
        />
      )
    }
  }

  return (
    <Layout>
      {accessLevel === 'admin' &&
      (location.pathname === '/dashboard' || location.pathname.includes('admin')) ? (
        <Affix className={classes.AdminMenu}>
          <Sider
            trigger={null}
            className={classes.Sider}
            collapsible
            collapsed={adminMenuCollapsed}
          >
            <AdminMenu collapsed={adminMenuCollapsed} />
          </Sider>
        </Affix>
      ) : null}

      <Layout>
        <Affix>
          <Header
            className={classes.Header}
            style={{ background: '#ffffff', paddingLeft: 0, paddingRight: 30 }}
          >
            <NavBar collapsed={adminMenuCollapsed} toggleClicked={toggleAdminMenu} />
          </Header>
        </Affix>
        <Content className={classes.Content}>
          <Suspense fallback={<Spin size='large' tip='Loading ...' style={{ margin: '200px' }} />}>
            <Routes>
              <Route
                path='/admin/users'
                element={accessLevel === 'admin' ? <Users /> : <Navigate to='/dashboard' />}
              />
              <Route
                path='/admin/groups'
                element={accessLevel === 'admin' ? <Groups /> : <Navigate to='/dashboard' />}
              />
              <Route
                path='/admin/message'
                element={accessLevel === 'admin' ? <Message /> : <Navigate to='/dashboard' />}
              />
              <Route
                path='/admin/instruments'
                element={accessLevel === 'admin' ? <Instruments /> : <Navigate to='/dashboard' />}
              />
              <Route
                path='/admin/history'
                element={accessLevel === 'admin' ? <ExpHistory /> : <Navigate to='/dashboard' />}
              />
              <Route
                path='/admin/claims-history'
                element={accessLevel === 'admin' ? <ClaimsHistory /> : <Navigate to='/dashboard' />}
              />
              <Route
                path='/admin/accounts'
                element={accessLevel === 'admin' ? <Accounts /> : <Navigate to='/dashboard' />}
              />
              <Route
                path='/admin/parameter-sets'
                element={accessLevel === 'admin' ? <ParameterSets /> : <Navigate to='/dashboard' />}
              />

              <Route path='/dashboard' element={<Dashboard />} />

              <Route path='/reset/:token' element={<Reset />} />
              <Route
                path='/submit'
                element={
                  username &&
                  import.meta.env.VITE_SUBMIT_ON === 'true' &&
                  accessLevel !== 'user-b' ? (
                    <Submit />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />
              <Route
                path='/batch-submit'
                element={
                  import.meta.env.VITE_BATCH_SUBMIT_ON === 'true' ? (
                    <BatchSubmit />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />
              <Route
                path='/resubmit'
                element={
                  import.meta.env.VITE_BATCH_SUBMIT_ON === 'true' ? (
                    <Resubmit />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />
              <Route
                path='/search-experiment'
                element={
                  import.meta.env.VITE_DATASTORE_ON === 'true' ? (
                    <SearchExperiment />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />
              <Route
                path='/search-dataset'
                element={
                  import.meta.env.VITE_DATASTORE_ON === 'true' ? (
                    <SearchDataset />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />
              <Route
                path='/nmrium/:datasetId'
                element={
                  import.meta.env.VITE_DATASTORE_ON === 'true' ? (
                    <NMRium />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />
              <Route
                path='/claim'
                element={
                  import.meta.env.VITE_DATASTORE_ON === 'true' &&
                  (accessLevel === 'admin' || manualAccess) ? (
                    <Claim />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />
              <Route
                path='/collections/:collectionId'
                element={
                  import.meta.env.VITE_DATASTORE_ON === 'true' ? (
                    <Collections />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />

              <Route path='/500' element={<Error500 />} />
              <Route path='/404' element={<Error404 />} />
              <Route path='/403' element={<Error403 />} />
              <Route path='/admin/dashboard' element={<Navigate to='/dashboard' />} />
              <Route path='/' element={<Navigate to='/dashboard' />} />
              <Route path='*' element={<Error404 />} />
            </Routes>
          </Suspense>
          {authModal}
          <FloatButton.BackTop visibilityHeight={200} style={{ marginBottom: '25px' }} />
        </Content>
        <Footer>
          <Credits />
        </Footer>
      </Layout>
    </Layout>
  )
}

const mapStateToProps = state => {
  return {
    username: state.auth.username,
    authToken: state.auth.token,
    accessLevel: state.auth.accessLevel,
    manualAccess: state.auth.manualAccess,
    authModalVisible: state.auth.authModalVisible,
    authSpin: state.auth.loading,
    err: state.errors.error
  }
}

const mapDispatchToProps = dispatch => {
  return {
    closeModal: () => dispatch(closeAuthModal()),
    onSignIn: formData => dispatch(signInHandler(formData)),
    onSignOut: token => dispatch(signOutHandler(token)),
    onTryAutoSignIn: () => dispatch(authCheckState()),
    onPasswdReset: formData => dispatch(postPasswdReset(formData))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
