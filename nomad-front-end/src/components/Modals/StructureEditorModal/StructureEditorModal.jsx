import React, { useCallback, useState } from 'react'
import { Modal } from 'antd'
import { StructureEditor } from 'react-ocl/full'

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
      <StructureEditor
        svgMenu
        fragment={false}
        onChange={useCallback((netMolfile, molecule) => {
          setSmilesState(molecule.toSmiles())
        })}
      />
    </Modal>
  )
}

export default StructureEditorModal
