import React from 'react'
import { Avatar, Popover } from 'antd'
import { useNavigate } from 'react-router'
import { UserOutlined, LogoutOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons'
import classes from './AuthAvatar.module.css'

const AuthAvatar = props => {
  const navigate = useNavigate()

  const assignedClasses = [classes.AuthAvatar]

  let avatarEl
  if (props.username) {
    switch (props.accessLevel) {
      case 'admin':
        assignedClasses.push(classes.Admin)
        break
      case 'admin-b':
        assignedClasses.push(classes.AdminB)
        break
      case 'user':
        assignedClasses.push(classes.User)
        break
      case 'user-a':
        assignedClasses.push(classes.UserA)
        break
      case 'user-b':
        assignedClasses.push(classes.UserB)
        break
      case 'user-d':
        assignedClasses.push(classes.UserD)
        break

      default:
        break
    }

    avatarEl = (
      <Popover
        placement='bottomRight'
        title={
          <div style={{ marginBottom: '10px' }}>
            Signed in as <strong>{props.username}</strong>
          </div>
        }
        content={
          <ul>
            <li className={classes.Popover}>
              <SettingOutlined />
              <span className={classes.Popover} onClick={() => props.setModalVisible(true)}>
                Account Settings
              </span>
            </li>
            {props.accountsAccess && (
              <li className={classes.Popover}>
                <BarChartOutlined />
                <span className={classes.Popover} onClick={() => navigate('/group-accounts')}>
                  Accounting
                </span>
              </li>
            )}
            <li className={classes.Popover}>
              <LogoutOutlined />
              <span className={classes.Popover} onClick={() => props.onClick(null)}>
                Sign out
              </span>
            </li>
          </ul>
        }
      >
        <Avatar
          size='large'
          className={assignedClasses.join(' ')}
          // onClick={() => props.onClick(null)}
        >
          {props.username[0].toUpperCase()}
        </Avatar>
      </Popover>
    )
  } else {
    avatarEl = (
      <Avatar
        size='large'
        className={assignedClasses.join(' ')}
        onClick={() => props.onClick(null)}
      >
        {<UserOutlined />}
      </Avatar>
    )
  }

  return avatarEl
}

export default AuthAvatar
