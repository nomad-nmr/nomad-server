export const postUserOpenApiDoc = {
  post: {
    summary: 'Create a new user',
    description: 'Create a new user (admin only)',
    tags: ['Admin Users'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              email: { type: 'string', format: 'email' },
              fullName: { type: 'string' },
              accessLevel: { type: 'string' },
              manualAccess: { type: 'boolean' },
              dataAccess: { type: 'string' },
              groupId: { type: 'string' },
              isActive: { type: 'boolean' }
            },
            required: ['username', 'email', 'fullName', 'groupId']
          }
        }
      }
    },
    responses: {
      201: {
        description: 'User created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                username: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                accessLevel: { type: 'string' },
                manualAccess: { type: 'boolean' },
                dataAccess: { type: 'string' },
                group: { type: 'string' },
                isActive: { type: 'boolean' }
              }
            }
          }
        }
      },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
      403: {
        description: 'Forbidden, Did you forget to authenticate?',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
              example: 'Please authenticate as user with admin access level'
            }
          }
        }
      },
      422: { description: 'Validation error' }
    }
  }
}

export const deleteUsersOpenApiDoc = {
  post: {
    summary: 'Delete or inactivate users',
    description: 'Delete users without experiments, otherwise mark them inactive',
    tags: ['Admin Users'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              userIds: { type: 'array', items: { type: 'string' } }
            },
            required: ['users']
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Delete/inactivate result',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                deletedUsers: { type: 'array', items: { type: 'string' } },
                inactivatedUsers: { type: 'array', items: { type: 'string' } }
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

export const updateUserOpenApiDoc = {
  put: {
    summary: 'Update user',
    description: 'Update an existing user (admin only)',
    tags: ['Admin Users'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              fullName: { type: 'string' },
              groupId: { type: 'string' },
              accessLevel: { type: 'string' },
              manualAccess: { type: 'boolean' },
              dataAccess: { type: 'string' },
              isActive: { type: 'boolean' }
            },
            required: ['_id', 'email', 'fullName', 'groupId']
          }
        }
      }
    },
    responses: {
      201: {
        description: 'User updated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                username: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                group: { type: 'string' },
                lastLogin: { type: 'string' },
                inactiveDays: { type: 'string' }
              }
            }
          }
        }
      },
      404: { description: 'User not found' },
      422: { description: 'Validation error' },
      500: { description: 'API error' }
    }
  }
}

export const toggleActiveOpenApiDoc = {
  patch: {
    summary: 'Toggle user active status',
    description: 'Toggle `isActive` for a user',
    tags: ['Admin Users'],
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string' }
      }
    ],
    responses: {
      200: {
        description: 'Status updated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                _id: { type: 'string' }
              }
            }
          }
        }
      },
      404: { description: 'User not found' },
      500: { description: 'API error' }
    }
  }
}

export const getUsersOpenApiDoc = {
  get: {
    summary: 'Get users',
    description: 'Retrieve users with paging and filters; set `list=true` for compact lists',
    tags: ['Admin Users'],
    parameters: [
      { in: 'query', name: 'showInactive', schema: { type: 'boolean' } },
      { in: 'query', name: 'pageSize', schema: { type: 'integer' } },
      { in: 'query', name: 'current', schema: { type: 'integer' } },
      { in: 'query', name: 'accessLevel', schema: { type: 'string' } },
      { in: 'query', name: 'group', schema: { type: 'string' } },
      { in: 'query', name: 'username', schema: { type: 'string' } },
      {
        in: 'query',
        name: 'lastLoginOrder',
        schema: { type: 'string', enum: ['ascend', 'descend'] }
      },
      { in: 'query', name: 'list', schema: { type: 'boolean' } },
      { in: 'query', name: 'search', schema: { type: 'boolean' } }
    ],
    responses: {
      200: {
        description: 'Paged users result',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                users: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      username: { type: 'string' },
                      fullName: { type: 'string' },
                      accessLevel: { type: 'string' },
                      group: {
                        type: 'object',
                        properties: { _id: { type: 'string' }, groupName: { type: 'string' } }
                      },
                      lastLogin: { type: 'string' },
                      inactiveDays: { type: 'string' }
                    }
                  }
                },
                total: { type: 'integer' }
              }
            }
          }
        }
      },
      500: { description: 'API error' }
    }
  }
}
