import React from 'react'
import { message } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const CopyLinkToClipboard = props => {
  return (
    <CopyToClipboard
      text={props.id ? window.location.origin + '/nmrium/' + props.id : window.location.href}
      onCopy={() => message.success('Dataset link copied to clipboard')}
    >
      {props.children}
    </CopyToClipboard>
  )
}

export default CopyLinkToClipboard
