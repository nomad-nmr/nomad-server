import React from 'react'
import { Button, Radio } from 'antd'
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
    navigate('/nmrium')
  }

  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.RadioContainer}>
        <Radio.Group
          onChange={event => props.toggleForm(event.target.value)}
          value={props.dataType}
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

      <Button
        className={classes.Button}
        onClick={() => toggleModal()}
        disabled={searchCheckedState.length === 0}
      >
        Download
      </Button>
    </div>
  )
}

export default SearchControls
