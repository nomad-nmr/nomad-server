import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { Tooltip } from 'antd'

import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons'
import logoWideLight from '../../assets/logo-wide-light.png'

import PageHeader from './PageHeader/PageHeader'
import AuthAvatar from './AuthAvatar/AuthAvatar'
import MainMenu from './MainMenu/MainMenu'

import { openAuthModal } from '../../store/actions'

import classes from './NavBar.module.css'

const NavBar = props => {
  const location = useLocation()
  const navigate = useNavigate()

  // Setting up components for left side of NavBar. Components dynamically change with state of admin sider menu.
  const toggleButton = props.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
  const navLeft =
    props.accessLevel === 'admin' ? (
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
          onClick={() => {
            if (!props.accessLevel || props.accessLevel === 'user-b') {
              return
            } else {
              navigate('/dashboard')
            }
          }}
        />
      </div>
    )

  let menuElement = null

  if (props.username) {
    menuElement = <MainMenu username={props.username} accessLevel={props.accessLevel} />
  }

  return (
    <nav className={classes.NavBar}>
      {navLeft}
      <PageHeader />
      <div className={classes.MainMenu}>
        {location.pathname !== '/search' && location.pathname !== '/batch-submit' ? menuElement : null}
        <div className={!menuElement ? classes.Avatar : undefined}>
          <AuthAvatar
            onClick={props.openModalHandler}
            username={props.username}
            accessLevel={props.accessLevel}
            toggleAddSample={props.tglAddSample}
          />
        </div>
      </div>
    </nav>
  )
}

const mapStateToProps = state => {
  return {
    username: state.auth.username,
    accessLevel: state.auth.accessLevel
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openModalHandler: () => dispatch(openAuthModal())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavBar)
