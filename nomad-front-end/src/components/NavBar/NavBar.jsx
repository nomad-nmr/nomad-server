import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { connect } from 'react-redux'
import { Tooltip } from 'antd'

import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons'
import logoWideLight from '../../assets/logo-wide-light.png'

import PageHeader from './PageHeader/PageHeader'
import AuthAvatar from './AuthAvatar/AuthAvatar'
import MainMenu from './MainMenu/MainMenu'
import AccountSettingsModal from './AccountSettingsModal/AccountSettingsModal'

import { getAccountSettings, openAuthModal, saveUserSettings } from '../../store/actions'

import classes from './NavBar.module.css'

const NavBar = props => {
  const location = useLocation()
  const navigate = useNavigate()

  const [modalVisible, setModalVisible] = useState(false)

  // Setting up components for left side of NavBar. Components dynamically change with state of admin sider menu.
  const toggleButton = props.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
  const navLeft =
    props.accessLevel === 'admin' &&
    (location.pathname === '/dashboard' || location.pathname.split('/')[1] === 'admin') ? (
      <Tooltip placement='bottomLeft' title='Admin Menu Toggle'>
        <div className={classes.Toggle} onClick={props.toggleClicked}>
          {toggleButton}
        </div>
      </Tooltip>
    ) : (
      <div>
        <img
          src={logoWideLight}
          alt='NOMAD logo wide'
          className={classes.Logo}
          onClick={() => navigate('/dashboard')}
        />
      </div>
    )

  let menuElement = null

  if (props.username) {
    menuElement = (
      <MainMenu
        username={props.username}
        accessLevel={props.accessLevel}
        manualAccess={props.manualAccess}
      />
    )
  }

  return (
    <nav className={classes.NavBar}>
      {navLeft}
      <PageHeader />
      <div className={classes.MainMenu}>
        {location.pathname !== '/submit' && location.pathname !== '/batch-submit'
          ? menuElement
          : null}
        <div className={classes.Avatar}>
          <AuthAvatar
            onClick={props.openModalHandler}
            username={props.username}
            accessLevel={props.accessLevel}
            toggleAddSample={props.tglAddSample}
            setModalVisible={setModalVisible}
          />
        </div>
      </div>
      <AccountSettingsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        authToken={props.authToken}
        fetchUserData={props.getUserSettings}
        userSettings={props.userAccountSettings}
        onSave={props.saveUserSettings}
      />
    </nav>
  )
}

const mapStateToProps = state => {
  return {
    username: state.auth.username,
    accessLevel: state.auth.accessLevel,
    manualAccess: state.auth.manualAccess,
    authToken: state.auth.token,
    userAccountSettings: state.userAccount.settings
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openModalHandler: () => dispatch(openAuthModal()),
    getUserSettings: token => dispatch(getAccountSettings(token)),
    saveUserSettings: (token, data) => dispatch(saveUserSettings(token, data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavBar)
