// src/swagger.config.js
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the applications',
    },
    servers: [
      {
        url: 'http://localhost:3050', // Base URL for your API
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to your route files for annotations
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
