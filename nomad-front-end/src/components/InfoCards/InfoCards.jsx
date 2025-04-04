import React from 'react'
import { useNavigate } from 'react-router-dom'

import InfoCard from './InfoCard/InfoCard'
import classes from './InfoCards.module.css'

const infoCards = props => {
  const navigate = useNavigate()

  return (
    <div className={classes.InfoCards}>
      {props.cardsData
        ? props.cardsData.map(card => {
            return (
              <div
                key={card.key}
                onClick={() => {
                  if (card.rackOpen) {
                    navigate('/batch-submit')
                  } else {
                    props.clicked(card.key.toString())
                  }
                }}
              >
                <InfoCard data={card} />
              </div>
            )
          })
        : []}
    </div>
  )
}

export default infoCards
