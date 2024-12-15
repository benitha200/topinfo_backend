// import express, { json } from 'express';
// import cors from 'cors';
// import config from './config/config.js';
// import routes from './routes/index.routes.js';
// import { errorHandler } from './middleware/error.middleware.js';
// import swaggerUi from 'swagger-ui-express';
// const app = express();import swaggerDocs from './swagger/swagger.js';


// // CORS configuration
// const corsOptions = {
//   origin: [
//     'http://localhost:5173',
//     'http://topinfo.rw',
//     'https://topinfo.rw'
//   ],
//   credentials: true,
//   methods: ['GET', 'PUT', 'POST', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
// };

// // Apply CORS middleware
// app.use(cors(corsOptions));

// // Middleware
// // app.use(cors({ origin: config.corsOrigin }));
// app.use(express.json());

// // Swagger setup
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// // Routes
// app.use('/api', routes);

// // Error handling
// app.use(errorHandler);

// // Start server
// app.listen(config.port, () => {
//   console.log(`Server is running on port ${config.port}`);
//   console.log(`Swagger docs available at http://localhost:${config.port}/api-docs`);
// });

// export default app;


import https from 'https';
import fs from 'fs';
import express, { json } from 'express';
import cors from 'cors';
import config from './config/config.js';
import routes from './routes/index.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger/swagger.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://topinfo.rw',
    'https://topinfo.rw'
  ],
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/api', routes);

// Error handling
app.use(errorHandler);

// Load SSL certificates
const privateKey = fs.readFileSync('/etc/letsencrypt/live/topinfo.rw/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/topinfo.rw/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/topinfo.rw/fullchain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };


// Start HTTPS server
https.createServer(credentials, app).listen(3050, () => {
  console.log('HTTPS Server is running on port 3050');
  console.log('Swagger docs available at https://topinfo.rw/api-docs');
});


export default app;

