// import nodemailer from 'nodemailer';
// import config from '../config/config.js';

// export const sendWelcomeEmail = async ({ email, firstname, temporaryPassword }) => {
//   try {
//     // Validate SMTP configuration
//     validateSmtpConfig(config.smtp);

//     // Create a transporter using SMTP
//     const transporter = createEmailTransporter(config.smtp);

//     // Prepare email content
//     const mailOptions = {
//       from: `"TopInfo" <${config.smtp.user}>`,
//       to: email,
//       subject: 'Welcome to TopInfo',
//       html: generateWelcomeEmailHtml(firstname, temporaryPassword)
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);
//     console.log(`Welcome email sent to ${email}`);
//   } catch (error) {
//     console.error('Failed to send welcome email:', error);
//     throw error;
//   }
// };
// export const sendServiceProvider = async ({ email, firstname }) => {
//   try {
//     // Validate SMTP configuration
//     validateSmtpConfig(config.smtp);

//     // Create a transporter using SMTP
//     const transporter = createEmailTransporter(config.smtp);

//     // Prepare email content
//     const mailOptions = {
//       from: `"TopInfo" <${config.smtp.user}>`,
//       to: email,
//       subject: 'Getting Supporter Information',
//       html: generateServiceProviderEmailHtml(firstname)
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);
//     console.log(`Welcome email sent to ${email}`);
//   } catch (error) {
//     console.error('Failed to send welcome email:', error);
//     throw error;
//   }
// };

// // Helper function to validate SMTP configuration
// const validateSmtpConfig = (smtpConfig) => {
//   const requiredFields = ['host', 'port', 'user', 'pass'];
//   const missingFields = requiredFields.filter(field => !smtpConfig[field]);

//   if (missingFields.length > 0) {
//     throw new Error(`Incomplete SMTP configuration: Missing ${missingFields.join(', ')}`);
//   }
// };

// // Helper function to create email transporter
// const createEmailTransporter = (smtpConfig) => {
//   return nodemailer.createTransport({
//     host: smtpConfig.host,
//     port: smtpConfig.port,
//     secure: smtpConfig.secure,
//     auth: {
//       user: smtpConfig.user,
//       pass: smtpConfig.pass
//     }
//   });
// };

// // Helper function to generate welcome email HTML
// const generateWelcomeEmailHtml = (firstname, temporaryPassword) => `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//     <h1>Welcome to TopInfo</h1>
//     <p>Hi ${firstname},</p>
//     <p>Your account has been created successfully.</p>
//     <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
//     <p>Please log in and change your password immediately.</p>
//     <p>Best regards,<br>TopInfo Team</p>
//   </div>
// `;
// const generateServiceProviderEmailHtml = (firstname) => `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//     <p>Hi ${firstname},</p>
//     <p>Here is you service provider.</p>
//     <p>Name : <strong>BYAMUNGU Lewis</strong></p>
//     <p>Email : <strong>byamungulewis@gmail.com</strong></p>
//     <p>Phone : <strong>+250785436135</strong></p>
//     <p>Best regards,<br>TopInfo Team</p>
//   </div>
// `;

