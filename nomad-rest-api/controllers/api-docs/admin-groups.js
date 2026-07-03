export const getGroupsOpenApiDoc = {
  get: {
    summary: 'Get groups',
    description: 'Retrieve groups. Use `list=true` to get a compact list for selects.',
    tags: ['Admin Groups'],
    parameters: [
      {
        in: 'query',
        name: 'showInactive',
        schema: {
          type: 'boolean'
        }
      },
      {
        in: 'query',
        name: 'list',
        schema: {
          type: 'boolean'
        }
      }
    ],
    responses: {
      200: {
        description: 'Array of groups',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  groupName: { type: 'string' },
                  description: { type: 'string' },
                  isBatch: { type: 'boolean' },
                  isActive: { type: 'boolean' },
                  userCount: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      401: { description: 'Unauthorized' },
      500: { description: 'API error' }
    }
  }
}

export const addGroupOpenApiDoc = {
  post: {
    summary: 'Add a new group',
    description: 'Create a new group (admin only)',
    tags: ['Admin Groups'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              groupName: { type: 'string' },
              description: { type: 'string' },
              isBatch: { type: 'boolean' },
              addCustomList: { type: 'boolean' },
              dataAccess: { type: 'string' },
              expList: { type: 'array', items: { type: 'string' } }
            },
            required: ['groupName']
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Group created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                groupName: { type: 'string' },
                description: { type: 'string' },
                isBatch: { type: 'boolean' },
                addCustomList: { type: 'boolean' },
                dataAccess: { type: 'string' },
                expList: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      422: { description: 'Validation error' },
      500: { description: 'API error' }
    }
  }
}
