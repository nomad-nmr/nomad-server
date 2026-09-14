import React from 'react'
import logoRound from '../../assets/logo-round.svg'
import classes from './RoundLogo.module.css'

const Logo = () => (
  <div style={{ margin: '10px 0' }}>
    <img src={logoRound} className={classes.LogoImg} style={{ width: '40%', margin: '0 100px' }} />
  </div>
)

export default Logo
