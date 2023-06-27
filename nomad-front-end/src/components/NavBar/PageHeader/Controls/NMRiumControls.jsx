import React from 'react'
import { Button, Space, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'

import nmriumLogo from '../../../../assets/nmrium-logo.svg'
import classes from '../PageHeader.module.css'

const NMRiumControls = props => {
  const navigate = useNavigate()

  const addExperiments = () => {
    props.addExpsHandler()
    navigate('/search')
  }

  const saveData = () => {
    //Converting to JSON with replacer function replace float64Arrays that would converted incorrectly otherwise
    const nmriumJSON = JSON.stringify(props.data, (k, v) =>
      ArrayBuffer.isView(v) ? Array.from(v) : v
    )
    props.saveHandler(nmriumJSON, props.token)
  }

  const saveAsDisabled = props.data.data.spectra.length === 0

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
          disabled={!props.dataSet.id}
          onClick={() => console.log('save dataset')}
        >
          Save
        </Button>
        <Button disabled={saveAsDisabled} onClick={() => props.toggleDatasetModal()}>
          Save As
        </Button>
      </Space>
    </div>
  )
}

export default NMRiumControls
