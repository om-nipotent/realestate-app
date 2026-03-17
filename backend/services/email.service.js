const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
};

const sendEmail = async (to, subject, html) => {
  try {
    const transport = createTransporter();
    const info = await transport.sendMail({
      from: `"${process.env.FROM_NAME || 'RealState Platform'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email sending failed: ${error.message}`);
    // Don't throw — email failure shouldn't break the main flow
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏠 RealState Platform</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #1e40af;">Welcome, ${user.name}! 🎉</h2>
        <p style="color: #374151; line-height: 1.6;">Your account has been successfully created as a <strong>${user.role}</strong>.</p>
        <p style="color: #374151; line-height: 1.6;">To start using the platform fully, you need to:</p>
        <ol style="color: #374151; line-height: 2;">
          <li>Verify your identity by uploading official documents</li>
          <li>Wait for admin approval (usually within 24 hours)</li>
          <li>Start ${user.role === 'seller' ? 'listing your properties' : 'browsing and scheduling visits'}</li>
        </ol>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/dashboard"
             style="background: #1e40af; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #6b7280; margin-top: 30px; font-size: 14px;">
          If you have any questions, contact us at support@realstate.com
        </p>
      </div>
    </div>
  `;
  await sendEmail(user.email, 'Welcome to RealState Platform! 🏠', html);
};

const sendVerificationStatusEmail = async (user, status, notes = '') => {
  const isVerified = status === 'verified';
  const color = isVerified ? '#16a34a' : '#dc2626';
  const icon = isVerified ? '✅' : '❌';
  const title = isVerified ? 'Identity Verified!' : 'Verification Rejected';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏠 RealState Platform</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: ${color};">${icon} ${title}</h2>
        <p style="color: #374151;">Hi ${user.name},</p>
        ${isVerified
          ? `<p style="color: #374151; line-height: 1.6;">Congratulations! Your identity has been <strong>verified</strong>. You now have full access to all platform features.</p>`
          : `<p style="color: #374151; line-height: 1.6;">Unfortunately, your identity verification was <strong>rejected</strong>. Please re-submit your documents.</p>`
        }
        ${notes ? `<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;"><strong>Admin Notes:</strong><br/>${notes}</div>` : ''}
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/${user.role}/verification"
             style="background: #1e40af; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            ${isVerified ? 'Go to Dashboard' : 'Re-submit Documents'}
          </a>
        </div>
      </div>
    </div>
  `;

  await sendEmail(
    user.email,
    `${icon} Verification ${isVerified ? 'Approved' : 'Rejected'} — RealState Platform`,
    html
  );
};

const sendInquiryNotification = async (seller, buyer, property, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏠 RealState Platform</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #1e40af;">📩 New Inquiry Received</h2>
        <p style="color: #374151;">Hi ${seller.name},</p>
        <p style="color: #374151;"><strong>${buyer.name}</strong> has sent an inquiry about your property:</p>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong style="color: #1e40af;">🏡 ${property.title}</strong>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong>Message:</strong><br/>${message}
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/seller/dashboard"
             style="background: #1e40af; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Inquiry
          </a>
        </div>
      </div>
    </div>
  `;
  await sendEmail(seller.email, `📩 New Inquiry: ${property.title}`, html);
};

const sendVisitConfirmation = async (buyer, seller, property, visit, status) => {
  const isApproved = status === 'approved';
  const icon = isApproved ? '✅' : '❌';
  const statusText = isApproved ? 'Approved' : 'Rejected';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏠 RealState Platform</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #1e40af;">${icon} Visit Request ${statusText}</h2>
        <p style="color: #374151;">Hi ${buyer.name},</p>
        <p style="color: #374151;">Your visit request for <strong>${property.title}</strong> has been <strong>${statusText.toLowerCase()}</strong> by the seller.</p>
        ${isApproved && visit.confirmedDate ? `
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <strong>📅 Confirmed Date:</strong> ${new Date(visit.confirmedDate).toLocaleDateString()}<br/>
            <strong>🕐 Confirmed Time:</strong> ${visit.confirmedTime || visit.requestedTime}
          </div>
        ` : ''}
        ${visit.sellerNotes ? `<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;"><strong>Seller Notes:</strong><br/>${visit.sellerNotes}</div>` : ''}
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/buyer/dashboard"
             style="background: #1e40af; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Visit Details
          </a>
        </div>
      </div>
    </div>
  `;
  await sendEmail(buyer.email, `${icon} Visit ${statusText}: ${property.title}`, html);
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏠 RealState Platform</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #1e40af;">🔐 Password Reset Request</h2>
        <p style="color: #374151;">Hi ${user.name},</p>
        <p style="color: #374151;">You requested to reset your password. Click the button below to set a new password. This link expires in 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background: #dc2626; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        <p style="color: #6b7280; font-size: 12px; word-break: break-all;">Or copy this link: ${resetUrl}</p>
      </div>
    </div>
  `;
  await sendEmail(user.email, '🔐 Password Reset — RealState Platform', html);
};

const sendVisitRequestEmail = async (seller, buyer, property, visit) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏠 RealState Platform</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #1e40af;">📅 New Visit Request</h2>
        <p style="color: #374151;">Hi ${seller.name},</p>
        <p style="color: #374151;"><strong>${buyer.name}</strong> wants to visit your property:</p>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong>🏡 ${property.title}</strong>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong>📅 Requested Date:</strong> ${new Date(visit.requestedDate).toLocaleDateString()}<br/>
          <strong>🕐 Requested Time:</strong> ${visit.requestedTime}
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/seller/dashboard"
             style="background: #1e40af; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Respond to Visit Request
          </a>
        </div>
      </div>
    </div>
  `;
  await sendEmail(seller.email, `📅 New Visit Request: ${property.title}`, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationStatusEmail,
  sendInquiryNotification,
  sendVisitConfirmation,
  sendPasswordResetEmail,
  sendVisitRequestEmail,
};
