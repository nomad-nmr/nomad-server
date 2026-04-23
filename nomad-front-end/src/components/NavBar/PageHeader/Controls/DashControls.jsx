import React from 'react'
import { useNavigate } from 'react-router'
import { Switch, Button, Space } from 'antd'

import StatusButtons from '../StatusButtons/StatusButtons'

import classes from '../PageHeader.module.css'
import { DownloadOutlined } from '@ant-design/icons'

const DashControls = props => {
  const navigate = useNavigate()
  const submitDisabled =
    !props.accessLevel ||
    props.accessLevel === 'user-d' ||
    props.accessLevel === 'user-b' ||
    import.meta.env.VITE_SUBMIT_ON === 'false'

  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.SwitchElement}>
        <label>Cards</label>
        <Switch
          size='small'
          checked={props.switchOn}
          checkedChildren='On'
          unCheckedChildren='Off'
          onChange={props.toggleCards}
        />
      </div>
      <Space size='large'>
        <StatusButtons data={props.buttonsData} click={props.onButtonClick} />
        <Button
          type='primary'
          onClick={() => navigate('/submit')}
          icon={<DownloadOutlined />}
          disabled={submitDisabled}
        >
          Book New Job
        </Button>
      </Space>
    </div>
  )
}

export default DashControls
