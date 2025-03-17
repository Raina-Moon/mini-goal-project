import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    clientId: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_CLIENT_SECRET,
    user: process.env.EMAIL_USER,
    refreshToken: process.env.EMAIL_REFRESH_TOKEN,
  },
});

export const sendVerificationCode = async (
  email: string,
  resetToken: number
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Password Reset Code",
    text: `Your verification code is: ${resetToken}`,
  });
};
