import React from 'react'
import { Button, Space, Divider, message, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { DownloadOutlined, ShareAltOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { skimNMRiumdata } from '../../../../utils/nmriumUtils'
import nmriumLogo from '../../../../assets/nmrium-logo.svg'
import classes from '../PageHeader.module.css'

const NMRiumControls = props => {
  const navigate = useNavigate()

  const addExperiments = () => {
    props.addExpsHandler()
    navigate('/search')
  }
  const { dataset, token, saveHandler, accessLevel, username } = props
  const saveAsDisabled = props.data.data.spectra.length === 0
  const saveDisabled =
    !dataset.id || (accessLevel !== 'admin' && username !== dataset.user.username)

  return (
    <div className={classes.ExtraContainer}>
      <img src={nmriumLogo} alt='NMRium logo' />
      <Space>
        <span className={classes.Text}>Add : </span>
        <Button type='primary' onClick={() => addExperiments()}>
          Experiments
        </Button>
        <Button onClick={() => props.toggleFidsModal()}>FIDs</Button>
        <Divider type='vertical' />
        <Button
          type='primary'
          disabled={saveDisabled}
          onClick={() => {
            const payload = skimNMRiumdata(props.data)
            saveHandler(dataset.id, payload, token)
          }}
        >
          Save
        </Button>
        <Button disabled={saveAsDisabled} onClick={() => props.toggleDatasetModal()}>
          Save As
        </Button>
        <Divider type='vertical' />
        <CopyToClipboard
          text={window.location.href}
          onCopy={() => message.success('Dataset link copied to clipboard')}
        >
          <Button type='primary' icon={<ShareAltOutlined />} disabled={!dataset.id}>
            Share
          </Button>
        </CopyToClipboard>
        <Tooltip title='Download dataset in Bruker format'>
          <Button
            icon={<DownloadOutlined />}
            disabled={!dataset.id}
            onClick={() => props.downloadHandler(dataset.id, dataset.title, token)}
          >
            Download
          </Button>
        </Tooltip>
      </Space>
    </div>
  )
}

export default NMRiumControls
