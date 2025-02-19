import { Modal } from 'antd'

const infoModals = {
  rackType: () =>
    Modal.info({
      title: 'Tip',
      content: (
        <div>
          <p>
            <strong>Group :</strong> Rack assigned to a batch-submission group that can be processed
            on any instrument.
          </p>
          <p>
            <strong>Instrument :</strong> Rack assigned to an instrument that can be also set to
            have restricted access and be available only to selected groups or users.
          </p>
        </div>
      )
    }),

  restrictAccess: () =>
    Modal.info({
      title: 'Tip',
      content: (
        <div>
          <p>You can select users or groups that are allowed to use the rack</p>
          <p>
            If neither user nor group is selected the access to rack will not be restricted and any
            user can add samples to the rack.
          </p>
        </div>
      )
    })
}

export default infoModals
