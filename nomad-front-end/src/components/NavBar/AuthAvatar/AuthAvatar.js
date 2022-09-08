import React from 'react'
import { Avatar, Popover } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import classes from './AuthAvatar.module.css'

const AuthAvatar = props => {
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

      default:
        break
    }

    avatarEl = (
      <Popover
        placement='bottomRight'
        title={
          <>
            Signed in as <strong>{props.username}</strong>
          </>
        }
        content={
          <span className={classes.Popover} onClick={() => props.onClick(null)}>
            Sign out
          </span>
        }
      >
        <Avatar size='large' className={assignedClasses.join(' ')} onClick={() => props.onClick(null)}>
          {props.username[0].toUpperCase()}
        </Avatar>
      </Popover>
    )
  } else {
    avatarEl = (
      <Avatar size='large' className={assignedClasses.join(' ')} onClick={() => props.onClick(null)}>
        {<UserOutlined />}
      </Avatar>
    )
  }

  return avatarEl
}

export default AuthAvatar