import nodemailer from 'nodemailer';
import config from '../config/config.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const sendWelcomeEmail = async ({ email, firstname, temporaryPassword }) => {
  try {
    validateSmtpConfig(config.smtp);
    const transporter = createEmailTransporter(config.smtp);
    
    const mailOptions = {
      from: `"TopInfo" <${config.smtp.user}>`,
      to: email,
      subject: 'Welcome to TopInfo',
      html: generateWelcomeEmailHtml(firstname, temporaryPassword)
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

// export const sendServiceProvider = async ({ email, firstname }) => {
//   try {
//     validateSmtpConfig(config.smtp);
//     const transporter = createEmailTransporter(config.smtp);
    
//     const mailOptions = {
//       from: `"TopInfo" <${config.smtp.user}>`,
//       to: email,
//       subject: 'Service Provider Information',
//       html: generateServiceProviderEmailHtml(firstname)
//     };
    
//     await transporter.sendMail(mailOptions);
//     console.log(`Service provider email sent to ${email}`);
//   } catch (error) {
//     console.error('Failed to send service provider email:', error);
//     throw error;
//   }
// };



// export const sendServiceProvider = async ({ email, firstname, requestId }) => {
//   try {
//     // Validate SMTP configuration
//     validateSmtpConfig(config.smtp);
//     const transporter = createEmailTransporter(config.smtp);

//     // Assuming you have the request object or its details available
//     const request = await prisma.request.findUnique({
//       where: { id: requestId }, // You'll need to pass the requestId
//       select: {
//         service_location: true,
//         service_category_id: true
//       }
//     });
    
//     // Find approved service providers
//     const serviceProviders = await prisma.serviceProvider.findMany({
//       where: {
//         approved: true,
//         service_category_id: request.service_category_id,
//         districts: {
//           contains: request.service_location
//         }
//       },
//       select: {
//         firstname: true,
//         lastname: true,
//         email: true,
//         phone: true,
//         location_district: true
//       }
//     });
    
//     // If no providers found, send a support contact email
//     if (serviceProviders.length === 0) {
//       const mailOptions = {
//         from: `"TopInfo" <${config.smtp.user}>`,
//         to: email,
//         subject: 'Support Request - TopInfo',
//         html: `
//           <p>Dear ${firstname},</p>
//           <p>Murakoze gukoresha TopInfo.</p>
//           <p>Umunyamwuga ukorera mukarere mwahisemo ntago ahise aboneka</p>
//           <p>Kubufasha bwihutirwa, mwahamagara:</p>
//           <ul>
//             <li>Numero ya Serivisi: +250785293828</li>
//             <li>Imeyili: support@topinfo.com</li>
//           </ul>
//           <p>Abakozi bacu baraza kubavugisha babafashe</p>
//           <p>Murakoze,<br>TopInfo</p>
//         `
//       };
      
//       // Send the support contact email
//       await transporter.sendMail(mailOptions);
      
//       return; // Exit the function after sending the support email
//     }
    
//     // Select the first matching provider
//     const selectedProvider = serviceProviders[0];
    
//     const mailOptions = {
//       from: `"TopInfo" <${config.smtp.user}>`,
//       to: email,
//       subject: 'Service Provider Assigned',
//       html: `
//         <p>Dear ${firstname},</p>
//         <p>A service provider has been assigned to your request:</p>
//         <h3>Provider Details:</h3>
//         <ul>
//           <li><strong>Name:</strong> ${selectedProvider.firstname} ${selectedProvider.lastname}</li>
//           <li><strong>Contact:</strong> ${selectedProvider.phone}</li>
//           <li><strong>Email:</strong> ${selectedProvider.email}</li>
//           <li><strong>District:</strong> ${selectedProvider.location_district}</li>
//         </ul>
//         <p>We'll be in touch soon.</p>
//         <p>Thank you for using our services!</p>
//       `
//     };
    
//     // Send email using the transporter
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error('Error in service provider email:', error);
//     throw error;
//   }
// };

export const sendServiceProvider = async ({ email, firstname, requestId, phone }) => {
  try {
    // Validate SMTP configuration
    validateSmtpConfig(config.smtp);
    const transporter = createEmailTransporter(config.smtp);

    // Find the request with its message preference
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        service_location: true,
        service_category_id: true,
        message_preference: true,
        client: {
          select: {
            phone: true,
            email: true
          }
        }
      }
    });

    // Find approved service providers
    const serviceProviders = await prisma.serviceProvider.findMany({
      where: {
        approved: true,
        service_category_id: request.service_category_id,
        districts: {
          contains: request.service_location
        }
      },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        location_district: true
      }
    });

    // If no providers found, send a support contact email/SMS
    if (serviceProviders.length === 0) {
      await sendSupportNotification(request, firstname, email, phone);
      return;
    }

    // Select the first matching provider
    const selectedProvider = serviceProviders[0];

    // Send notification based on message preference
    await sendProviderNotification(request, selectedProvider, firstname, email, phone);

  } catch (error) {
    console.error('Error in service provider notification:', error);
    throw error;
  }
};

const sendSupportNotification = async (request, firstname, email, phone) => {
  const supportMessage = `
Dear ${firstname},

Murakoze gukoresha TopInfo.

Umunyamwuga ukorera mukarere mwahisemo ntago ahise aboneka

Kubufasha bwihutirwa, mwahamagara:

Numero ya Serivisi: +250785293828
Imeyili: support@topinfo.com

Abakozi bacu baraza kubavugisha babafashe

Murakoze,
TopInfo
  `;

  // Send notification based on message preference
  if (request.message_preference === 'SMS' || request.message_preference === 'BOTH') {
    await sendSms({
      phoneNumber: request.client.phone || phone,
      message: supportMessage,
      sender: 'TopInfo'
    });
  }

  if (request.message_preference === 'EMAIL' || request.message_preference === 'BOTH') {
    const mailOptions = {
      from: `"TopInfo" <${config.smtp.user}>`,
      to: request.client.email || email,
      subject: 'Support Request - TopInfo',
      html: supportMessage
    };
    await createEmailTransporter(config.smtp).sendMail(mailOptions);
  }
};

