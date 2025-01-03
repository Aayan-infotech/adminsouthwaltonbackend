const nodemailer = require('nodemailer');

// Create a nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'mahi.sahai@aayaninfotech.com', // or use your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your password
  },
});

// Function to send email with PDF atta
const sendEmailWithPDF = async (to, subject, text, pdfPath) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
    attachments: [
      {
        filename: 'Agreement.pdf',
        path: pdfPath,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};


// function to send email with PDF attach and the button to the payment screen 
const sendEmailWithPDFandButton = async (to, subject, text, pdfPath, paymentLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: `
      <p>Dear ${user.name},</p>
      <p>${text}</p>
      <p>We have attached the Agreement PDF for your review. Please check it out.</p>
      <p>If you're ready to proceed with the payment, click the button below:</p>
      <a href="${paymentLink}" style="background-color:rgb(70, 198, 207); color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px;">Proceed to Payment</a>
      <br><br>
      <p>Thank you for choosing our service!</p>
    `,
    attachments: [
      {
        filename: 'Agreement.pdf',
        path: pdfPath,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmailWithPDF, sendEmailWithPDFandButton };


// // abcController.js
// const { sendEmailWithPDFandButton } = require("../utils/pdfAgreement")
// api{
//   const result = sendEmailWithPDFandButton("abc@gmail.com", "xyz@gmail.com", "this is a pdf", )
// }