// import nodemailer from 'nodemailer';
// import config from '../config/config.js';

// export const sendWelcomeEmail = async ({ email, firstname, temporaryPassword }) => {
//   // Create a transporter using SMTP
//   let transporter = nodemailer.createTransport({
//     host: config.smtp.host,
//     port: config.smtp.port,
//     secure: config.smtp.secure,
//     auth: {
//       user: config.smtp.user,
//       pass: config.smtp.pass
//     }
//   });

//   // Email content
//   const mailOptions = {
//     from: `"Your Platform" <${config.smtp.user}>`,
//     to: email,
//     subject: 'Welcome to Our Platform',
//     html: `
//       <h1>Welcome, ${firstname}!</h1>
//       <p>Your account has been created successfully.</p>
//       <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
//       <p>Please log in and change your password immediately.</p>
//       <a href="${config.appUrl}/login">Login Here</a>
//     `
//   };

//   // Send email
//   await transporter.sendMail(mailOptions);
// };

import nodemailer from 'nodemailer';
import config from '../config/config.js';

export const sendWelcomeEmail = async ({ email, firstname, temporaryPassword }) => {
  try {
    // Validate SMTP configuration
    if (!config.smtp.host || !config.smtp.port || !config.smtp.user || !config.smtp.pass) {
      throw new Error('Incomplete SMTP configuration');
    }

    // Create a transporter using SMTP
    let transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });

    // Email content
    const mailOptions = {
      from: `"Your Platform" <${config.smtp.user}>`,
      to: email,
      subject: 'Welcome to Our Platform',
      html: `
        <p>Welcome, ${firstname}!</p>
        
        <p>Your account has been created successfully.</p>
        
        <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
        
        <p>Please log in and change your password immediately.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};