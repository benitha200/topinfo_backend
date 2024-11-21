// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TopInfo API',
      version: '1.0.0',
      description: 'API documentation for the TopInfo backend application.',
    },
    servers: [
      {
        url: 'http://localhost:3050/api', // Base URL of your API
      },
    ],
  },
  components: {
    securitySchemes: {
      // JWT Bearer Token Authentication
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token'
      },
      // Basic Authentication (optional)
      basicAuth: {
        type: 'http',
        scheme: 'basic',
        description: 'Basic authentication using username and password'
      }
    }
  },
  apis: ['./src/routes/*.js'], // Update the path to match your route files
};

const swaggerDocs = swaggerJsdoc(options);
export default swaggerDocs;