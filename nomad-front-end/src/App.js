import React, { useState, Suspense, useEffect } from 'react'
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  closeAuthModal,
  signInHandler,
  signOutHandler,
  authCheckState,
  postPasswdReset
} from './store/actions'

import { Layout, Spin, BackTop, Affix } from 'antd'
import classes from './App.module.css'
import './App.less'

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

const { Header, Sider, Content, Footer } = Layout

const App = props => {
  const [adminMenuCollapsed, setAdminMenuCollapsed] = useState(true)
  const navigate = useNavigate()

  const toggleAdminMenu = () => {
    setAdminMenuCollapsed(!adminMenuCollapsed)
  }

  const {
    username,
    accessLevel,
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
  }, [onTryAutoSignIn, err, navigate])

  // Lazy loading
  const Users = React.lazy(() => import('./containers/Users/Users'))
  const Instruments = React.lazy(() => import('./containers/Instruments/Instruments'))
  const Groups = React.lazy(() => import('./containers/Groups/Groups'))
  const Message = React.lazy(() => import('./containers/Message/Message'))
  const ExpHistory = React.lazy(() => import('./containers/ExpHistory/ExpHistory'))
  const ParameterSets = React.lazy(() => import('./containers/ParameterSets/ParameterSets'))
  const Submit = React.lazy(() => import('./containers/Submit/Submit'))
  const BatchSubmit = React.lazy(() => import('./containers/BatchSubmit/BatchSubmit'))
  const Search = React.lazy(() => import('./containers/Search/Search'))
  // const Grants = React.lazy(() => import('./containers/Grants/Grants'))
  const Accounts = React.lazy(() => import('./containers/Accounts/Accounts'))

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
      {accessLevel === 'admin' ? (
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
          <Header className={classes.Header}>
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
                path='/admin/accounts'
                element={accessLevel === 'admin' ? <Accounts /> : <Navigate to='/dashboard' />}
              />
              <Route
                path='/admin/parameter-sets'
                element={accessLevel === 'admin' ? <ParameterSets /> : <Navigate to='/dashboard' />}
              />
              {/* <Route
                path='/admin/grants'
                element={accessLevel === 'admin' ? <Grants /> : <Navigate to='/dashboard' />}
      />*/}
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/reset/:token' element={<Reset />} />
              <Route
                path='/submit'
                element={
                  username &&
                  process.env.REACT_APP_SUBMIT_ON === 'true' &&
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
                  process.env.REACT_APP_BATCH_SUBMIT_ON === 'true' ? (
                    <BatchSubmit />
                  ) : (
                    <Navigate to='/dashboard' />
                  )
                }
              />
              <Route
                path='/search'
                element={
                  process.env.REACT_APP_DATASTORE_ON === 'true' ? (
                    <Search />
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
          <BackTop visibilityHeight={200} style={{ marginBottom: '25px' }} />
        </Content>
        <Footer className={classes.Footer}>
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
