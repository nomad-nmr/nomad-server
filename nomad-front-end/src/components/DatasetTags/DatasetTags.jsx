import React, { useState, useRef, Fragment } from 'react'
import { Tag, Input, theme } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const DatasetTags = props => {
  const { token } = theme.useToken()
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  const handleInputChange = e => {
    setInputValue(e.target.value)
  }

  const tagPlusStyle = {
    background: token.colorBgContainer,
    borderStyle: 'dashed'
  }

  const tagChild = props.tags.map(tag => {
    const tagElem = (
      <Tag
        closable
        // onClose={e => {
        //   e.preventDefault()
        //   handleClose(tag)
        // }}
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
          //   onBlur={handleInputConfirm}
          //   onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag onClick={() => setInputVisible(true)} style={tagPlusStyle}>
          <PlusOutlined /> New Tag
        </Tag>
      )}
    </Fragment>
  )
}

export default DatasetTags
