import React from 'react'
import { Button, Switch } from 'antd'
import { useNavigate } from 'react-router-dom'

import classes from '../PageHeader.module.css'

const SearchControls = props => {
  const { searchCheckedState, toggleModal, token } = props
  const navigate = useNavigate()

  const openNMRiumHandler = () => {
    let expsArr = []
    searchCheckedState.forEach(entry => {
      expsArr = [...expsArr, ...entry.exps]
    })
    props.fetchNMRium(expsArr, token)
    navigate('/nmrium')
  }

  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.SwitchElement}>
        <label>Search Form</label>
        <Switch
          size='small'
          checked={props.showForm}
          checkedChildren='On'
          unCheckedChildren='Off'
          onChange={props.toggleForm}
        />
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