const sendProviderNotification = async (request, selectedProvider, firstname, email, phone) => {
  const providerMessage = `
Dear ${firstname},

A service provider has been assigned to your request:

Provider Details:
Name: ${selectedProvider.firstname} ${selectedProvider.lastname}
Contact: ${selectedProvider.phone}
Email: ${selectedProvider.email}
District: ${selectedProvider.location_district}

We'll be in touch soon.

Thank you for using our services!
  `;

  // Send notification based on message preference
  if (request.message_preference === 'SMS' || request.message_preference === 'BOTH') {
    await sendSms({
      phoneNumber: request.client.phone || phone,
      message: providerMessage,
      sender: 'TopInfo'
    });
  }

  if (request.message_preference === 'EMAIL' || request.message_preference === 'BOTH') {
    const mailOptions = {
      from: `"TopInfo" <${config.smtp.user}>`,
      to: request.client.email || email,
      subject: 'Service Provider Assigned',
      html: providerMessage
    };
    await createEmailTransporter(config.smtp).sendMail(mailOptions);
  }
};

const sendSms = async ({ phoneNumber, message, sender }) => {
  try {
    // First, login to get the authentication token
    const loginResponse = await axios.post('https://call-afric-aaba9bbf4c5c.herokuapp.com/api/auth/login', {
      email: config.sms.email,
      password: config.sms.password
    });

    const token = loginResponse.data.token;

    // Then send the SMS
    await axios.post('https://call-afric-aaba9bbf4c5c.herokuapp.com/api/sendSms', 
      {
        phoneNumber,
        message,
        sender
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

const validateSmtpConfig = (smtpConfig) => {
  const requiredFields = ['host', 'port', 'user', 'pass'];
  const missingFields = requiredFields.filter(field => !smtpConfig[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Incomplete SMTP configuration: Missing ${missingFields.join(', ')}`);
  }
};

const createEmailTransporter = (smtpConfig) => {
  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass
    }
  });
};

const generateWelcomeEmailHtml = (firstname, temporaryPassword) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
      .email-container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: white; 
        border-radius: 10px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .email-header { 
        background-color: #87CEEB; 
        color: white; 
        padding: 20px; 
        text-align: center; 
      }
      .email-body { 
        padding: 20px; 
        background-color: white; 
      }
      .temp-password { 
        background-color: #f4f4f4; 
        padding: 10px; 
        border-radius: 5px; 
        margin: 15px 0; 
        text-align: center;
        font-size: 18px;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>Welcome to TopInfo</h1>
      </div>
      <div class="email-body">
        <p>Hi ${firstname},</p>
        <p>Your account has been created successfully. To get started, please use the temporary password below:</p>
        <div class="temp-password">
          ${temporaryPassword}
        </div>
        <p>Please log in and change your password immediately for security purposes.</p>
        <p>Best regards,<br>TopInfo Team</p>
      </div>
    </div>
  </body>
  </html>
`;


export const sendContactEmail = async ({ name, email, subject, message }) => {
  try {
    // Validate SMTP configuration
    validateSmtpConfig(config.smtp);
    const transporter = createEmailTransporter(config.smtp);

    const mailOptions = {
      from: `"TopInfo Contact Form" <${config.smtp.user}>`,
      to: 'topinforwanda@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: generateContactEmailHtml(name, email, subject, message)
    };
    
    // Send email using the transporter
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
};


const generateContactEmailHtml = (name, email, subject, message) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
      .email-container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: white; 
        border-radius: 10px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .email-header { 
        background-color: #87CEEB; 
        color: white; 
        padding: 20px; 
        text-align: center; 
      }
      .email-body { 
        padding: 20px; 
        background-color: white; 
      }
      .contact-info { 
        background-color: #f4f4f4; 
        padding: 15px; 
        border-radius: 5px; 
        margin: 15px 0; 
      }
      .info-label { 
        font-weight: bold; 
        color: #333; 
        margin-right: 10px; 
      }
      .message-content {
        background-color: #f9f9f9;
        border-left: 4px solid #87CEEB;
        padding: 15px;
        margin: 15px 0;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>New Contact Form Submission</h1>
      </div>
      <div class="email-body">
        <div class="contact-info">
          <p><span class="info-label">Name:</span> ${name}</p>
          <p><span class="info-label">Email:</span> ${email}</p>
          <p><span class="info-label">Subject:</span> ${subject}</p>
        </div>
        <div class="message-content">
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        <p>Please respond to the sender at ${email}</p>
      </div>
    </div>
  </body>
  </html>
`;