import React from 'react'
import InfoCard from './InfoCard/InfoCard'
import classes from './InfoCards.module.css'

const infoCards = props => {
	return (
		<div className={classes.InfoCards}>
			{props.cardsData
				? props.cardsData.map(card => {
						return (
							<div key={card.key} onClick={() => props.clicked(card.key.toString())}>
								<InfoCard data={card} />
							</div>
						)
				  })
				: []}
		</div>
	)
}

export default infoCards
