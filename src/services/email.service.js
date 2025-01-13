import nodemailer from 'nodemailer';
import config from '../config/config.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import axios from 'axios';

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


export const sendServiceProvider = async ({ email, firstname, requestId, phone }) => {
  try {
    // Validate SMTP configuration
    validateSmtpConfig(config.smtp);
    const transporter = createEmailTransporter(config.smtp);

    console.log("Atleast I have reached Here");

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
    console.log("this is the request Data")
    console.log(request);

    // Find approved service providers
    const serviceProviders = await prisma.serviceProvider.findMany({
      where: {
        // approved: true,
        service_category_id: request.service_category_id,
        // districts: {
        //   contains: request.service_location
        // }
        location_serve: {
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
    await sendProviderNotification(request, selectedProvider, firstname, email, phone, transporter);

  } catch (error) {
    console.error('Error in service provider notification:', error);
    throw error;
  }
};

// Modified sendProviderNotification to accept transporter
const sendProviderNotification = async (request, selectedProvider, firstname, email, phone, transporter) => {
  try {
    // Validate input parameters
    if (!request) {
      throw new Error('Request object is undefined');
    }

    if (!request.message_preference) {
      throw new Error('Message preference is not defined');
    }

    console.log('Send Notification Details:', {
      messagePreference: request.message_preference,
      clientEmail: request.client?.email,
      clientPhone: request.client?.phone,
      fallbackEmail: email,
      fallbackPhone: phone
    });

    //     const providerMessage = `
    // Dear ${firstname},

    // A service provider has been assigned to your request:

    // Provider Details:
    // Name: ${selectedProvider.firstname} ${selectedProvider.lastname}
    // Contact: ${selectedProvider.phone}
    // Email: ${selectedProvider.email}
    // District: ${selectedProvider.location_district}

    // We'll be in touch soon.

    // Thank you for using our services!
    //     `;

    const providerMessage = `
Mukiriya wacu ${firstname},

Wakoze guhitamo gukoresha serivisi zacu

UMUNYAMWUGA WAGUFASHA:
• Amazina: ${selectedProvider.firstname} ${selectedProvider.lastname}
• Telefoni: ${selectedProvider.phone}
• Akarere: ${selectedProvider.location_district}

wamuhamagara ukamusobanurira serivisi ushaka akagufasha. Niba hari ikibazo, mwahamagara +250 785 025 495 cyangwa support@topinfo.com.

Murakoze!
TopInfo
`;



    // Determine recipient details
    const recipientEmail = request.client?.email || email;
    const recipientPhone = request.client?.phone || phone;

    // Validate recipient details before sending
    if (request.message_preference === 'SMS' || request.message_preference === 'BOTH') {
      if (!recipientPhone) {
        console.error('No phone number available for SMS notification');
        throw new Error('No phone number available for SMS');
      }

      try {
        console.log('Attempting to send SMS to:', recipientPhone);
        await sendSms({
          phoneNumber: recipientPhone,
          message: providerMessage,
          sender: 'callafrica'
        });
        console.log('SMS sent successfully');
      } catch (smsError) {
        console.error('Failed to send SMS:', smsError);
        throw smsError;
      }
    }

    if (request.message_preference === 'EMAIL' || request.message_preference === 'BOTH') {
      if (!recipientEmail) {
        console.error('No email address available for email notification');
        throw new Error('No email address available for email');
      }

      try {
        const mailOptions = {
          from: `"TopInfo" <${config.smtp.user}>`,
          to: recipientEmail,
          subject: 'Service Provider Assigned',
          html: providerMessage
        };

        console.log('Attempting to send email to:', recipientEmail);
        console.log('Email options:', mailOptions);

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        throw emailError;
      }
    }
  } catch (error) {
    console.error('Comprehensive notification error:', error);
    throw error; // Rethrow to ensure the error is not silently ignored
  }
};

const sendSupportNotification = async (request, firstname, email, phone) => {
  const supportMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      body { 
        font-family: 'Arial', sans-serif; 
        line-height: 1.6; 
        color: #333; 
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
      }
      .email-container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: white; 
        border-radius: 12px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .email-header { 
        background-color: #4A90E2; 
        color: white; 
        padding: 20px; 
        text-align: center; 
      }
      .email-body { 
        padding: 25px; 
        background-color: white; 
      }
      .support-info { 
        background-color: #F0F8FF; 
        border-left: 5px solid #4A90E2;
        padding: 15px; 
        margin: 20px 0; 
        border-radius: 5px;
      }
      .footer {
        text-align: center;
        color: #777;
        padding: 10px;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>TopInfo - Support Request</h1>
      </div>
      <div class="email-body">
        <p>Muraho ${firstname},</p>
        
        <p>Murakoze gukoresha TopInfo. Twakiriye icyifuzo cyawe.</p>
        
        <div class="support-info">
          <p><strong>Kubufasha bwihutirwa, mwahamagara:</strong></p>
          <p>📞 Numero ya Serivisi: +250785025495</p>
          <p>✉️ Imeyili: support@topinfo.com</p>
        </div>
        
        <p>Umunyamwuga ukorera mukarere mwahisemo ntago ahise aboneka. Abakozi bacu baraza kubavugisha babafashe.</p>
        
        <p>Murakoze cyane,<br>TopInfo Team</p>
      </div>
      <div class="footer">
        © 2024 TopInfo. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  // Send notification based on message preference
  if (request.message_preference === 'SMS' || request.message_preference === 'BOTH') {
    await sendSms({
      phoneNumber: request.client.phone || phone,
      message: 'Muraho. Murakoze gukoresha TopInfo. Kubufasha bwihutirwa, mwahamagara +250 785 025 495 cyangwa support@topinfo.com.',
      sender: 'callafrica'
    });
  }

  if (request.message_preference === 'EMAIL' || request.message_preference === 'BOTH') {
    const mailOptions = {
      from: `"TopInfo Support" <${config.smtp.user}>`,
      to: request.client.email || email,
      subject: 'Icyifuzo Cyawe - TopInfo Support',
      html: supportMessage
    };
    await createEmailTransporter(config.smtp).sendMail(mailOptions);
  }
};


const sendSms = async ({ phoneNumber, message, sender }) => {
  try {
    console.log('SMS Send Details:', { phoneNumber, sender });

    // Validate phone number
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Login to get the authentication token
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "email": config.sms.email,
      "password": config.sms.password
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    console.log('Attempting SMS login');
    const loginResponse = await fetch("https://call-afric-aaba9bbf4c5c.herokuapp.com/api/auth/login", requestOptions);
    const loginData = await loginResponse.json();

    if (loginData.message !== "Login successfully") {
      console.error('SMS Login failed:', loginData);
      throw new Error('SMS Login failed');
    }

    const token = loginData.data.token;

    // Send SMS using the token
    console.log('Sending SMS with token');
    const smsResponse = await fetch('https://call-afric-aaba9bbf4c5c.herokuapp.com/api/sendSms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({
        phoneNumber,
        message,
        sender
      })
    });

    const smsData = await smsResponse.json();
    console.log('SMS Response:', smsData);

    if (smsData.status !== "success") {
      console.error('SMS sending failed:', smsData);
      throw new Error('Error sending SMS');
    }

    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Comprehensive SMS sending error:', error);
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

export async function sendPasswordResetEmail({ email, firstname, resetToken }) {
  try {
    // Validate SMTP configuration
    validateSmtpConfig(config.smtp);

    // Create transporter using the existing helper function
    const transporter = createEmailTransporter(config.smtp);

    // Construct password reset link
    const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    // Prepare mail options with styled HTML
    const mailOptions = {
      from: `"TopInfo" <${config.smtp.user}>`,
      to: email,
      subject: 'Password Reset Request',
      html: generatePasswordResetEmailHtml(firstname, resetLink)
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`Password reset email sent to ${email}`);
    console.log('Email send info:', info);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

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

const generatePasswordResetEmailHtml = (firstname, resetLink) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      body { 
        font-family: 'Arial', sans-serif; 
        line-height: 1.6; 
        color: #333; 
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
      }
      .email-container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: white; 
        border-radius: 12px; 
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
        padding: 25px; 
        background-color: white; 
      }
      .reset-link { 
        display: inline-block;
        background-color: #87CEEB; 
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 15px 0;
      }
      .expiry-note {
        background-color: #f0f0f0;
        border-left: 5px solid #87CEEB;
        padding: 10px;
        margin: 15px 0;
        font-size: 0.9em;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="email-body">
        <p>Hi ${firstname},</p>
        <p>You have requested to reset your password. Click the button below to proceed:</p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" class="reset-link">Reset Password</a>
        </div>
        
        <div class="expiry-note">
          <p>⏰ This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        
        <p>Best regards,<br>TopInfo Team</p>
      </div>
    </div>
  </body>
  </html>
`;