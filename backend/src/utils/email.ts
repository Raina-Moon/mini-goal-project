import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail", 
  auth: {
    user: process.env.EMAIL_USER,    
    pass: process.env.EMAIL_PASSWORD, 
  },
});

export const sendVerificationCode = async (toEmail: string, code: number) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your Password Reset Code",
    text: `Your verification code is: ${code}`,
  };

  return transporter.sendMail(mailOptions);
};
