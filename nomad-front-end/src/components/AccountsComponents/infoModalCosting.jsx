import React from 'react'
import { Alert } from 'antd'

const infoModalConfig = {
  title: 'Accounting Calculations',
  width: 800,
  content: (
    <div>
      You can switch between three types of accounting calculations
      <div style={{ marginTop: '5px' }}>
        <strong>Grants</strong>
      </div>
      <p>
        This calculation will work only if grants have been preset and it is based on instrument
        costing and costing multiplier in the time of archiving of the experiments. In "Set Grants"
        table you can assign either individual users or whole group to a grant. If you assign
        individual user and his own group to two different grants, the experiments that were
        originated by the user will be charged to the grant corresponding to the user and not to the
        one corresponding to the whole group.
      </p>
      <Alert
        message='If there are experiments originated by a user/s who was not assigned to a grant in the time of archiving the calculation issues a warning with corresponding username/s which allows to amend the results by using users type calculation'
        type='warning'
      />
      <div style={{ marginTop: '10px' }}>
        <strong>Groups</strong>
      </div>
      <p>
        Groups calculation provides total sums of total experimental times (including overhead
        times) and corresponding costs for groups. Costs are calculated using instrument costings
        that are set in the costing table in the time of calculation.
        <Alert
          message='Invalid costs will be obtained if costing has changed between archiving and calculation. Total experimental time values remain valid and can be use to calculate correct costs if if costing in the time of archiving is known'
          type='warning'
        />
      </p>
      <strong>Users</strong>
      <p>
        Users calculation is similar to the previous one. A group can be selected from drop down
        menu and total experimental times and costs are listed for individual users who were in the
        group in the time of archiving of the experiments. If "--all--" option is selected the
        calculation will be performed for all users who archived an experiment in the given period
        of time.
      </p>
      <Alert
        message='If "--all--" option is used the calculation will not register if a user moved from one group to another between the dates used for the calculation and sums of all experiments acquired by the user regardless of the group will be resulted.'
        type='warning'
      />
    </div>
  )
}

export default infoModalConfig
