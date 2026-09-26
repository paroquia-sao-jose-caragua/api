export const userPaths = {
  '/sessions': {
    post: {
      summary: 'Autentica usuário e gera token JWT',
      description:
        'Autentica um usuário com email e senha, retornando um token JWT para acesso aos endpoints protegidos.',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'janedoe@example.com',
                },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'SenhaSegura123!',
                },
              },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Autenticação bem-sucedida',
          headers: {
            'Set-Cookie': {
              description: 'Cookie HTTP-only contendo o refresh token',
              schema: {
                type: 'string',
                example:
                  'refreshToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    example:
                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMUs3V0NYMlI0OEE4TkpZV0FGUU4zS0NOKCIsImlhdCI6MTY5NzE2MjYzNn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                    description: 'Token JWT para autenticação',
                  },
                },
                required: ['token'],
              },
            },
          },
        },
        401: {
          description: 'Falha na autenticação',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/InvalidCredentialsResponse',
              },
            },
          },
        },
      },
    },
  },
  '/token/refresh': {
    post: {
      summary: 'Renova token JWT usando refresh token',
      description:
        'Gera um novo token JWT válido usando o refresh token armazenado no cookie HTTP-only.',
      tags: ['Users'],
      responses: {
        200: {
          description: 'Token renovado com sucesso',
          headers: {
            'Set-Cookie': {
              description: 'Novo cookie HTTP-only contendo o refresh token',
              schema: {
                type: 'string',
                example:
                  'refreshToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    example:
                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMUs3V0NYMlI0OEE4TkpZV0FGUU4zS0NOKCIsImlhdCI6MTY5NzE2MjYzNn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                    description: 'Novo token JWT para autenticação',
                  },
                },
                required: ['token'],
              },
            },
          },
        },
        401: {
          description: 'Refresh token ausente ou inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UnauthorizedResponse',
              },
            },
          },
        },
      },
    },
  },
  '/users': {
    post: {
      summary: 'Registra novo usuário',
      description:
        'Registra um novo usuário no sistema. Somente administradores podem criar usuários.',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RegisterUserRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Usuário registrado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
        400: {
          description: 'Erro de validação ou email já em uso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/users/{id}/resend-invite': {
    post: {
      summary: 'Reenvia convite para usuário pendente',
      description:
        'Gera um novo token de convite válido por 48 horas e dispara o e-mail de acesso. Apenas para usuários com status pendente.',
      tags: ['Users'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID do usuário pendente',
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        200: {
          description: 'Convite reenviado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Convite reenviado com sucesso.',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Usuário não possui status pendente',
        },
        404: {
          description: 'Usuário não encontrado',
        },
      },
    },
  },
};
