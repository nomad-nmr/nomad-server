import Experiment from '../../models/experiment.js'
import User from '../../models/user.js'
import JSZip from 'jszip'
import path from 'path'
import fs from 'fs/promises'

const datastorePath = process.env.DATASTORE_PATH || '/app/datastore'
export async function getAutoExperiments(req, res) {
  const {
    solvent,
    instrumentId,
    parameterSet,
    title,
    startDate,
    endDate,
    groupId,
    userId,
    datasetName,
    offset,
    limit
  } = req.query

  try {
    const searchParams = {}

    const dataAccess = await req.user.getDataAccess()
    switch (dataAccess) {
      case 'user':
        searchParams['user.id'] = req.user._id
        break
      case 'group':
        searchParams.$or = [
          { 'user.id': req.user._id },
          {
            'group.id': req.user.group
          }
        ]
        if (userId !== undefined) {
          searchParams['user.id'] = {
            $in: userId.split(',')
          }
        }
        break
      case 'admin-b':
      case 'admin':
        if (groupId !== undefined) {
          searchParams['group.id'] = {
            $in: groupId.split(',')
          }
        }
        if (userId !== undefined) {
          searchParams['user.id'] = {
            $in: userId.split(',')
          }
        }
        break

      default:
        throw new Error('Data access rights unknown')
    }

    if (solvent !== undefined) {
      searchParams['solvent'] = {
        $in: solvent.split(',')
      }
    }

    if (instrumentId !== undefined) {
      searchParams['instrument.id'] = {
        $in: instrumentId.split(',')
      }
    }

    if (parameterSet !== undefined) {
      searchParams['parameterSet'] = {
        $in: parameterSet.split(',')
      }
    }

    if (title !== undefined) {
      searchParams['title'] = {
        $in: title.split(',')
      }
    }

    if (startDate !== undefined) {
      searchParams['submittedAt'] = {
        $gte: new Date(startDate)
      }
    }

    if (endDate !== undefined) {
      searchParams['submittedAt'] = {
        $lt: new Date(endDate)
      }
    }

    if (datasetName !== undefined) {
      searchParams['datasetName'] = {
        $in: datasetName.split(',')
      }
    }

    let experiments = await Experiment.find(searchParams).skip(offset).limit(limit)

    res.json(
      experiments.map(exp => ({
        id: exp.expId,
        datasetName: exp.datasetName,
        expNo: exp.expNo,
        parameterSet: exp.parameterSet,
        parameters: exp.parameters,
        title: exp.title,
        instrument: exp.instrument.id,
        user: exp.user.id,
        group: exp.group.id,
        solvent: exp.solvent,
        submittedAt: exp.submittedAt
      }))
    )
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export const downloadAutoExperimentOpenApiDoc = {
  post: {
    summary: 'Download auto experiments',
    description: 'Download a zip file of raw auto experiment data',
    tags: ['NMR Data'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        schema: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
        }
      }
    ],
    responses: {
      200: {
        description: 'Zip file of raw auto experiment data',
        content: {
          'application/zip': {
            schema: {
              type: 'string',
              format: 'binary'
            }
          }
        }
      },
      403: {
        description: 'Forbidden. Did you forget to authenticate?',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
              example: 'Please authenticate'
            }
          }
        }
      }
    }
  }
}

export async function downloadAutoExperiments(req, res) {
  const { id } = req.query
  try {
    const searchParams = {}

    const dataAccess = await req.user.getDataAccess()
    switch (dataAccess) {
      case 'user':
        searchParams['user.id'] = req.user._id
        break
      case 'group':
        searchParams.$or = [
          { 'user.id': req.user._id },
          {
            'group.id': req.user.group
          }
        ]
        break
      case 'admin-b':
      case 'admin':
        break

      default:
        throw new Error('Data access rights unknown')
    }

    if (id !== undefined) {
      searchParams['expId'] = {
        $in: id.split(',')
      }
    }

    let experiments = await Experiment.find(searchParams)

    const mainZip = new JSZip()

    await Promise.all(
      experiments.map(async experiment => {
        const zipFilePath = path.join(datastorePath, experiment.dataPath, experiment.expId + '.zip')

        const zipFile = await fs.readFile(zipFilePath)
        const zipObject = await JSZip.loadAsync(zipFile)
        const zipContent = await zipObject.generateAsync({
          type: 'nodebuffer'
        })
        await mainZip.loadAsync(zipContent, { createFolders: true })
      })
    )

    const user = await User.findById(req.user._id)
    user.stats.downloadCount += 1
    await user.save()

    mainZip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(res)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
