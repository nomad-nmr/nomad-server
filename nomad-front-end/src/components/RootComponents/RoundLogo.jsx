import React from 'react'
import TweenOne from 'rc-tween-one'
import logoRound from '../../assets/logo-round.png'

const Logo = () => (
  <div style={{ marginTop: '10px' }}>
    <TweenOne
      animation={{
        opacity: 1,
        scale: 1,
        rotate: 360,
        duration: 700,
        delay: 500
      }}
      style={{ opacity: 0, transform: 'scale(0)' }}
    >
      <img src={logoRound} style={{ width: '40%', margin: '0 100px' }} />
    </TweenOne>
  </div>
)

export default Logo
