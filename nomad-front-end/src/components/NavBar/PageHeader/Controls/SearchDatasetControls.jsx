import React from 'react'
import { Radio } from 'antd'

import classes from '../PageHeader.module.css'

const SearchDatasetControls = props => {
  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.RadioContainer}>
        <Radio.Group
          onChange={event => props.onDisplayChange(event.target.value)}
          value={props.displayType}
          optionType='button'
          buttonStyle='solid'
        >
          <Radio value='table'>Table</Radio>
          <Radio value='cards'>Cards</Radio>
        </Radio.Group>
      </div>
    </div>
  )
}

export default SearchDatasetControls
