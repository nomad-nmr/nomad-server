export const autoExperimentsOpenApiDoc = {
  get: {
    summary: 'Get all auto experiments',
    description: 'Get a list of all auto experiments',
    tags: ['NMR Data'],
    parameters: [
      {
        in: 'query',
        name: 'solvent',
        schema: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
        }
      },
      {
        in: 'query',
        name: 'instrumentId',
        schema: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
        }
      },
      {
        in: 'query',
        name: 'parameterSet',
        schema: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
        }
      },
      {
        in: 'query',
        name: 'title',
        schema: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
        }
      },
      {
        in: 'query',
        name: 'startDate',
        schema: {
          type: 'string',
          format: 'date'
        }
      },
      {
        in: 'query',
        name: 'endDate',
        schema: {
          type: 'string',
          format: 'date'
        }
      },
      {
        in: 'query',
        name: 'groupId',
        schema: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
        }
      },
      {
        in: 'query',
        name: 'userId',
        schema: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
        }
      },
      {
        in: 'query',
        name: 'datasetName',
        schema: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
        }
      },
      {
        in: 'query',
        name: 'offset',
        schema: {
          type: 'integer'
        }
      },
      {
        in: 'query',
        name: 'limit',
        schema: {
          type: 'integer'
        }
      }
    ],
    responses: {
      200: {
        description: 'All auto experiments',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string'
                  },
                  datasetName: {
                    type: 'string'
                  },
                  expNo: {
                    type: 'string'
                  },
                  parameterSet: {
                    type: 'string'
                  },
                  parameters: {
                    type: 'string'
                  },
                  title: {
                    type: 'string'
                  },
                  instrument: {
                    type: 'string'
                  },
                  user: {
                    type: 'string'
                  },
                  group: {
                    type: 'string'
                  },
                  solvent: {
                    type: 'string'
                  }
                }
              }
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
