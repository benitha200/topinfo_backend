

// import nodemailer from 'nodemailer';
// import config from '../config/config.js';

// export const sendWelcomeEmail = async ({ email, firstname, temporaryPassword }) => {
//   try {
//     // Validate SMTP configuration
//     if (!config.smtp.host || !config.smtp.port || !config.smtp.user || !config.smtp.pass) {
//       throw new Error('Incomplete SMTP configuration');
//     }

//     // Create a transporter using SMTP
//     let transporter = nodemailer.createTransport({
//       host: config.smtp.host,
//       port: config.smtp.port,
//       secure: config.smtp.secure,
//       auth: {
//         user: config.smtp.user,
//         pass: config.smtp.pass
//       }
//     });

//     // Email content
//     const mailOptions = {
//       from: `"TopInfo" <${config.smtp.user}>`,
//       to: email,
//       subject: 'Welcome to TopInfo',
//       html: `
//         <p>Welcome, ${firstname}!</p>
        
//         <p>Your account has been created successfully.</p>
        
//         <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
        
//         <p>Please log in and change your password immediately.</p>
//       `
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);
//     console.log(`Welcome email sent to ${email}`);
//   } catch (error) {
//     console.error('Failed to send welcome email:', error);
//     throw error;
//   }
// };

import nodemailer from 'nodemailer';
import config from '../config/config.js';

export const sendWelcomeEmail = async ({ email, firstname, temporaryPassword }) => {
  try {
    // Validate SMTP configuration
    validateSmtpConfig(config.smtp);

    // Create a transporter using SMTP
    const transporter = createEmailTransporter(config.smtp);

    // Prepare email content
    const mailOptions = {
      from: `"TopInfo" <${config.smtp.user}>`,
      to: email,
      subject: 'Welcome to TopInfo',
      html: generateWelcomeEmailHtml(firstname, temporaryPassword)
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

// Helper function to validate SMTP configuration
const validateSmtpConfig = (smtpConfig) => {
  const requiredFields = ['host', 'port', 'user', 'pass'];
  const missingFields = requiredFields.filter(field => !smtpConfig[field]);

  if (missingFields.length > 0) {
    throw new Error(`Incomplete SMTP configuration: Missing ${missingFields.join(', ')}`);
  }
};

// Helper function to create email transporter
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

// Helper function to generate welcome email HTML
const generateWelcomeEmailHtml = (firstname, temporaryPassword) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Welcome to TopInfo</h1>
    <p>Hi ${firstname},</p>
    <p>Your account has been created successfully.</p>
    <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
    <p>Please log in and change your password immediately.</p>
    <p>Best regards,<br>TopInfo Team</p>
  </div>
`;