import React, { useState, useRef, Fragment } from 'react'
import { Tag, Input, theme } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const DatasetTags = props => {
  const { token } = theme.useToken()
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  const { tags, datasetId, authToken, patchDataset, inputDisabled } = props

  const handleInputChange = e => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    if (tags.find(tag => tag === inputValue) || inputValue.length === 0) {
      setInputValue('')
      return setInputVisible(false)
    }

    const newTags = [...tags, inputValue.trim()]

    patchDataset(datasetId, newTags, authToken)
    setInputVisible(false)
    setInputValue('')
  }

  const handleClose = removedTag => {
    const newTags = tags.filter(tag => tag !== removedTag)
    patchDataset(datasetId, newTags, authToken)
  }

  const tagPlusStyle = {
    background: token.colorBgContainer,
    borderStyle: 'dashed'
  }

  const tagChild = tags.map(tag => {
    const tagElem = (
      <Tag
        closable={!inputDisabled}
        onClose={e => {
          e.preventDefault()
          handleClose(tag)
        }}
        color='cyan'
      >
        {tag}
      </Tag>
    )
    return (
      <span
        key={tag}
        style={{
          display: 'inline-block'
        }}
      >
        {tagElem}
      </span>
    )
  })

  let inputTag = null

  if (!inputDisabled) {
    inputTag = (
      <Tag onClick={() => setInputVisible(true)} style={tagPlusStyle}>
        <PlusOutlined /> New Tag
      </Tag>
    )
  }

  return (
    <Fragment>
      {tagChild}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type='text'
          size='small'
          style={{
            width: 78
          }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        inputTag
      )}
    </Fragment>
  )
}

export default DatasetTags
