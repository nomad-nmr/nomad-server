import React from 'react'

import nightIcon from '../../assets/night-mode.svg'
import dayIcon from '../../assets/sunny-day.svg'

const NightDay = props => {
	if (process.env.REACT_APP_SUBMIT_ON === 'false') {
		return null
	} else if (props.night) {
		return <img src={nightIcon} style={{ height: '18px' }} alt='night icon' />
	} else {
		return <img src={dayIcon} style={{ height: '18px' }} alt='day icon' />
	}
}

export default NightDay
