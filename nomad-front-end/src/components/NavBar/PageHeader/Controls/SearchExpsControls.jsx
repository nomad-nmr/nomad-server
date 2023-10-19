import React from 'react'
import { Button, Radio, Popconfirm } from 'antd'
import { useNavigate } from 'react-router-dom'

import classes from '../PageHeader.module.css'

const SearchControls = props => {
  const { searchCheckedState, toggleModal, token, dataType } = props
  const navigate = useNavigate()

  const openNMRiumHandler = () => {
    let expsArr = []
    searchCheckedState.forEach(entry => {
      expsArr = [...expsArr, ...entry.exps]
    })
    props.fetchNMRium(expsArr, token, dataType)
    navigate('/nmrium/null')
  }

  const spanStyle = { fontWeight: 600, color: '#0958d9' }
  const fairWarningtext = (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ color: '#f5222d' }}>
        Downloading data for individual NMR experiments to your computer might not be the best
        practise!
      </div>
      <div>
        NOMAD keeps your NMR data <span style={spanStyle}>F.A.I.R</span> (
        <span style={spanStyle}>F</span>aindable, <span style={spanStyle}>A</span>ccessible,{' '}
        <span style={spanStyle}>I</span>nteroperable, <span style={spanStyle}>R</span>
        eusable).
      </div>
      <div>That is hard to achieve in the file system of your PC.</div>
      <div style={{ color: '#389e0d' }}>
        Please, note that you can use <span style={{ fontWeight: 600 }}>NMRium</span> to inspect and
        analyse your data on the NOMAD platform.
      </div>
    </div>
  )

  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.RadioContainer}>
        <Radio.Group
          onChange={event => props.toggleForm(event.target.value)}
          value={props.dataType}
          optionType='button'
          buttonStyle='solid'
        >
          <Radio value='auto'>Auto</Radio>
          <Radio value='manual'>Manual</Radio>
        </Radio.Group>
      </div>

      <Button
        className={classes.Button}
        type='primary'
        disabled={searchCheckedState.length === 0}
        onClick={() => openNMRiumHandler()}
      >
        {props.addingToNMRium ? 'Add to NNMRium' : 'Open in NMRium'}
      </Button>

      <Popconfirm
        placement='bottom'
        title={<div style={{ fontSize: '16px', fontWeight: 600 }}>F.A.I.R data warning</div>}
        description={fairWarningtext}
        okButtonProps={{ size: 'middle' }}
        okText='Open in NMRium'
        cancelText='Proceed to Download'
        onCancel={() => toggleModal()}
        onConfirm={() => openNMRiumHandler()}
      >
        <Button className={classes.Button} disabled={searchCheckedState.length === 0}>
          Download
        </Button>
      </Popconfirm>
    </div>
  )
}

export default SearchControls
