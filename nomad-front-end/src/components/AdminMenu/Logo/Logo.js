import React from 'react'
import logoRound from '../../../assets/logo-round-small.png'
import logoWideDark from '../../../assets/logo-wide-dark.png'
import TweenOne from 'rc-tween-one'

import classes from './Logo.module.css'

const Logo = props => {
  let logoImg = (
    <TweenOne
      animation={{
        x: 0,
        duration: 700,
        scale: 1
      }}
      style={{ transform: 'translateX(-200px) scale(0)' }}
    >
      <img src={logoWideDark} alt='NOMAD logo wide dark' />
    </TweenOne>
  )

  if (props.collapsed) {
    logoImg = (
      <TweenOne
        animation={{
          opacity: 1,
          scale: 1,
          rotate: 360,
          duration: 700
          // delay: 100
        }}
        style={{ opacity: 0, transform: 'scale(0)' }}
      >
        <img src={logoRound} alt='NOMAD logo round' />
      </TweenOne>
    )
  }

  return (
    <div className={classes.Logo} onClick={() => props.history.push('/dashboard')}>
      {logoImg}
    </div>
  )
}

export default Logo
