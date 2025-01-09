import React from 'react'
import { Button, Space, Divider, Tooltip, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  DownloadOutlined,
  ShareAltOutlined,
  SaveOutlined,
  FolderAddOutlined
} from '@ant-design/icons'

import CopyLinkToClipboard from '../../../CopyLinkToClipboard/CopyLinkToClipboard'
import { skimNMRiumdata } from '../../../../utils/nmriumUtils'
import nmriumLogo from '../../../../assets/nmrium-logo.svg'
import classes from '../PageHeader.module.css'

const NMRiumControls = props => {
  const navigate = useNavigate()

  const addExperiments = () => {
    props.addExpsHandler()
    navigate('/search-experiment')
  }
  const { dataset, token, saveHandler, accessLevel, username } = props
  const { molecules, spectra, correlations } = props.data.data
  const saveAsDisabled = props.data.data.spectra.length === 0
  const saveDisabled = !dataset.id || username !== dataset.user.username

  const onSaveAs = () => {
    if (
      molecules.length === 0 &&
      spectra.length === 1 &&
      correlations.values.length === 0 &&
      spectra[0].integrals.values.length === 0 &&
      spectra[0].ranges.values.length === 0 &&
      spectra[0].peaks.values.length === 0 &&
      spectra[0].filters.length === 0
    ) {
      return Modal.error({
        width: 500,
        title: 'Dataset does not contain enough information!',
        content: (
          <div>
            <p>
              Saving a single experiment without any information added in a form of processing or a
              chemical structure does not make sense.
            </p>
            <p>
              Please note that individual raw experiments can be reopened from experiment search.
            </p>
          </div>
        )
      })
    }
    props.toggleDatasetModal()
  }

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
          icon={<SaveOutlined />}
          onClick={() => {
            const payload = skimNMRiumdata(props.data)
            saveHandler(dataset.id, payload, token)
          }}
        >
          Save
        </Button>
        <Button icon={<SaveOutlined />} disabled={saveAsDisabled} onClick={() => onSaveAs()}>
          Save As
        </Button>
        <Tooltip title='Add dataset to collection'>
          <Button
            icon={<FolderAddOutlined />}
            disabled={saveDisabled}
            onClick={() => props.toggleColModal()}
          >
            Add
          </Button>
        </Tooltip>
        <Divider type='vertical' />

        <CopyLinkToClipboard>
          <Button type='primary' icon={<ShareAltOutlined />} disabled={!dataset.id}>
            Share
          </Button>
        </CopyLinkToClipboard>
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
