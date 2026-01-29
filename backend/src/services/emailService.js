import nodemailer from 'nodemailer';

// Create transporter (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate response summary for email
const generateResponseSummary = (response) => {
  return response.answers.map(answer => {
    let answerValue = answer.answer;
    if (Array.isArray(answerValue)) {
      answerValue = answerValue.join(', ');
    }
    return `
## ${answer.questionText}
${answerValue}
`;
  }).join('\n');
};

// Send confirmation email to user
export const sendUserConfirmationEmail = async (email, quizTitle, response) => {
  try {
    const summary = generateResponseSummary(response);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Quiz System" <noreply@example.com>',
      to: email,
      subject: `Confirmation: ${quizTitle}`,
      html: `
        <h2>Thank you for completing the quiz!</h2>
        <p>Your response has been submitted successfully.</p>
        
        <h3>Quiz: ${quizTitle}</h3>
        <p><strong>Submitted on:</strong> ${new Date(response.createdAt).toLocaleString()}</p>
        
        <h4>Your Responses:</h4>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${summary}</pre>
        
        <p>We appreciate your time and feedback.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

// Send notification to admin
export const sendAdminNotificationEmail = async (quizTitle, response) => {
  try {
    const summary = generateResponseSummary(response);
    const contactInfo = response.contactInfo || {};
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Quiz System" <noreply@example.com>',
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: `New Quiz Response: ${quizTitle}`,
      html: `
        <h2>New Quiz Submission</h2>
        
        <h3>Quiz: ${quizTitle}</h3>
        <p><strong>Submitted on:</strong> ${new Date(response.createdAt).toLocaleString()}</p>
        
        <h4>Contact Information:</h4>
        <ul>
          ${contactInfo.name ? `<li><strong>Name:</strong> ${contactInfo.name}</li>` : ''}
          ${contactInfo.email ? `<li><strong>Email:</strong> ${contactInfo.email}</li>` : ''}
          ${contactInfo.phone ? `<li><strong>Phone:</strong> ${contactInfo.phone}</li>` : ''}
          ${contactInfo.company ? `<li><strong>Company:</strong> ${contactInfo.company}</li>` : ''}
        </ul>
        
        <h4>Responses:</h4>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${summary}</pre>
        
        <p>View full details in the admin panel.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Error sending admin notification email:', error);
  }
};

export default { sendUserConfirmationEmail, sendAdminNotificationEmail };
