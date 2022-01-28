import swaggerJSDoc from 'swagger-jsdoc';

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: GlAuth
 */

export const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gift List API',
      version: '0.1.0',
      description: 'An api for creating and managing gift lists using express and monboose',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/',
      },
    ],
  },
  apis: ['./src/**/*.ts'],
};

export const swaggerConfig = swaggerJSDoc(options);
