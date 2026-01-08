import React, { useCallback, useState } from 'react'
import { Modal } from 'antd'
import { CanvasMoleculeEditor } from 'react-ocl'

const StructureEditorModal = props => {
  const [smilesState, setSmilesState] = useState(undefined)

  return (
    <Modal
      title='Molecular Structure Editor'
      width={750}
      open={props.open}
      onCancel={() => props.openHandler(false)}
      onOk={() => {
        props.smilesHandler(smilesState)
        props.openHandler(false)
      }}
    >
      <CanvasMoleculeEditor
        width={700}
        height={500}
        fragment={false}
        onChange={useCallback(event => {
          setSmilesState(event.getSmiles())
        })}
      />
    </Modal>
  )
}

export default StructureEditorModal
