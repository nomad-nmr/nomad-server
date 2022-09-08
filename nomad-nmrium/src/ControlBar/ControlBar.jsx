import React from 'react'

import nomadLogo from '../../assets/nomad-logo.png'
import classes from './ControlBar.module.css'

const ControlBar = props => {
  return (
    <div className={classes.Container}>
      <a href={import.meta.env.VITE_APP_NOMAD_URL + '/search'}>
        <img src={nomadLogo} alt='NOMAD logo' className={classes.Logo} />
      </a>
      <div className={classes.Controls}>
        <button onClick={() => props.saveDataHandler()}>Save</button>
      </div>
    </div>
  )
}

export default ControlBar
