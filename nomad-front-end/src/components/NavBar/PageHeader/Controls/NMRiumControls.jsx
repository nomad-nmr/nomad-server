import React from 'react'
import { Button, Space } from 'antd'
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
  return (
    <div className={classes.ExtraContainer}>
      <img src={nmriumLogo} alt='NMRium logo' />
      <Space>
        <Button type='primary' onClick={() => addExperiments()}>
          Add experiments
        </Button>
        {/*<Button type='primary' onClick={() => saveData()}>
          Save
  </Button>*/}
      </Space>
    </div>
  )
}

export default NMRiumControls
