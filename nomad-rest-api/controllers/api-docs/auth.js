export const authLoginOpenApiDoc = {
  post: {
    summary: 'Login to NOMAD',
    description: 'Returns an access token for the user',
    tags: ['Auth'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {
                type: 'string'
              },
              password: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string'
                },
                accessLevel: {
                  type: 'string'
                },
                manualAccess: {
                  type: 'boolean'
                },
                groupName: {
                  type: 'string'
                },
                token: {
                  type: 'string'
                },
                expiresIn: {
                  type: 'number'
                }
              }
            }
          }
        }
      },
      400: {
        description: 'Wrong username or password'
      }
    }
  }
}
