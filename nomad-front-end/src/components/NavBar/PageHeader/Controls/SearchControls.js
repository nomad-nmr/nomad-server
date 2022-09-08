import React from 'react'
import { Button, Switch } from 'antd'

import classes from '../PageHeader.module.css'

const SearchControls = props => {
  const { searchCheckedState, toggleModal, token } = props

  let expsArr = []
  searchCheckedState.forEach(entry => {
    expsArr = [...expsArr, ...entry.exps]
  })

  const searchParams = new URLSearchParams({ expIds: expsArr, token })

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

      <a
        href={process.env.REACT_APP_NMRIUM_URL + '/?' + searchParams.toString()}
        target='_blank'
        rel='noreferrer noopener'
      >
        <Button
          className={classes.Button}
          type='primary'
          disabled={searchCheckedState.length === 0}
        >
          Open NMRium
        </Button>
      </a>
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
